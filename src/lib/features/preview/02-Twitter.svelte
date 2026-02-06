<script>
	import { previewState } from './previewState.svelte.js';
</script>

<div class="space-y-4 {previewState.isLoading ? 'opacity-20' : 'opacity-100'} transition-opacity">
	<h3
		class="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"
	>
		<span>𝕏</span> Twitter / X Card
	</h3>
	<div class="max-w-[500px] bg-black border border-slate-800 rounded-xl overflow-hidden font-sans">
		<div class="aspect-[1.91/1] w-full bg-slate-900 overflow-hidden border-b border-slate-800">
			{#if previewState.metadata.image}
				<img src={previewState.metadata.image} alt="Preview" class="w-full h-full object-cover" />
			{:else}
				<div
					class="w-full h-full flex items-center justify-center text-slate-800 text-[10px] font-black uppercase tracking-widest"
				>
					No Image
				</div>
			{/if}
		</div>
		<div class="p-3 space-y-1">
			<p class="text-[11px] text-slate-500 uppercase">{previewState.metadata.url}</p>
			<p class="text-[14px] font-bold text-slate-100 line-clamp-1">{previewState.metadata.title}</p>
			<p class="text-[14px] text-slate-400 line-clamp-2 leading-snug">
				{previewState.metadata.description}
			</p>
		</div>
	</div>
</div>
