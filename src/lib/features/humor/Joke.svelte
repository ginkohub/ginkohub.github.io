<script>
	let { joke, fetchJoke, accentColor } = $props();

	function copyJoke() {
		const text = `${joke.setup}\n\n${joke.punchline}`;
		navigator.clipboard.writeText(text);
		const btn = document.getElementById('copy-joke-btn');
		if (btn) {
			const originalText = btn.innerText;
			btn.innerText = 'COPIED!';
			setTimeout(() => (btn.innerText = originalText), 2000);
		}
	}

	async function shareJoke() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: 'Random Logic',
					text: `${joke.setup}\n\n${joke.punchline}`,
					url: window.location.href
				});
			} catch (err) {
				console.log('Share failed:', err);
			}
		}
	}
</script>

<div class="relative group/joke text-center md:text-left mb-10 pb-10 border-b border-slate-800/50">
	<div class="flex justify-between items-center mb-4">
		<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Random Logic</h2>
		<div class="flex gap-3">
			<button
				id="copy-joke-btn"
				onclick={copyJoke}
				class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all text-slate-500"
			>
				Copy
			</button>
			{#if typeof navigator !== 'undefined' && navigator.share}
				<button
					onclick={shareJoke}
					class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all text-slate-500"
				>
					Share
				</button>
			{/if}
			<button
				onclick={fetchJoke}
				class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
				style="border-color: {accentColor}; color: {accentColor};"
				disabled={joke.loading}
			>
				{joke.loading ? '...' : 'Shuffle →'}
			</button>
		</div>
	</div>
	<div class="space-y-3 min-h-[4rem]">
		<p class="text-lg md:text-xl font-bold leading-snug text-slate-200 font-space">{joke.setup}</p>
		{#if joke.punchline}
			<p class="text-base md:text-lg font-bold text-slate-500/70 italic">"{joke.punchline}"</p>
		{/if}
	</div>
</div>
