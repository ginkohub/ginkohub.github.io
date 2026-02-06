<script>
	import { previewState } from './previewState.svelte.js';
</script>

<div class="space-y-4 {previewState.isLoading ? 'opacity-20' : 'opacity-100'} transition-opacity">
	<h3 class="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
		<span>f</span> Facebook Feed
	</h3>
	<div class="max-w-[500px] bg-[#242526] border border-white/10 overflow-hidden font-sans">
		<div class="aspect-[1.91/1] w-full bg-[#3a3b3c] overflow-hidden">
			{#if previewState.metadata.image}
				<img src={previewState.metadata.image} alt="Preview" class="w-full h-full object-cover" />
			{/if}
		</div>
		<div class="p-3 bg-[#3a3b3c] space-y-0.5">
			<p class="text-[12px] text-[#b0b3b8] uppercase">{previewState.metadata.url}</p>
			<p class="text-[16px] font-bold text-[#e4e6eb] line-clamp-1">{previewState.metadata.title}</p>
			<p class="text-[14px] text-[#b0b3b8] line-clamp-2 leading-snug">{previewState.metadata.description}</p>
		</div>
	</div>
</div>
