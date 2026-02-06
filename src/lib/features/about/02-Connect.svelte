<script>
	let { contacts } = $props();
</script>

<div class="space-y-6 pt-6">
	<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Connect</h2>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
		{#each contacts as contact}
			<div class="flex flex-col group/item">
				<span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 group-hover/item:text-slate-200 transition-colors">{contact.label}</span>
				{#if contact.link}
					<a href={contact.link} target="_blank" rel="noopener noreferrer" class="text-sm font-bold text-white hover:text-slate-300 active:text-slate-300 transition-colors w-fit break-all font-space">
						{contact.value}
					</a>
				{:else}
					<span class="text-sm font-bold text-white break-all font-space">{contact.value}</span>
				{/if}
			</div>
		{/each}
	</div>
</div>
