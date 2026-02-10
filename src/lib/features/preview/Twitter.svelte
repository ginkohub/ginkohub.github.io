<script>
	import { previewState } from './previewState.svelte';
</script>

<div class="space-y-4 {previewState.isLoading ? 'opacity-20' : 'opacity-100'} transition-opacity">
	<h3
		class="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"
	>
		<span>𝕏</span> Twitter / X Card
	</h3>
	<div class="max-w-[500px] bg-black border border-slate-800 overflow-hidden font-sans">
		{#if previewState.metadata}
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
				<p class="text-[11px] text-slate-500 uppercase">
					{previewState.metadata.url || previewState.inputUrl}
				</p>
				<p class="text-[14px] font-bold text-slate-100 line-clamp-1">
					{previewState.metadata.title}
				</p>
				<p class="text-[14px] text-slate-400 line-clamp-2 leading-snug">
					{previewState.metadata.description}
				</p>
			</div>
		{:else}
			<div
				class="aspect-[1.91/1] w-full bg-slate-900/50 flex flex-col items-center justify-center space-y-3 p-12"
			>
				<div
					class="w-10 h-10 border border-slate-800 rounded-full flex items-center justify-center text-slate-700 font-black"
				>
					𝕏
				</div>
				<p class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
					Syncing Protocol...
				</p>
			</div>
		{/if}
	</div>
</div>
