<script>
	import { previewState } from './previewState.svelte.js';
</script>

<div class="space-y-4 {previewState.isLoading ? 'opacity-20' : 'opacity-100'} transition-opacity">
	<h3 class="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
		<span>💬</span> WhatsApp Message
	</h3>
	<div class="max-w-[320px] bg-[#0b141a] p-2 rounded-lg font-sans">
		<div class="bg-[#202c33] rounded-md overflow-hidden flex flex-col">
			{#if previewState.metadata.image}
				<div class="w-full aspect-square overflow-hidden bg-black">
					<img src={previewState.metadata.image} alt="Preview" class="w-full h-full object-cover" />
				</div>
			{/if}
			<div class="p-2.5 space-y-0.5">
				<p class="text-[14px] font-bold text-[#e9edef] line-clamp-2">{previewState.metadata.title}</p>
				<p class="text-[13px] text-[#8696a0] line-clamp-2 leading-tight">{previewState.metadata.description}</p>
				<p class="text-[12px] text-[#8696a0] pt-1">{previewState.metadata.url}</p>
			</div>
		</div>
	</div>
</div>
