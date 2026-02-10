<script>
	import { toolState } from './toolState.svelte';

	let output = $state('');

	function encode() {
		output = encodeURIComponent(toolState.urlInput);
	}

	function decode() {
		try {
			output = decodeURIComponent(toolState.urlInput);
		} catch (e) {
			output = 'Error: Invalid sequence';
		}
	}

	function copyOutput() {
		if (output) {
			navigator.clipboard.writeText(output);
		}
	}
</script>

<div class="space-y-6">
	<header class="flex justify-between items-center">
		<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">URL Encoder</h2>
		<div class="flex gap-2">
			<button
				onclick={encode}
				class="tool-btn text-[8px] font-bold uppercase border border-slate-800 px-3 py-1 hover:bg-white hover:text-black transition-all"
				title="Encode input string">Encode</button
			>
			<button
				onclick={decode}
				class="tool-btn text-[8px] font-bold uppercase border border-slate-800 px-3 py-1 hover:bg-white hover:text-black transition-all"
				title="Decode input string">Decode</button
			>
		</div>
	</header>

	<div class="space-y-4">
		<input
			type="text"
			bind:value={toolState.urlInput}
			placeholder="URL or string..."
			class="w-full bg-slate-900/30 border-b border-slate-800 p-2 text-sm font-space text-slate-300 focus:border-white/20 outline-none"
		/>

		<div class="relative group bg-black border border-slate-800 p-4 min-h-[60px] flex items-center">
			<code class="text-xs font-mono text-amber-400 break-all">{output || 'Result...'}</code>
			{#if output}
				<button
					onclick={copyOutput}
					class="absolute top-2 right-2 bg-slate-800 text-white text-[8px] px-2 py-1 font-bold uppercase hover:bg-white hover:text-black transition-all"
					title="Copy result to clipboard">Copy</button
				>
			{/if}
		</div>
	</div>
</div>
