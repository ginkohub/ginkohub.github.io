<script>
	let { meme = $bindable(), fetchMeme, accentColor } = $props();

	function copyMeme() {
		navigator.clipboard.writeText(meme.url);
		const btn = document.getElementById('copy-meme-btn');
		if (btn) {
			const originalText = btn.innerText;
			btn.innerText = 'COPIED!';
			setTimeout(() => (btn.innerText = originalText), 2000);
		}
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

	const channels = [
		{ id: 'memes', name: 'General' },
		{ id: 'dankmemes', name: 'Dank' },
		{ id: 'wholesomememes', name: 'Wholesome' },
		{ id: 'ProgrammingHumor', name: 'Dev' },
		{ id: 'softwaregore', name: 'Gore' }
	];
</script>

<div class="relative group/meme text-center md:text-left">
	<div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
		<div class="flex items-center gap-4">
			<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Digital Artifact</h2>
			<div class="flex border border-slate-800 p-0.5 bg-black">
				{#each channels as channel}
					<button
						onclick={() => {
							meme.channel = channel.id;
							fetchMeme();
						}}
						class="px-2 py-1 text-[7px] font-black uppercase transition-all {meme.channel === channel.id
							? 'bg-white text-black'
							: 'text-slate-500 hover:text-slate-300'}"
						title="Switch to {channel.name} channel"
					>
						{channel.name}
					</button>
				{/each}
			</div>
		</div>
		<div class="flex gap-3">
			<button
				id="copy-meme-btn"
				onclick={copyMeme}
				class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all text-slate-500"
				title="Copy artifact link to clipboard"
			>
				Copy Link
			</button>
			{#if typeof navigator !== 'undefined' && navigator.share}
				<button
					onclick={shareMeme}
					class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all text-slate-500"
					title="Share this artifact"
				>
					Share
				</button>
			{/if}
			<button
				onclick={fetchMeme}
				class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
				style="border-color: {accentColor}; color: {accentColor};"
				disabled={meme.loading}
				title="Fetch another random artifact"
			>
				{meme.loading ? '...' : 'Refresh →'}
			</button>
		</div>
	</div>
	<div class="space-y-3">
		{#if meme.url}
			<div
				class="relative bg-slate-900/50 overflow-hidden border border-slate-800 active:scale-[0.98] transition-transform duration-200"
			>
				<img
					src={meme.url}
					alt={meme.title}
					class="w-full max-h-[400px] object-contain grayscale-[0.2] group-hover/meme:grayscale-0 transition-all duration-500"
				/>
			</div>
			<p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">
				{meme.title}
			</p>
		{:else if meme.loading}
			<div class="flex flex-col items-center justify-center py-20 gap-4 bg-slate-900/20 border border-slate-800">
				<div
					class="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"
					style="border-top-color: {accentColor}"
				></div>
				<span class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600"
					>Downloading Artifact...</span
				>
			</div>
		{/if}
	</div>
</div>
