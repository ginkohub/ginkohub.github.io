<script>
	import { onMount } from 'svelte';

	let { accentColor } = $props();

	let apiKey = $state('');
	let showConfig = $state(false);
	let messages = $state([]);
	let input = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let selectedModel = $state('glm-4-flash');

	// Persistent Key
	onMount(() => {
		const savedKey = localStorage.getItem('ginkohub_zai_key');
		if (savedKey) apiKey = savedKey;
		if (!savedKey) showConfig = true;
	});

	function saveKey() {
		localStorage.setItem('ginkohub_zai_key', apiKey);
		showConfig = false;
	}

	function clearKey() {
		apiKey = '';
		localStorage.removeItem('ginkohub_zai_key');
		showConfig = true;
	}

	async function sendMessage() {
		if (!input.trim() || !apiKey) return;

		const userMsg = { role: 'user', content: input.trim() };
		messages = [...messages, userMsg];
		const currentInput = input;
		input = '';
		isLoading = true;
		error = '';

		try {
			const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`
				},
				body: JSON.stringify({
					model: selectedModel,
					messages: messages
				})
			});

			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.error?.message || `HTTP ${response.status}`);
			}

			const data = await response.json();
			const assistantMsg = data.choices[0].message;
			messages = [...messages, assistantMsg];
		} catch (e) {
			error = e.message;
			// Restore input if failed
			input = currentInput;
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-6 pt-12 border-t border-slate-800/50">
	<header class="flex justify-between items-center">
		<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
			Z.ai Intelligence (GLM-4)
		</h2>
		<button
			onclick={() => (showConfig = !showConfig)}
			class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all"
			title="Configure API Key"
		>
			{showConfig ? 'Close Config' : 'Config'}
		</button>
	</header>

	{#if showConfig}
		<div class="bg-slate-900/30 border border-slate-800 p-4 space-y-4">
			<div class="space-y-1">
				<label for="zai-key" class="text-[7px] font-bold uppercase text-slate-500"
					>API Key (Saved locally)</label
				>
				<input
					id="zai-key"
					type="password"
					bind:value={apiKey}
					placeholder="Enter your Z.ai / Zhipu API Key"
					class="w-full bg-black border border-slate-800 p-2 text-xs text-white outline-none focus:border-white/20 font-mono"
				/>
			</div>
			<div class="flex gap-2">
				<button
					onclick={saveKey}
					class="flex-1 py-2 text-[8px] font-black uppercase bg-white text-black hover:bg-slate-200 transition-all"
				>
					Save Key
				</button>
				<button
					onclick={clearKey}
					class="px-4 py-2 text-[8px] font-black uppercase border border-rose-900/50 text-rose-500 hover:bg-rose-900/20 transition-all"
				>
					Clear
				</button>
			</div>
			<p class="text-[8px] text-slate-600">
				Get a key from <a
					href="https://open.bigmodel.cn/"
					target="_blank"
					class="underline hover:text-white">open.bigmodel.cn</a
				>
			</p>
		</div>
	{/if}

	<div class="min-h-[300px] border border-slate-800 bg-black flex flex-col">
		<!-- Chat History -->
		<div class="flex-1 p-4 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
			{#if messages.length === 0}
				<div class="h-full flex items-center justify-center text-slate-700 text-[10px] uppercase">
					Ready to connect...
				</div>
			{/if}
			{#each messages as msg}
				<div class="flex flex-col {msg.role === 'user' ? 'items-end' : 'items-start'}">
					<div
						class="max-w-[80%] p-3 text-sm font-space leading-relaxed whitespace-pre-wrap {msg.role ===
						'user'
							? 'bg-slate-900 text-white border border-slate-700'
							: 'bg-black text-slate-300 border border-slate-800'}"
						style={msg.role === 'user' ? `border-color: ${accentColor}` : ''}
					>
						{msg.content}
					</div>
					<span class="text-[7px] font-bold uppercase text-slate-600 mt-1">{msg.role}</span>
				</div>
			{/each}
			{#if isLoading}
				<div class="flex justify-start">
					<div
						class="px-3 py-2 bg-black border border-slate-800 text-[10px] uppercase text-slate-500 animate-pulse"
					>
						Processing...
					</div>
				</div>
			{/if}
			{#if error}
				<div class="p-3 border border-rose-900/50 bg-rose-950/10 text-rose-500 text-xs font-mono">
					Error: {error}
				</div>
			{/if}
		</div>

		<!-- Input Area -->
		<div class="p-3 border-t border-slate-800 bg-slate-900/20">
			<div class="flex gap-2">
				<select
					bind:value={selectedModel}
					class="bg-black border border-slate-800 text-slate-400 text-[9px] uppercase px-2 outline-none focus:border-white/20"
				>
					<option value="glm-4-flash">GLM-4 Flash</option>
					<option value="glm-4">GLM-4</option>
					<option value="glm-4-air">GLM-4 Air</option>
				</select>
				<input
					bind:value={input}
					onkeydown={(e) => e.key === 'Enter' && sendMessage()}
					placeholder={apiKey ? 'Type your query...' : 'Please configure API key first'}
					disabled={!apiKey || isLoading}
					class="flex-1 bg-black border border-slate-800 p-2 text-sm text-white font-space outline-none focus:border-white/20 disabled:opacity-50"
				/>
				<button
					onclick={sendMessage}
					disabled={!apiKey || isLoading || !input.trim()}
					class="px-4 text-[10px] font-black uppercase bg-white text-black hover:bg-slate-200 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-600 transition-all"
				>
					Send
				</button>
			</div>
		</div>
	</div>
</div>
