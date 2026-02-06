<script>
	import { previewState, fetchMetadata } from './previewState.svelte.js';
	let { accentColor } = $props();
</script>

<div class="bg-slate-900/30 border border-slate-800 p-6 space-y-6">
	<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Link Previewer</h2>
	
	<div class="flex flex-col md:flex-row gap-3">
		<input 
			bind:value={previewState.inputUrl} 
			placeholder="Enter any URL (e.g. https://google.com)"
			class="flex-1 bg-black border border-slate-800 p-3 text-sm focus:border-white transition-colors outline-none font-space"
		/>
		<button 
			onclick={fetchMetadata}
			disabled={previewState.isLoading}
			class="px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
			style="background-color: {accentColor}; color: #000;"
		>
			{previewState.isLoading ? 'Fetching...' : 'Preview Link'}
		</button>
	</div>
	<p class="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">Enter a URL to see how it appears across different platforms</p>
</div>
