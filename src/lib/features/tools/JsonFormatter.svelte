<script>
	import { toolState } from './toolState.svelte';

	let output = $state('');
	let error = $state('');

	function formatJSON() {
		try {
			error = '';
			const parsed = JSON.parse(toolState.jsonInput);
			output = JSON.stringify(parsed, null, 2);
		} catch (e) {
			error = 'Invalid JSON: ' + e.message;
			output = '';
		}
	}

	function minifyJSON() {
		try {
			error = '';
			const parsed = JSON.parse(toolState.jsonInput);
			output = JSON.stringify(parsed);
		} catch (e) {
			error = 'Invalid JSON: ' + e.message;
			output = '';
		}
	}

	function copyOutput() {
		if (output) {
			navigator.clipboard.writeText(output);
		}
	}
</script>

<div class="space-y-6 border-b border-white/5 pb-10 mb-10">
	<header class="flex justify-between items-center">
		<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">JSON Formatter</h2>
		<div class="flex gap-2">
			<button
				onclick={formatJSON}
				class="tool-btn text-[8px] font-black uppercase border border-white/10 px-3 py-1 hover:bg-white hover:text-black transition-all"
				title="Beautify JSON">Beautify</button
			>
			<button
				onclick={minifyJSON}
				class="tool-btn text-[8px] font-black uppercase border border-white/10 px-3 py-1 hover:bg-white hover:text-black transition-all"
				title="Minify JSON">Minify</button
			>
		</div>
	</header>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
		<textarea
			bind:value={toolState.jsonInput}
			placeholder="Paste messy JSON here..."
			class="w-full h-full bg-white/5 border border-white/5 backdrop-blur-sm p-4 text-xs font-mono text-slate-300 focus:border-white/20 outline-none resize-none"
		></textarea>

		<div class="relative group">
			<pre
				class="w-full h-full bg-black/40 border border-white/5 backdrop-blur-sm p-4 text-xs font-mono text-emerald-400 overflow-auto whitespace-pre-wrap">{output ||
					(error ? error : 'Output will appear here...')}</pre>
			{#if output}
				<button
					onclick={copyOutput}
					class="absolute top-2 right-2 border border-white/10 bg-black/50 text-white text-[8px] px-2 py-1 font-black uppercase hover:bg-white hover:text-black transition-all backdrop-blur-md"
					title="Copy result to clipboard">Copy</button
				>
			{/if}
		</div>
	</div>
	{#if error}
		<p
			class="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-950/10 border border-rose-900/30 p-2 text-center"
		>
			{error}
		</p>
	{/if}
</div>
