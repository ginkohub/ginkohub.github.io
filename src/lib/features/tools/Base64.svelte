<script>
	import { toolState } from './toolState.svelte';

	let output = $state('');
	let error = $state('');

	function encode() {
		try {
			error = '';
			output = btoa(toolState.base64Input);
		} catch (e) {
			error = 'Encoding Error: Only Latin1 characters supported.';
		}
	}

	function decode() {
		try {
			error = '';
			output = atob(toolState.base64Input);
		} catch (e) {
			error = 'Decoding Error: Invalid Base64 string.';
		}
	}

	function copyOutput() {
		if (output) {
			navigator.clipboard.writeText(output);
		}
	}
</script>

<div class="space-y-6 border-b border-slate-800/50 pb-10 mb-10">
	<header class="flex justify-between items-center">
		<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
			Base64 Converter
		</h2>
		<div class="flex gap-2">
			<button
				onclick={encode}
				class="tool-btn text-[8px] font-bold uppercase border border-slate-800 px-3 py-1 hover:bg-white hover:text-black transition-all"
				title="Encode to Base64">Encode</button
			>
			<button
				onclick={decode}
				class="tool-btn text-[8px] font-bold uppercase border border-slate-800 px-3 py-1 hover:bg-white hover:text-black transition-all"
				title="Decode from Base64">Decode</button
			>
		</div>
	</header>

	<div class="space-y-4">
		<input
			type="text"
			bind:value={toolState.base64Input}
			placeholder="Text to convert..."
			class="w-full bg-slate-900/30 border-b border-slate-800 p-2 text-sm font-space text-slate-300 focus:border-white/20 outline-none"
		/>

		<div class="relative group bg-black border border-slate-800 p-4 min-h-[60px] flex items-center">
			<code class="text-xs font-mono text-sky-400 break-all"
				>{output || (error ? error : 'Result...')}</code
			>
			{#if output}
				<button
					onclick={copyOutput}
					class="absolute top-2 right-2 bg-slate-800 text-white text-[8px] px-2 py-1 font-bold uppercase hover:bg-white hover:text-black transition-all"
					title="Copy result to clipboard">Copy</button
				>
			{/if}
		</div>
	</div>
	{#if error}
		<p class="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{error}</p>
	{/if}
</div>
