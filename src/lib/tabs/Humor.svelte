<script>
	import { onMount } from 'svelte';
	
	let { meme = $bindable(), joke = $bindable(), fetchMeme, fetchJoke } = $props();

	onMount(() => {
		if (!meme.url) fetchMeme();
		if (!joke.setup) fetchJoke();
	});
</script>

<div class="space-y-10">
	<!-- Joke Section -->
	<div class="relative group/joke text-center md:text-left">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Random Logic</h2>
			<button 
				onclick={fetchJoke} 
				class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
				style="border-color: var(--accent-color); color: var(--accent-color);"
				disabled={joke.loading}
			>
				{joke.loading ? '...' : 'Shuffle →'}
			</button>
		</div>
		<div class="space-y-3 min-h-[4rem]">
			<p class="text-lg md:text-xl font-bold leading-snug text-slate-200 font-space">{joke.setup}</p>
			{#if joke.punchline}
				<p class="text-base md:text-lg font-bold text-slate-400 italic">"{joke.punchline}"</p>
			{/if}
		</div>
	</div>

	<!-- Meme Section -->
	<div class="py-10 border-t border-slate-800 relative group/meme">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Digital Artifact</h2>
			<button 
				onclick={fetchMeme} 
				class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
				style="border-color: var(--accent-color); color: var(--accent-color);"
				disabled={meme.loading}
			>
				{meme.loading ? '...' : 'Refresh →'}
			</button>
		</div>
		<div class="space-y-3">
			{#if meme.url}
				<div class="relative bg-slate-900/50 overflow-hidden border border-slate-800 active:scale-[0.98] transition-transform duration-200">
					<img 
						src={meme.url} 
						alt={meme.title} 
						class="w-full max-h-[400px] object-contain grayscale-[0.2] group-hover/meme:grayscale-0 transition-all duration-500"
					/>
				</div>
				<p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{meme.title}</p>
			{:else if meme.loading}
				<div class="h-40 bg-slate-900 animate-pulse"></div>
			{/if}
		</div>
	</div>
</div>