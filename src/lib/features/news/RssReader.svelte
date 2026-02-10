<script>
	import { fade } from 'svelte/transition';
	import { newsState } from './newsState.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';

	let { accentColor } = $props();

	// Local UI State
	let showAddModal = $state(false);
	let newFeedName = $state('');
	let newFeedUrl = $state('');

	const nextFeedName = $derived(
		newsState.allFeeds[
			(newsState.allFeeds.findIndex((f) => f.url === newsState.selectedFeed) + 1) %
				newsState.allFeeds.length
		]?.name || 'Next'
	);
	const prevFeedName = $derived(
		newsState.allFeeds[
			(newsState.allFeeds.findIndex((f) => f.url === newsState.selectedFeed) -
				1 +
				newsState.allFeeds.length) %
				newsState.allFeeds.length
		]?.name || 'Previous'
	);

	function saveFeed() {
		if (!newFeedName || !newFeedUrl) return;

		const result = newsState.addFeed(newFeedName, newFeedUrl);

		if (result.success) {
			newFeedName = '';
			newFeedUrl = '';
			showAddModal = false;
		} else {
			alert(result.message);
		}
	}

	$effect(() => {
		newsState.selectedFeed; // Dependency
		newsState.fetchFeed();
	});

	function portal(node) {
		document.body.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) node.parentNode.removeChild(node);
			}
		};
	}
</script>

{#if showAddModal}
	<div
		use:portal
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
		in:fade
	>
		<div class="w-full max-w-sm border border-slate-800 bg-black p-6 space-y-6 shadow-2xl">
			<h3 class="text-[10px] font-black text-white uppercase tracking-[0.3em]">Configure Link</h3>
			<div class="space-y-4">
				<div class="space-y-1">
					<label for="feed-name" class="text-[7px] font-bold uppercase text-slate-500"
						>Protocol Name</label
					>
					<input
						id="feed-name"
						bind:value={newFeedName}
						placeholder="e.g. My Blog"
						class="w-full bg-slate-900/50 border border-slate-800 p-2 text-xs text-white outline-none focus:border-white/20"
					/>
				</div>
				<div class="space-y-1">
					<label for="feed-url" class="text-[7px] font-bold uppercase text-slate-500"
						>Source URL</label
					>
					<input
						id="feed-url"
						bind:value={newFeedUrl}
						placeholder="https://site.com/rss"
						class="w-full bg-slate-900/50 border border-slate-800 p-2 text-xs text-white outline-none focus:border-white/20"
					/>
				</div>
			</div>
			<div class="flex gap-2">
				<button
					onclick={saveFeed}
					class="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-white text-black active:scale-95 transition-all"
				>
					Sync Source
				</button>
				<button
					onclick={() => (showAddModal = false)}
					class="px-4 py-3 text-[10px] font-black uppercase tracking-widest border border-slate-800 text-slate-500 active:scale-95 transition-all"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}

<div class="space-y-8">
	<header class="flex flex-col md:flex-row justify-between items-center gap-4">
		<div class="flex items-center gap-4">
			<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Data Stream</h2>
			{#if newsState.loading}
				<div class="flex items-center gap-2 animate-pulse">
					<div
						class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]"
					></div>
					<span class="text-[7px] font-black uppercase tracking-tighter text-slate-500"
						>Syncing...</span
					>
				</div>
			{/if}
			<button
				onclick={() => (showAddModal = true)}
				class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all"
				title="Add custom RSS feed"
			>
				+ Add Feed
			</button>
		</div>

		<div class="flex items-stretch gap-2 w-full md:w-auto">
			<button
				onclick={() => newsState.prevFeed()}
				class="px-2 border border-slate-800 text-slate-500 hover:text-white transition-colors"
				title="Previous: {prevFeedName}"
			>
				<span class="text-[8px]">◀</span>
			</button>

			<div class="relative flex-1 md:w-64">
				<select
					bind:value={newsState.selectedFeed}
					class="w-full h-full bg-black border border-slate-800 text-slate-300 text-[10px] font-bold uppercase appearance-none cursor-pointer py-2 px-3 outline-none transition-all hover:bg-slate-900/50 focus:border-white/30"
				>
					{#each newsState.feedGroups as group}
						<optgroup label={group.name} class="bg-black text-slate-500 font-black tracking-widest">
							{#each group.feeds as feed}
								<option value={feed.url} class="text-slate-300 font-bold">{feed.name}</option>
							{/each}
						</optgroup>
					{/each}
				</select>
				<div
					class="absolute right-3 top-1/2 pointer-events-none -translate-y-1/2 text-[8px] text-slate-600"
				>
					▼
				</div>
			</div>

			<button
				onclick={() => newsState.nextFeed()}
				class="px-2 border border-slate-800 text-slate-500 hover:text-white transition-colors"
				title="Next: {nextFeedName}"
			>
				<span class="text-[8px]">▶</span>
			</button>

			{#if newsState.customFeeds.some((f) => f.url === newsState.selectedFeed)}
				<button
					onclick={() => {
						if (confirm('Are you sure you want to unlink this protocol?')) {
							newsState.removeFeed(newsState.selectedFeed);
						}
					}}
					class="px-2 border border-rose-900/30 text-rose-900 hover:text-rose-500 hover:bg-rose-950/20 transition-all"
					title="Purge custom protocol"
				>
					<span class="text-[8px]">✖</span>
				</button>
			{/if}
		</div>
	</header>

	<div class="min-h-[400px] relative">
		{#if newsState.loading && newsState.articles.length === 0}
			<div class="flex flex-col items-center justify-center py-20 gap-4">
				<div
					class="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"
					style="border-top-color: {accentColor}"
				></div>
				<span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
					>Establishing Link...</span
				>
			</div>
		{:else if newsState.error && newsState.articles.length === 0}
			<div
				class="flex flex-col items-center justify-center py-20 gap-4 border border-rose-900/30 bg-rose-950/5"
			>
				<div class="text-rose-500 text-2xl">⚠️</div>
				<span class="text-[9px] font-black uppercase text-rose-500 tracking-widest text-center px-4"
					>{newsState.error}</span
				>
				<div class="flex gap-2">
					<button
						onclick={() => newsState.fetchFeed()}
						class="mt-2 text-[8px] font-black uppercase border border-rose-900/50 px-3 py-1 text-rose-500 hover:bg-rose-500 hover:text-black transition-all"
						title="Retry fetching the feed"
					>
						Retry Protocol
					</button>
				</div>
			</div>
		{:else}
			<div
				class="space-y-1 transition-all duration-500 {newsState.loading
					? 'opacity-40 grayscale blur-[1px]'
					: 'opacity-100 grayscale-0 blur-0'}"
			>
				{#if newsState.error}
					<div
						class="p-2 mb-4 bg-rose-950/20 border border-rose-900/30 text-center animate-in fade-in slide-in-from-top-1"
					>
						<span class="text-[8px] font-black uppercase text-rose-500 tracking-widest"
							>Source Sync Failed: {newsState.error}</span
						>
					</div>
				{/if}
				{#each newsState.articles as article}
					<a
						href={article.link}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex p-3 bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all duration-300 relative overflow-hidden gap-4"
						title="Read full article: {article.title}"
					>
						<!-- Sharp Thumbnail -->
						{#if article.image}
							<div
								class="flex-shrink-0 w-12 h-12 border border-white/5 bg-slate-950 overflow-hidden"
							>
								<LazyImage
									src={article.image}
									alt=""
									class="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
									fallbackText="NWS"
								/>
							</div>
						{/if}

						<div class="flex flex-col gap-1 relative z-10 flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span
									class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400"
									style="color: var(--accent-color)">{article.date}</span
								>
								<span
									class="text-[7px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors"
									>Protocol: Source</span
								>
							</div>

							<h3
								class="text-sm md:text-lg font-serif italic text-slate-200 group-hover:text-white transition-colors leading-tight"
							>
								{article.title}
							</h3>

							<p
								class="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors leading-tight"
							>
								{article.snippet}
							</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
