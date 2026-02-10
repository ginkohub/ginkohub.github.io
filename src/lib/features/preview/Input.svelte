<script>
	import { previewState } from './previewState.svelte';
	let { accentColor } = $props();
</script>

<div class="bg-slate-900/30 border border-slate-800 p-6 space-y-6">
	<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Link Previewer</h2>

	<div class="flex flex-col md:flex-row gap-3">
		<input
			bind:value={previewState.inputUrl}
			placeholder="Enter any URL (e.g. https://google.com)"
			class="flex-1 bg-black border border-slate-800 p-3 text-sm focus:border-white transition-colors outline-none font-space text-white"
		/>
		<button
			onclick={() => previewState.fetch()}
			disabled={previewState.isLoading}
			class="px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
			style="background-color: {accentColor}; color: #000;"
			title="Fetch link preview metadata"
		>
			{previewState.isLoading ? 'Fetching...' : 'Preview Link'}
		</button>
	</div>

	<div class="flex flex-wrap gap-2 pt-2">
		{#each ['Twitter', 'Facebook', 'Discord', 'WhatsApp', 'LinkedIn'] as platform}
			<button
				onclick={() => previewState.togglePreview(platform)}
				class="px-3 py-1.5 text-[8px] font-black uppercase tracking-wider border transition-all {previewState.visiblePreviews.includes(
					platform
				)
					? 'border-white text-white bg-white/10'
					: 'border-slate-800 text-slate-500 hover:border-slate-600'}"
			>
				{platform}
			</button>
		{/each}
	</div>

	{#if previewState.error}
		<div class="flex items-center gap-3 text-rose-500">
			<span class="text-lg">⚠️</span>
			<p class="text-[9px] font-bold uppercase tracking-widest flex-1">{previewState.error}</p>
			<button
				onclick={() => previewState.fetch()}
				class="text-[8px] font-black uppercase border border-rose-900/50 px-2 py-1 hover:bg-rose-500 hover:text-black transition-all"
				title="Retry preview fetch"
			>
				Retry
			</button>
		</div>
	{:else}
		<p class="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
			Enter a URL to see how it appears across different platforms
		</p>
	{/if}
</div>
