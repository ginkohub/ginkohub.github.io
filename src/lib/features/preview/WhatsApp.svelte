<script>
	import { previewState } from './previewState.svelte';
</script>

<div class="space-y-4 {previewState.isLoading ? 'opacity-20' : 'opacity-100'} transition-opacity">
	<h3
		class="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"
	>
		<span>💬</span> WhatsApp Message
	</h3>
	<div class="max-w-[320px] bg-[#0b141a] p-2 font-sans">
		{#if previewState.metadata}
			<div class="bg-[#202c33] overflow-hidden flex flex-col">
				{#if previewState.metadata.image}
					<div class="w-full aspect-square overflow-hidden bg-black">
						<img
							src={previewState.metadata.image}
							alt="Preview"
							class="w-full h-full object-cover"
						/>
					</div>
				{/if}
				<div class="p-2.5 space-y-0.5">
					<p class="text-[14px] font-bold text-[#e9edef] line-clamp-2">
						{previewState.metadata.title}
					</p>
					<p class="text-[13px] text-[#8696a0] line-clamp-2 leading-tight">
						{previewState.metadata.description}
					</p>
					<p class="text-[12px] text-[#8696a0] pt-1">
						{previewState.metadata.url || previewState.inputUrl}
					</p>
				</div>
			</div>
		{:else}
			<div
				class="bg-[#202c33] p-8 flex flex-col items-center justify-center text-center space-y-2 opacity-50"
			>
				<div
					class="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs"
				>
					?
				</div>
				<p class="text-[10px] font-bold uppercase tracking-widest text-[#8696a0]">
					Awaiting Metadata
				</p>
			</div>
		{/if}
	</div>
</div>
