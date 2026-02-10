<script>
	import { previewState } from './previewState.svelte';
</script>

<div class="space-y-4 {previewState.isLoading ? 'opacity-20' : 'opacity-100'} transition-opacity">
	<h3
		class="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"
	>
		<span>f</span> Facebook Feed
	</h3>
	<div class="max-w-[500px] bg-[#242526] border border-white/10 overflow-hidden font-sans">
		{#if previewState.metadata}
			<div class="aspect-[1.91/1] w-full bg-[#3a3b3c] overflow-hidden">
				{#if previewState.metadata.image}
					<img src={previewState.metadata.image} alt="Preview" class="w-full h-full object-cover" />
				{/if}
			</div>
			<div class="p-3 bg-[#3a3b3c] space-y-0.5">
				<p class="text-[12px] text-[#b0b3b8] uppercase">
					{previewState.metadata.url || previewState.inputUrl}
				</p>
				<p class="text-[16px] font-bold text-[#e4e6eb] line-clamp-1">
					{previewState.metadata.title}
				</p>
				<p class="text-[14px] text-[#b0b3b8] line-clamp-2 leading-snug">
					{previewState.metadata.description}
				</p>
			</div>
		{:else}
			<div
				class="aspect-[1.91/1] w-full bg-[#3a3b3c]/50 flex flex-col items-center justify-center space-y-3 p-12"
			>
				<div
					class="w-10 h-10 bg-[#3a3b3c] rounded-full flex items-center justify-center text-[#b0b3b8] font-black"
				>
					f
				</div>
				<p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#b0b3b8] opacity-50">
					Awaiting Signal...
				</p>
			</div>
		{/if}
	</div>
</div>
