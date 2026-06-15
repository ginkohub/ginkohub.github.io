<script>
	import { onMount, tick } from 'svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { marked } from 'marked';
	import { DEFAULT_SYSTEM_PROMPT } from '$lib/ai/prompts.js';
	import { aiMemory } from '$lib/ai/memory.svelte';
	import { i18n } from '$lib/state/i18n.svelte';
	let { accentColor, onCommand, context = {} } = $props();

	// Logic State
	let input = $state('');
	let isLoading = $state(false);
	let isInputVisible = $state(false);
	let statusMessage = $state(''); // For tool calls
	let userMessage = $state(''); // The last message sent by user
	let notification = $state(null); // The final AI response
	let inputElement = $state(null);
	let messages = $state([]);
	let abortController = $state(null); // Controller for interruption

	let systemContent = $state(DEFAULT_SYSTEM_PROMPT);
	let cleanupTimeout;

	onMount(() => {
		const savedPrompt = localStorage.getItem('ginkohub_system_prompt');
		if (savedPrompt) systemContent = savedPrompt;

		// Show random welcome bubble on every load
		setTimeout(() => {
			const messages = i18n.t('ai.welcome');
			const randomMessage = Array.isArray(messages)
				? messages[Math.floor(Math.random() * messages.length)]
				: messages;
			notification = { text: randomMessage };
			startCleanup();
		}, 3000); // 3s delay
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

	const SIPUTZX_BASE = 'https://api.siputzx.my.id/api/ai/gptoss120b';
	const SYS_MAX = 1900;
	const PROMPT_MAX = 3900;

	function buildSystem() {
		const memInfo = aiMemory.getAll() || 'None';

		let ctx = `[LONG-TERM MEMORY]\n- Saved Info: ${memInfo}`;
		ctx += `\n\n[SYSTEM] Time: ${context.time || ''}, Tab: ${context.activeTab || ''}, Accent: ${context.accent || ''}`;

		if (context.overloaded) ctx += ', Overload: YES';

		const addCtx = (label, val) => {
			if (!val) return;
			const extra = `\n- ${label}: ${String(val).slice(0, 300)}`;
			if (ctx.length + extra.length < 1200) ctx += extra;
		};

		if (context.news) addCtx(`NEWS (${context.news.feed})`, context.news.headlines?.slice(0, 3).join(' | '));
		if (context.github) addCtx(`GITHUB (${context.github.mode}/${context.github.language})`, context.github.items?.slice(0, 3).join(' | '));
		if (context.humor) {
			addCtx('JOKE', context.humor.joke);
			addCtx('MEME', context.humor.meme);
		}
		if (context.words) addCtx(`WORD (${context.words.query})`, context.words.results?.slice(0, 3).join(', '));
		if (context.about) addCtx('STATS', context.about.stats);
		if (context.game) addCtx('PLAYING', context.game.playing);
		if (context.preview) addCtx('PREVIEW', context.preview.title);

		const system = `${systemContent}\n${ctx}`;
		return system.length > SYS_MAX ? system.slice(0, SYS_MAX) : system;
	}

	function buildPrompt(convLines) {
		const userLine = `User: ${userMessage}`;
		if (!convLines) return userLine.slice(0, PROMPT_MAX);

		const full = `${convLines}\n\n${userLine}`;
		if (full.length <= PROMPT_MAX) return full;

		const budget = PROMPT_MAX - userLine.length - 2;
		if (budget <= 0) return userLine.slice(0, PROMPT_MAX);

		let truncated = '';
		const lines = convLines.split('\n');
		for (let i = lines.length - 1; i >= 0; i--) {
			const next = truncated ? `${lines[i]}\n${truncated}` : lines[i];
			if (next.length > budget) break;
			truncated = next;
		}
		return `${truncated}\n\n${userLine}`;
	}

	function parseToolCalls(text) {
		const regex = /\[TOOL:(\w+):(\{.*?\})\]/g;
		const calls = [];
		let match;
		while ((match = regex.exec(text)) !== null) {
			try {
				calls.push({ name: match[1], args: JSON.parse(match[2]) });
			} catch { }
		}
		return calls;
	}

	function stripToolMarkers(text) {
		return text.replace(/\[TOOL:\w+:\{.*?\}\]/g, '').trim();
	}

	async function sendMessage() {
		if (!input.trim() || isLoading) return;

		abortController = new AbortController();

		userMessage = input.trim();
		const userMsg = { role: 'user', content: userMessage };
		messages = [...messages.slice(-10), userMsg];

		const currentInput = input;
		input = '';
		isLoading = true;
		isInputVisible = false;
		statusMessage = 'PROCESSING...';
		notification = null;

		try {
			const fullSystem = buildSystem();
			const convLines = messages
				.filter((m) => m.role !== 'protocol')
				.slice(-6, -1)
				.map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
				.join('\n');
			const prompt = buildPrompt(convLines);

			statusMessage = 'CONTACTING AI...';

			if (abortController.signal.aborted) throw new Error('Aborted');

			const res = await fetch(SIPUTZX_BASE, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt,
					system: fullSystem,
					temperature: 0.7
				}),
				signal: abortController.signal
			});

			if (!res.ok) throw new Error(`API Error: ${res.status}`);

			const data = await res.json();

			if (abortController.signal.aborted) throw new Error('Aborted');

			if (!data.status) throw new Error(data.error || 'Unknown API error');

			const rawText = data.data.response || '';
			const toolCalls = parseToolCalls(rawText);
			const cleanText = stripToolMarkers(rawText);

			const assistantMsg = { role: 'assistant', content: cleanText || rawText };
			messages = [...messages, assistantMsg];

			if (toolCalls.length > 0 && onCommand) {
				for (const tc of toolCalls) {
					if (abortController.signal.aborted) throw new Error('Aborted');
					statusMessage = `INVOKING: ${tc.name.toUpperCase()}`;
					await onCommand(tc.name, tc.args);
				}
			}

			notification = { text: cleanText || rawText };
			startCleanup();
		} catch (e) {
			console.error('[AI Error]:', e);
			if (e.message !== 'Aborted') {
				notification = {
					text: `**ERROR**: ${e.message || 'Failed to contact AI server.'}`,
					type: 'error',
					action: null
				};
				startCleanup();
			}
		} finally {
			isLoading = false;
			statusMessage = '';
			setTimeout(async () => {
				isInputVisible = true;
				await tick();
				if (inputElement) {
					inputElement.focus();
					inputElement.select();
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
