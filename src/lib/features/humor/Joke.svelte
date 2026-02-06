<script>
	let { joke, fetchJoke, accentColor } = $props();
</script>

<div class="relative group/joke text-center md:text-left mb-10 pb-10 border-b border-slate-800/50">
	<div class="flex justify-between items-center mb-4">
		<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Random Logic</h2>
		<button 
			onclick={fetchJoke} 
			class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
			style="border-color: {accentColor}; color: {accentColor};"
			disabled={joke.loading}
		>
			{joke.loading ? '...' : 'Shuffle →'}
		</button>
	</div>
	<div class="space-y-3 min-h-[4rem]">
		<p class="text-lg md:text-xl font-bold leading-snug text-slate-200 font-space">{joke.setup}</p>
		{#if joke.punchline}
			<p class="text-base md:text-lg font-bold text-slate-500/70 italic">"{joke.punchline}"</p>
		{/if}
	</div>
</div>
