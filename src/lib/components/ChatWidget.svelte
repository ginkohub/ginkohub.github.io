<script>
	import { onMount, tick } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let { accentColor } = $props();

	let messages = $state([]);
	let input = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let selectedModel = $state('gpt-4o');
	let isMinimized = $state(true);
	let chatContainer = $state(null);
	let inputElement = $state(null);
	let showSettings = $state(false);

	const defaultSystemPrompt = `Nama lu Ginko, humble, expert tentang programming dan tekologi, kalem, gk banyak ngomong, gk suka pamer.
  Bicara pake bahasa sehari-hari "lu" "gw".
  Sebisa mungkin persingkat kalimat, seperti sedang chat di Discord.
  Balas tanpa format percakapan dan ingat max 2000 karakter.
  Gunakan kata pengganti :
  - Oke = Omkeh
  - Iya = Imyah
  - Siap = Siyap`;

	let systemContent = $state(defaultSystemPrompt);

	onMount(() => {
		const savedPrompt = localStorage.getItem('ginkohub_system_prompt');
		if (savedPrompt) systemContent = savedPrompt;
	});

	function toggleSettings() {
		showSettings = !showSettings;
	}

	function saveSettings() {
		localStorage.setItem('ginkohub_system_prompt', systemContent);
		showSettings = false;
	}

	function resetSettings() {
		systemContent = defaultSystemPrompt;
		saveSettings();
	}

	// Auto-scroll logic
	$effect(() => {
		if (messages.length || isLoading) {
			tick().then(() => {
				if (chatContainer) {
					chatContainer.scrollTo({
						top: chatContainer.scrollHeight,
						behavior: 'smooth'
					});
				}
			});
		}
	});

	async function sendMessage() {
		if (!input.trim() || isLoading) return;

		if (typeof window === 'undefined' || !window.puter) {
			error = 'Puter SDK not loaded.';
			return;
		}

		const userMsg = { role: 'user', content: input.trim() };
		messages = [...messages, userMsg];
		const currentInput = input;
		input = '';
		isLoading = true;
		error = '';

		try {
			const systemMsg = { role: 'system', content: systemContent };
			const response = await window.puter.ai.chat([systemMsg, ...messages], {
				model: selectedModel,
				stream: false
			});

			const content = typeof response === 'string' ? response : response.message.content;
			const assistantMsg = { role: 'assistant', content };
			messages = [...messages, assistantMsg];
		} catch (e) {
			error = e.message;
			input = currentInput;
		} finally {
			isLoading = false;
			tick().then(() => inputElement?.focus());
		}
	}

	function clearChat() {
		messages = [];
		error = '';
	}

	function toggleMinimize() {
		isMinimized = !isMinimized;
	}
</script>

<div class="fixed bottom-6 right-6 z-[100] font-inter">
	{#if isMinimized}
		<button
			onclick={toggleMinimize}
			class="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 border-2 border-white/10 group overflow-hidden bg-black"
			style="border-color: {accentColor}"
			title="Open AI Chat"
		>
			<div
				class="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity rounded-full"
				style="background-color: {accentColor}"
			></div>
			<span class="text-xl relative z-10">🤖</span>
		</button>
	{:else}
		<div
			class="w-80 md:w-96 bg-black border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col transition-all overflow-hidden backdrop-blur-xl rounded-2xl"
		>
			<!-- Header -->
			<header
				class="p-3 border-b border-slate-800 flex justify-between items-center bg-white/5"
				style="border-bottom-color: {accentColor}"
			>
								<div class="flex items-center gap-2">
									<span class="text-[10px] font-black uppercase tracking-widest text-white">Neural Node</span>
									<div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
								</div>
								<div class="flex gap-3">
									<button
										onclick={toggleSettings}
										class="text-xs text-slate-500 hover:text-white transition-colors"
										title="Configure System Prompt"
									>
										⚙️
									</button>
									<button
										onclick={clearChat}
										class="text-xs text-slate-500 hover:text-rose-500 transition-colors"
										title="Clear conversation history"
									>
										🗑️
									</button>
									<button
										onclick={toggleMinimize}
										class="text-sm font-bold text-slate-500 hover:text-white transition-colors leading-none"
										title="Close chat"
									>
										✕
									</button>
								</div>
							</header>
				
							{#if showSettings}
								<div class="absolute inset-0 z-20 bg-black/95 backdrop-blur-md p-4 flex flex-col gap-4">
									<h3 class="text-[10px] font-black uppercase tracking-widest text-white">System Persona</h3>
									<textarea
										bind:value={systemContent}
										class="flex-1 bg-slate-900/50 border border-slate-700 p-3 text-xs text-slate-300 font-mono resize-none focus:border-white/30 outline-none rounded-lg"
										placeholder="Define the AI's personality..."
									></textarea>
									<div class="flex gap-2">
										<button
											onclick={saveSettings}
											class="flex-1 py-2 text-[9px] font-black uppercase bg-white text-black rounded-lg hover:bg-slate-200 transition-all"
										>
											Save
										</button>
										<button
											onclick={resetSettings}
											class="px-4 py-2 text-[9px] font-black uppercase border border-slate-700 text-slate-400 rounded-lg hover:text-white transition-all"
										>
											Reset
										</button>
										<button
											onclick={() => (showSettings = false)}
											class="px-4 py-2 text-[9px] font-black uppercase border border-slate-700 text-slate-400 rounded-lg hover:text-white transition-all"
										>
											Cancel
										</button>
									</div>
								</div>
							{/if}
				
							<!-- Messages -->
			<div
				bind:this={chatContainer}
				class="h-80 overflow-y-auto p-4 space-y-4 no-scrollbar bg-black/40"
			>
				{#if messages.length === 0}
					<div
						class="h-full flex flex-col items-center justify-center text-slate-700 text-[9px] uppercase gap-2 py-10 opacity-50"
					>
						<span>Ready for transmission</span>
						<div class="w-8 h-[1px] bg-slate-800"></div>
					</div>
				{/if}
				{#each messages as msg}
					<div class="flex flex-col {msg.role === 'user' ? 'items-end' : 'items-start'}">
						<div
							class="max-w-[90%] p-2.5 text-xs font-space leading-relaxed whitespace-pre-wrap border rounded-xl {msg.role ===
							'user'
								? 'bg-slate-900 border-slate-700 text-white'
								: 'bg-black border-slate-800 text-slate-300'}"
							style={msg.role === 'user' ? `border-color: ${accentColor}` : ''}
						>
							{msg.content}
						</div>
					</div>
				{/each}
				{#if isLoading}
					<div class="flex justify-start">
						<div class="text-[8px] uppercase text-slate-600 animate-pulse tracking-widest">
							Processing...
						</div>
					</div>
				{/if}
				{#if error}
					<div class="p-2 border border-rose-900/50 text-rose-500 text-[9px] font-mono uppercase">
						Error: {error}
					</div>
				{/if}
			</div>

			<!-- Footer/Input -->
			<footer class="p-3 border-t border-slate-800 bg-white/5">
				<div class="flex gap-2">
					<select
						bind:value={selectedModel}
						class="bg-black border border-slate-800 text-[8px] font-bold uppercase text-slate-500 px-1 outline-none"
					>
						<option value="gpt-4o">4o</option>
						<option value="gpt-4">4</option>
						<option value="claude-3-5-sonnet">3.5</option>
					</select>
					<input
						bind:this={inputElement}
						bind:value={input}
						onkeydown={(e) => e.key === 'Enter' && sendMessage()}
						placeholder="Transmitting message..."
						disabled={isLoading}
						class="flex-1 bg-black border border-slate-800 p-2 text-xs text-white font-space outline-none focus:border-white/20 disabled:opacity-50 rounded-lg"
					/>
					<button
						onclick={sendMessage}
						disabled={isLoading || !input.trim()}
						class="px-3 text-[9px] font-black uppercase transition-all active:scale-90 rounded-lg"
						style="background-color: {accentColor}; color: #000;"
					>
						Sync
					</button>
				</div>
			</footer>
		</div>
	{/if}
</div>
