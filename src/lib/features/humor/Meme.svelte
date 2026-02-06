<script>
	let { meme, fetchMeme, accentColor } = $props();

	function copyMeme() {
		navigator.clipboard.writeText(meme.url);
		const btn = document.getElementById('copy-meme-btn');
		const originalText = btn.innerText;
		btn.innerText = 'COPIED!';
		setTimeout(() => btn.innerText = originalText, 2000);
	}

	async function shareMeme() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: meme.title,
					url: meme.url
				});
			} catch (err) {
				console.log('Share failed:', err);
			}
		}
	}
</script>

<div class="relative group/meme text-center md:text-left">
	<div class="flex justify-between items-center mb-4">
		<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Digital Artifact</h2>
		<div class="flex gap-3">
			<button 
				id="copy-meme-btn"
				onclick={copyMeme}
				class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all text-slate-500"
			>
				Copy Link
			</button>
			{#if typeof navigator !== 'undefined' && navigator.share}
				<button 
					onclick={shareMeme}
					class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all text-slate-500"
				>
					Share
				</button>
			{/if}
			<button 
				onclick={fetchMeme} 
				class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
				style="border-color: {accentColor}; color: {accentColor};"
				disabled={meme.loading}
			>
				{meme.loading ? '...' : 'Refresh →'}
			</button>
		</div>
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