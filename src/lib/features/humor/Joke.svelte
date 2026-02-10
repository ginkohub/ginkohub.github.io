<script>
	import { humorState } from './humorState.svelte';

	let { accentColor } = $props();

	function copyJoke() {
		if (!humorState.joke) return;
		const text = `${humorState.joke.setup}\n\n${humorState.joke.punchline}`;
		navigator.clipboard.writeText(text);
		const btn = document.getElementById('copy-joke-btn');
		if (btn) {
			const originalText = btn.innerText;
			btn.innerText = 'COPIED!';
			setTimeout(() => (btn.innerText = originalText), 2000);
		}
	}

	async function shareJoke() {
		if (navigator.share && humorState.joke) {
			try {
				await navigator.share({
					title: 'Random Logic',
					text: `${humorState.joke.setup}\n\n${humorState.joke.punchline}`,
					url: window.location.href
				});
			} catch (err) {
				console.log('Share failed:', err);
			}
		}
	}

	// Initial load
	$effect(() => {
		if (!humorState.joke) humorState.fetchJoke();
	});
</script>

<div class="relative group/joke text-center md:text-left mb-10 pb-10 border-b border-slate-800/50">
	<div class="flex justify-between items-center mb-4">
		<div class="flex items-center gap-4">
			<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Random Logic</h2>
			{#if humorState.loadingJoke}
				<div class="flex items-center gap-2 animate-pulse">
					<div
						class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]"
					></div>
					<span class="text-[7px] font-black uppercase tracking-tighter text-slate-500"
						>Syncing...</span
					>
				</div>
			{/if}
		</div>
		<div class="flex gap-3">
			<button
				id="copy-joke-btn"
				onclick={copyJoke}
				class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all text-slate-500"
				title="Copy logic to clipboard"
			>
				Copy
			</button>
			{#if typeof navigator !== 'undefined' && navigator.share}
				<button
					onclick={shareJoke}
					class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all text-slate-500"
					title="Share this random logic"
				>
					Share
				</button>
			{/if}
			<button
				onclick={() => humorState.fetchJoke()}
				class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
				style="border-color: {accentColor}; color: {accentColor};"
				disabled={humorState.loadingJoke}
				title="Fetch another random logic"
			>
				{humorState.loadingJoke ? '...' : 'Shuffle →'}
			</button>
		</div>
	</div>
	<div class="space-y-3 min-h-[6rem] relative">
		<div
			class="transition-opacity duration-300 {humorState.loadingJoke
				? 'opacity-20 blur-[0.5px]'
				: 'opacity-100 blur-0'}"
		>
			<p class="text-lg md:text-xl font-bold leading-snug text-slate-200 font-space">
				{humorState.joke?.setup || 'Establishing uplink...'}
			</p>
			{#if humorState.joke?.punchline}
				<p class="text-base md:text-lg font-bold text-slate-500/70 italic">
					"{humorState.joke.punchline}"
				</p>
			{/if}
		</div>
	</div>
</div>
