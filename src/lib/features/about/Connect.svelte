<script>
	let { contacts } = $props();
</script>

<div class="space-y-6 pt-6">
	<h2 class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Neural Connect</h2>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
		{#each contacts as contact}
			<div
				class="flex flex-col group/item p-4 bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-300"
			>
				<span
					class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1 group-hover/item:text-slate-400 transition-colors"
					>{contact.label}</span
				>
				{#if contact.link}
					<a
						href={contact.link}
						target="_blank"
						rel="noopener noreferrer"
						class="text-md font-serif italic text-slate-300 hover:text-white active:text-white transition-colors w-fit break-all"
						title="Connect via {contact.label}"
					>
						{contact.value}
					</a>
				{:else}
					<span class="text-md font-serif italic text-slate-300 break-all">{contact.value}</span>
				{/if}
			</div>
		{/each}
	</div>
</div>
