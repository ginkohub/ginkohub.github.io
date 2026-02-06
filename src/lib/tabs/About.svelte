<script>
	import { fade, fly } from 'svelte/transition';
	let { data, currentQuoteIndex = $bindable(), quote, prevQuote, nextQuote, scrapedQuotes, contacts } = $props();
</script>

<div class="space-y-10 animate-in fade-in duration-500" in:fly={{ y: 10, duration: 400, delay: 100 }}>
	<!-- Rumi Section -->
	<div class="pb-10 relative group/quote text-center md:text-left">
		<div class="flex justify-end items-center mb-4">
			<div class="flex gap-2 items-center">
				<button 
					onclick={prevQuote} 
					class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
					style="border-color: var(--accent-color); color: var(--accent-color);"
				>
					← Prev
				</button>
				<span class="text-[7px] text-slate-500 font-bold uppercase tracking-widest px-2">
					{currentQuoteIndex + 1} / {scrapedQuotes.length}
				</span>
				<button 
					onclick={nextQuote} 
					class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
					style="border-color: var(--accent-color); color: var(--accent-color);"
				>
					Next →
				</button>
			</div>
		</div>
		<div class="space-y-3 min-h-[4rem]">
			<p class="text-lg md:text-xl font-bold leading-snug text-slate-200 font-space italic">
				"{quote.text}"
			</p>
			<p class="text-[9px] font-black uppercase tracking-widest text-slate-500/70">— {quote.author}</p>
		</div>
	</div>

	<div class="space-y-6 pt-6 border-t border-slate-800">
		<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-500">Connect</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
			{#each contacts as contact}
				<div class="flex flex-col group/item">
					<span class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 group-hover/item:text-slate-300 transition-colors">{contact.label}</span>
					{#if contact.link}
						<a href={contact.link} target="_blank" class="text-sm font-bold text-white hover:text-slate-300 active:text-slate-300 transition-colors w-fit break-all font-space">
							{contact.value}
						</a>
					{:else}
						<span class="text-sm font-bold text-white break-all font-space">{contact.value}</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
