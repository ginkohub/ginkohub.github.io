<script>
	import { humorState } from './humorState.svelte';

	let { accentColor } = $props();

	function copyMeme() {
		if (!humorState.meme) return;
		navigator.clipboard.writeText(humorState.meme.url);
		const btn = document.getElementById('copy-meme-btn');
		if (btn) {
			const originalText = btn.innerText;
			btn.innerText = 'COPIED!';
			setTimeout(() => (btn.innerText = originalText), 2000);
		}
	}

	async function shareMeme() {
		if (navigator.share && humorState.meme) {
			try {
				await navigator.share({
					title: humorState.meme.title,
					url: humorState.meme.url
				});
			} catch (err) {
				console.log('Share failed:', err);
			}
		}
	}

	// Initial load
	$effect(() => {
		if (!humorState.meme) humorState.fetchMeme();
	});

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
			<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-400">
				Digital Artifact
			</h2>
			{#if humorState.loadingMeme}
				<div class="flex items-center gap-2 animate-pulse">
					<div
						class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]"
					></div>
					<span class="text-[7px] font-black uppercase tracking-tighter text-slate-500"
						>Syncing...</span
					>
				</div>
			{/if}
			<div
				class="border border-slate-800 flex items-center gap-1 bg-black/40 border border-white/5 p-0.5"
			>
				<span class="text-[6px] font-black text-slate-600 uppercase px-1">Src</span>
				{#each channels as channel}
					<button
						onclick={() => humorState.fetchMeme(channel.id)}
						class="px-2 py-1 text-[7px] font-black uppercase transition-all {humorState.selectedChannel ===
						channel.id
							? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]'
							: 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}"
						title="Switch frequency: r/{channel.id}"
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
				onclick={() => humorState.fetchMeme(humorState.selectedChannel)}
				class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
				style="border-color: {accentColor}; color: {accentColor};"
				disabled={humorState.loadingMeme}
				title="Fetch another random artifact"
			>
				{humorState.loadingMeme ? '...' : 'Refresh →'}
			</button>
		</div>
	</div>
	<div class="space-y-3 min-h-[300px]">
		{#if humorState.meme?.url}
			<div
				class="relative bg-slate-900/50 overflow-hidden border border-slate-800 active:scale-[0.98] transition-all duration-300 {humorState.loadingMeme
					? 'opacity-40 grayscale blur-[1px]'
					: 'opacity-100 grayscale-0 blur-0'}"
			>
				<img
					src={humorState.meme.url}
					alt={humorState.meme.title || 'Meme Artifact'}
					class="w-full max-h-[400px] object-contain grayscale-[0.2] group-hover/meme:grayscale-0 transition-all duration-500"
				/>
			</div>
			<p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">
				{humorState.meme.title || ''}
			</p>
		{/if}
	</div>
</div>
