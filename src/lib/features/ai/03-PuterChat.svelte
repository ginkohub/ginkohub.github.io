<script>
	import { onMount } from 'svelte';

	let { accentColor } = $props();

	let messages = $state([]);
	let input = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let selectedModel = $state('gpt-4o'); // Puter supports multiple models including gpt-4o

	async function sendMessage() {
		if (!input.trim() || isLoading) return;

		// Check if puter is loaded
		if (typeof window === 'undefined' || !window.puter) {
			error = 'Puter SDK not loaded. Protocol obstructed.';
			return;
		}

		const userMsg = { role: 'user', content: input.trim() };
		messages = [...messages, userMsg];
		const currentInput = input;
		input = '';
		isLoading = true;
		error = '';

		try {
			// Puter.js chat supports passing an array of messages
			const response = await window.puter.ai.chat(messages, {
				model: selectedModel,
				stream: false
			});

			// Puter returns a message object or string depending on the call
			const content = typeof response === 'string' ? response : response.message.content;
			
			const assistantMsg = { role: 'assistant', content };
			messages = [...messages, assistantMsg];
		} catch (e) {
			error = `Link Error: ${e.message}`;
			input = currentInput; // Restore input
		} finally {
			isLoading = false;
		}
	}

	function clearChat() {
		messages = [];
		error = '';
	}
</script>

<div class="space-y-6 pt-12 border-t border-slate-800/50">
	<header class="flex justify-between items-center">
		<div class="flex items-center gap-3">
			<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
				Puter Intelligence (Free Cloud AI)
			</h2>
			<span class="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[7px] font-bold uppercase tracking-widest border border-emerald-500/20 rounded">No Key Required</span>
		</div>
		<button
			onclick={clearChat}
			class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-rose-500 hover:text-black transition-all"
			title="Clear conversation history"
		>
			Purge History
		</button>
	</header>

	<div class="min-h-[300px] border border-slate-800 bg-black flex flex-col shadow-2xl relative overflow-hidden">
		<!-- Subtle Background Logo/Icon -->
		<div class="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
			<span class="text-9xl font-black italic">PUTER</span>
		</div>

		<!-- Chat History -->
		<div class="flex-1 p-4 space-y-4 max-h-[450px] overflow-y-auto no-scrollbar relative z-10">
			{#if messages.length === 0}
				<div class="h-full flex flex-col items-center justify-center text-slate-700 text-[10px] uppercase gap-2 py-20">
					<div class="w-12 h-[1px] bg-slate-800"></div>
					<span>Encrypted Tunnel Open</span>
					<span>Select model and transmit query</span>
					<div class="w-12 h-[1px] bg-slate-800"></div>
				</div>
			{/if}
			{#each messages as msg}
				<div class="flex flex-col {msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1">
					<div
						class="max-w-[85%] p-3 text-sm font-space leading-relaxed whitespace-pre-wrap shadow-lg {msg.role ===
						'user'
							? 'bg-slate-900 text-white border border-slate-700'
							: 'bg-black text-slate-300 border border-slate-800'}"
						style={msg.role === 'user' ? `border-color: ${accentColor}` : ''}
					>
						{msg.content}
					</div>
					<span class="text-[7px] font-bold uppercase text-slate-600 mt-1 tracking-tighter">
						[{msg.role === 'user' ? 'LOCAL_NODE' : 'REMOTE_CLOUD'}]
					</span>
				</div>
			{/each}
			{#if isLoading}
				<div class="flex justify-start">
					<div
						class="px-3 py-2 bg-black border border-slate-800 text-[10px] uppercase text-slate-500 animate-pulse flex items-center gap-2"
					>
						<div class="w-1 h-1 bg-white rounded-full animate-bounce"></div>
						<span>Processing Stream...</span>
					</div>
				</div>
			{/if}
			{#if error}
				<div class="p-3 border border-rose-900/50 bg-rose-950/10 text-rose-500 text-xs font-mono">
					SYSTEM_ERROR: {error}
				</div>
			{/if}
		</div>

		<!-- Input Area -->
		<div class="p-3 border-t border-slate-800 bg-slate-900/20 relative z-10">
			<div class="flex gap-2">
				<select
					bind:value={selectedModel}
					class="bg-black border border-slate-800 text-slate-400 text-[9px] uppercase px-2 outline-none focus:border-white/20 appearance-none cursor-pointer hover:bg-slate-900"
				>
					<option value="gpt-4o">GPT-4o</option>
					<option value="gpt-4">GPT-4</option>
					<option value="claude-3-5-sonnet">Claude 3.5</option>
				</select>
				<input
					bind:value={input}
					onkeydown={(e) => e.key === 'Enter' && sendMessage()}
					placeholder="Enter transmission..."
					disabled={isLoading}
					class="flex-1 bg-black border border-slate-800 p-2 text-sm text-white font-space outline-none focus:border-white/20 disabled:opacity-50"
				/>
				<button
					onclick={sendMessage}
					disabled={isLoading || !input.trim()}
					class="px-6 text-[10px] font-black uppercase bg-white text-black hover:bg-slate-200 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-600 transition-all active:scale-95"
				>
					Send
				</button>
			</div>
		</div>
	</div>
	<footer class="flex justify-between items-center text-[7px] text-slate-600 font-bold uppercase tracking-widest px-1">
		<span>Encryption: AES-256 (Implicit)</span>
		<span>Powered by Puter.js</span>
	</footer>
</div>
