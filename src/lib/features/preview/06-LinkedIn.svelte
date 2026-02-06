<script>
	import { previewState } from './previewState.svelte.js';
</script>

<div class="space-y-4 {previewState.isLoading ? 'opacity-20' : 'opacity-100'} transition-opacity">
	<h3
		class="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"
	>
		<span>in</span> LinkedIn Post
	</h3>
	<div class="max-w-[500px] bg-white border border-slate-200 overflow-hidden font-sans">
		<div class="aspect-[1.91/1] w-full bg-slate-100 overflow-hidden">
			{#if previewState.metadata.image}
				<img src={previewState.metadata.image} alt="Preview" class="w-full h-full object-cover" />
			{/if}
		</div>
		<div class="p-3 space-y-1">
			<p class="text-[14px] font-bold text-slate-900 line-clamp-2 leading-snug">
				{previewState.metadata.title}
			</p>
			<p class="text-[12px] text-slate-500 uppercase">{previewState.metadata.url}</p>
		</div>
	</div>
</div>
