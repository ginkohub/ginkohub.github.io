<script>
	import { onMount, tick } from 'svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { marked } from 'marked';
	import { tools } from '$lib/ai/tools.js';
	import { DEFAULT_SYSTEM_PROMPT } from '$lib/ai/prompts.js';
	import { aiMemory } from '$lib/ai/memory.svelte';
	import { i18n } from '$lib/state/i18n.svelte';
	import { purgePuterSession, softPurgePuterSession } from '$lib/services/watchdog.js';

	let { accentColor, onCommand, context = {} } = $props();

	// Logic State
	let input = $state('');
	let isLoading = $state(false);
	let isInputVisible = $state(false);
	let statusMessage = $state(''); // For tool calls
	let userMessage = $state(''); // The last message sent by user
	let notification = $state(null); // The final AI response
	let selectedModel = $state('gpt-4o');
	let inputElement = $state(null);
	let messages = $state([]);
	let abortController = $state(null); // Controller for interruption

	let systemContent = $state(DEFAULT_SYSTEM_PROMPT);
	let cleanupTimeout;

	onMount(() => {
		const savedPrompt = localStorage.getItem('ginkohub_system_prompt');
		if (savedPrompt) systemContent = savedPrompt;
	});

	function toggleInput() {
		// If loading, this button acts as INTERRUPT
		if (isLoading) {
			abortController?.abort();
			isLoading = false;
			statusMessage = 'INTERRUPTED';
			notification = { text: 'Process aborted by user.', type: 'error' };
			startCleanup();
			setTimeout(() => {
				isInputVisible = true;
			}, 200); // Re-show input
			return;
		}

		isInputVisible = !isInputVisible;
		if (isInputVisible) {
			// Clear previous activity
			userMessage = '';
			statusMessage = '';
			notification = null;

			// Force focus
			setTimeout(async () => {
				await tick();
				inputElement?.focus();
			}, 150);
		} else {
			statusMessage = '';
		}
	}

	function startCleanup() {
		clearTimeout(cleanupTimeout);
		cleanupTimeout = setTimeout(() => {
			notification = null;
			userMessage = '';
			statusMessage = '';
		}, 15000); // 15s for better readability
	}

	async function sendMessage() {
		if (!input.trim() || isLoading) return;

		// Initialize new AbortController
		abortController = new AbortController();

		if (typeof window === 'undefined' || !window.puter) {
			notification = { text: 'Puter SDK not loaded.', type: 'error' };
			return;
		}

		userMessage = input.trim();
		const userMsg = { role: 'user', content: userMessage };
		messages = [...messages.slice(-10), userMsg];

		const currentInput = input;
		input = '';
		isLoading = true;
		isInputVisible = false; // HIDE IMMEDIATELY
		statusMessage = 'SYNCHRONIZING...';
		notification = null;

		try {
			const dynamicContext = `
[LONG-TERM MEMORY]
- Saved Info: ${aiMemory.getAll() || 'None'}

[SYSTEM] Time: ${context.time}, Tab: ${context.activeTab}, Accent: ${context.accent}, Overload: ${context.overloaded ? 'YES' : 'NO'}
${context.news ? `- NEWS: ${context.news.feed}\n- HEADLINES: ${context.news.headlines.join(' | ')}` : ''}
${context.github ? `- GITHUB TRENDS (${context.github.mode} / ${context.github.language}): ${context.github.items.join(' | ')}` : ''}
${context.words ? `- WORD SEARCH (${context.words.query}): ${context.words.results.join(', ')}` : ''}
${context.humor ? `- JOKE: ${context.humor.joke}\n- MEME: ${context.humor.meme}` : ''}
${context.about ? `- STATS: ${context.about.stats}\n- CONTACTS: ${context.about.contacts.join(', ')}` : ''}
${context.game ? `- PLAYING: ${context.game.playing}` : ''}
${context.preview ? `- PREVIEWING: ${context.preview.url} (${context.preview.title})` : ''}
`;
			const systemMsg = { role: 'system', content: systemContent + dynamicContext };
			let currentMessages = [systemMsg, ...messages.filter((m) => m.role !== 'protocol')];

			// Note: Puter SDK currently might not support signal directly in all methods,
			// but we handle the logic flow interruption here.
			// If the SDK supports fetch options, we would pass { signal: abortController.signal }

			while (true) {
				// Check interrupt before next step
				if (abortController.signal.aborted) throw new Error('Aborted');

				const response = await window.puter.ai.chat(currentMessages, {
					model: selectedModel,
					tools: tools,
					stream: false
				});

				if (abortController.signal.aborted) throw new Error('Aborted');

				const message = response.message;
				currentMessages.push(message);

				if (message.tool_calls) {
					for (const toolCall of message.tool_calls) {
						if (abortController.signal.aborted) throw new Error('Aborted');

						const functionName = toolCall.function.name;
						const args = JSON.parse(toolCall.function.arguments);

						statusMessage = `INVOKING: ${functionName.toUpperCase()}`;

						let result = 'Success';
						if (onCommand) {
							const cmdResult = await onCommand(functionName, args);
							if (cmdResult) result = cmdResult;
						}

						currentMessages.push({
							role: 'tool',
							tool_call_id: toolCall.id,
							content: result
						});
					}
					continue;
				}

				const assistantMsg = { role: 'assistant', content: message.content || '' };
				messages = [...messages, assistantMsg];
				notification = { text: message.content };
				startCleanup();
				break;
			}
		} catch (e) {
			console.error('[Puter AI Error]:', e);
			let errorMsg = e.message || 'Unknown Error';
			let isUnverified =
				errorMsg.includes('account_is_not_verified') ||
				errorMsg.includes('Email must be confirmed');

			let isUsageLimit =
				errorMsg.includes('insufficient_funds') ||
				(e.error && e.error.code === 'insufficient_funds');

			if (isUsageLimit) {
				// 1. Clear local data first

				softPurgePuterSession();

				// 2. Set special message

				errorMsg =
					'**QUOTA EXCEEDED**: Your local session has been cleared. To fully reset your identity, please open **puter.com** in a new window to refresh their server-side cookies, then reload this page.';

				notification = {
					text: errorMsg,

					type: 'error',

					action: {
						label: 'RESET PUTER.COM',

						callback: () => {
							window.open('https://puter.com', '_blank');

							setTimeout(() => window.location.reload(), 1000);
						}
					}
				};

				startCleanup();

				return;
			} else if (isUnverified) {
				errorMsg =
					'**ACCESS DENIED**: Puter requires a verified account. Click below to verify or login.';
			}

			// Only show error if not aborted manually

			if (e.message !== 'Aborted') {
				notification = {
					text: errorMsg,

					type: 'error',

					action: null
				};

				startCleanup();
			}
		} finally {
			isLoading = false;
			statusMessage = '';

			// Critical Re-focus Logic
			setTimeout(async () => {
				isInputVisible = true;
				await tick();
				if (inputElement) {
					inputElement.focus();
					inputElement.select(); // Select all text for easy overwrite
				}
			}, 200);
		}
	}

	function showNotification(text) {
		notification = { text };
		startCleanup();
	}
</script>

<div class="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-2 pointer-events-none">
	<!-- ACTIVITY STACK -->
	<div class="flex flex-col items-end gap-2 w-full max-w-xs md:max-w-md">
		<!-- 1. USER COMMAND (Friendly Chat Bubble) -->
		{#if userMessage}
			<div
				class="px-4 py-2 bg-white/10 border border-white/10 text-[10px] font-space text-white rounded-2xl rounded-tr-none shadow-lg"
				in:fly={{ x: 10, duration: 300 }}
			>
				{userMessage}
			</div>
		{/if}

		<!-- 2. TOOL CALL STATUS (Scanning Indicator) -->
		{#if statusMessage && isLoading}
			<div
				class="px-3 py-1 bg-black/60 border border-white/5 text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400 rounded-full flex items-center gap-2"
				in:slide={{ axis: 'y', duration: 200 }}
				out:fade
			>
				<div
					class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"
				></div>
				{statusMessage}
			</div>
		{/if}

		<!-- 3. AI RESPONSE (Friendly Chat Bubble) -->
		{#if notification && notification.text}
			<div
				class="pointer-events-auto max-w-[90%] bg-black/90 backdrop-blur-xl border border-white/10 p-3 shadow-2xl rounded-2xl rounded-br-none text-right"
				style="border-color: rgba(var(--accent-rgb), 0.3)"
				in:fly={{ y: 10, duration: 400 }}
				out:fade
			>
				<div class="text-xs font-space leading-relaxed text-slate-100 inline-block text-left">
					{@html marked.parse(notification.text)}
				</div>
				{#if notification.action}
					<button
						onclick={notification.action.callback}
						class="mt-3 w-full px-4 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all rounded-full text-center"
					>
						{notification.action.label}
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<!-- CONTROL LAYER -->
	<div class="flex items-center gap-2 pointer-events-auto mt-1">
		{#if isInputVisible}
			<div
				class="flex items-center bg-black border border-white/10 p-1 shadow-2xl rounded-full overflow-hidden"
				in:fly={{ x: 20, duration: 300 }}
				out:fade={{ duration: 200 }}
			>
				<input
					bind:this={inputElement}
					bind:value={input}
					onkeydown={(e) => e.key === 'Enter' && sendMessage()}
					onblur={() => {
						// Small delay to allow clicking the button or model switch
						setTimeout(() => {
							if (!input && !isLoading) isInputVisible = false;
						}, 200);
					}}
					placeholder={i18n.t('ai.placeholder')}
					disabled={isLoading}
					class="w-48 md:w-72 bg-transparent px-4 text-xs text-white font-space outline-none h-8 placeholder:text-slate-600"
				/>
			</div>
		{/if}

		<button
			onclick={toggleInput}
			class="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 border border-white/10 bg-black/80 backdrop-blur-md relative overflow-hidden group"
			style="border-color: {accentColor}"
			title={isLoading ? i18n.t('ai.cancel') : i18n.t('ai.summon')}
			aria-label={isLoading ? i18n.t('ai.cancel') : i18n.t('ai.summon')}
		>
			<div class="absolute inset-0 opacity-20" style="background-color: {accentColor}"></div>

			{#if isLoading}
				<!-- Spinning Loader -->
				<div class="relative flex items-center justify-center">
					<div
						class="absolute w-10 h-10 border-2 border-transparent border-t-white rounded-full animate-spin group-hover:opacity-0 transition-opacity"
						style="border-top-color: {accentColor}"
					></div>
					<!-- Default State: SYNC Text -->
					<span
						class="text-[6px] font-black uppercase tracking-tighter text-white z-10 animate-pulse group-hover:opacity-0 transition-opacity"
					>
						{statusMessage ? 'SYNC' : 'AI'}
					</span>
					<!-- Hover State: STOP Icon -->
					<span
						class="absolute text-lg font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100"
					>
						⏹
					</span>
				</div>
			{:else}
				<span class="text-xl relative z-10">🤖</span>
			{/if}
		</button>
	</div>
</div>

<style>
	:global(.font-space) {
		font-family: 'Space Grotesk', sans-serif;
	}
	:global(.font-space p) {
		margin-bottom: 0.4rem;
	}
	:global(.font-space p:last-child) {
		margin-bottom: 0;
	}
</style>
