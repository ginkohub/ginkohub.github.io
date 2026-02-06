<script>
	let input = $state('');
	let output = $state('');
	let error = $state('');

	function formatJSON() {
		try {
			error = '';
			const parsed = JSON.parse(input);
			output = JSON.stringify(parsed, null, 2);
		} catch (e) {
			error = 'Invalid JSON: ' + e.message;
			output = '';
		}
	}

	function minifyJSON() {
		try {
			error = '';
			const parsed = JSON.parse(input);
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

<div class="space-y-6 border-b border-slate-800/50 pb-10 mb-10">
	<header class="flex justify-between items-center">
		<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">JSON Formatter</h2>
		<div class="flex gap-2">
			<button
				onclick={formatJSON}
				class="tool-btn text-[8px] font-bold uppercase border border-slate-800 px-3 py-1 hover:bg-white hover:text-black transition-all"
				>Beautify</button
			>
			<button
				onclick={minifyJSON}
				class="tool-btn text-[8px] font-bold uppercase border border-slate-800 px-3 py-1 hover:bg-white hover:text-black transition-all"
				>Minify</button
			>
		</div>
	</header>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
		<textarea
			bind:value={input}
			placeholder="Paste messy JSON here..."
			class="w-full h-full bg-slate-900/30 border border-slate-800 p-4 text-xs font-mono text-slate-300 focus:border-white/20 outline-none resize-none"
		></textarea>

		<div class="relative group">
			<pre
				class="w-full h-full bg-black border border-slate-800 p-4 text-xs font-mono text-emerald-400 overflow-auto whitespace-pre-wrap">{output ||
					(error ? error : 'Output will appear here...')}</pre>
			{#if output}
				<button
					onclick={copyOutput}
					class="absolute top-2 right-2 bg-slate-800 text-white text-[8px] px-2 py-1 font-bold uppercase hover:bg-white hover:text-black transition-all"
					>Copy</button
				>
			{/if}
		</div>
	</div>
	{#if error}
		<p class="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{error}</p>
	{/if}
</div>
