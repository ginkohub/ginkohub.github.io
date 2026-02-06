<script>
	import { previewState } from './previewState.svelte.js';
	let { accentColor } = $props();
</script>

<div class="space-y-4 {previewState.isLoading ? 'opacity-20' : 'opacity-100'} transition-opacity">
	<h3
		class="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"
	>
		<span>🎮</span> Discord Embed
	</h3>
	<div
		class="max-w-[400px] bg-[#2b2d31] border-l-4 p-4 space-y-3"
		style="border-color: {accentColor}"
	>
		<p class="text-[#00a8fc] text-[14px] font-bold hover:underline cursor-pointer">
			{previewState.metadata.title}
		</p>
		<p class="text-[#dbdee1] text-[14px] leading-snug">{previewState.metadata.description}</p>
		{#if previewState.metadata.image}
			<div class="rounded-md overflow-hidden bg-black border border-white/5 shadow-2xl">
				<img src={previewState.metadata.image} alt="Preview" class="w-full h-auto" />
			</div>
		{/if}
	</div>
</div>
