<script>
	import { previewState } from './previewState.svelte';
</script>

<div class="space-y-4 {previewState.isLoading ? 'opacity-20' : 'opacity-100'} transition-opacity">
	<h3
		class="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"
	>
		<span>in</span> LinkedIn Post
	</h3>
	<div class="max-w-[500px] bg-white border border-slate-200 overflow-hidden font-sans">
		{#if previewState.metadata}
			<div class="aspect-[1.91/1] w-full bg-slate-100 overflow-hidden">
				{#if previewState.metadata.image}
					<img src={previewState.metadata.image} alt="Preview" class="w-full h-full object-cover" />
				{/if}
			</div>
			<div class="p-3 space-y-1">
				<p class="text-[14px] font-bold text-slate-900 line-clamp-2 leading-snug">
					{previewState.metadata.title}
				</p>
				<p class="text-[12px] text-slate-500 uppercase">
					{previewState.metadata.url || previewState.inputUrl}
				</p>
			</div>
		{:else}
			<div
				class="aspect-[1.91/1] w-full bg-slate-50 flex flex-col items-center justify-center p-12 border-b border-slate-100"
			>
				<div
					class="w-10 h-10 border border-slate-200 rounded flex items-center justify-center text-slate-300 font-black"
				>
					in
				</div>
			</div>
			<div class="p-4 space-y-2">
				<div class="h-4 w-2/3 bg-slate-100 rounded"></div>
				<div class="h-3 w-1/3 bg-slate-50 rounded"></div>
			</div>
		{/if}
	</div>
</div>
