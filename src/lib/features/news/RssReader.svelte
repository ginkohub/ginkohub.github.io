<script>
	import { fade } from 'svelte/transition';
	import { newsState } from './newsState.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';

	let { accentColor } = $props();

	// Local UI State

	let showAddModal = $state(false);

	let showSettings = $state(false);

	let newFeedName = $state('');

	let newFeedUrl = $state('');

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
		// Auto-fetch selected feeds if no articles or older than 1 hour

		const ONE_HOUR = 60 * 60 * 1000;

		if (newsState.articles.length === 0 || Date.now() - newsState.lastUpdated > ONE_HOUR) {
			newsState.refreshAll();
		}
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
						>Source Name</label
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

{#if showSettings}
	<div
		use:portal
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
		in:fade
	>
		<div
			class="w-full max-w-2xl border border-slate-800 bg-black shadow-2xl flex flex-col max-h-[80vh]"
		>
			<header
				class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/20"
			>
				<h3 class="text-[10px] font-black text-white uppercase tracking-[0.3em]">
					News Source Directory
				</h3>

				<div class="flex gap-2">
					<button
						onclick={() => newsState.selectAll(true)}
						class="text-[7px] font-black uppercase border border-white/20 text-white px-2 py-1 hover:bg-white hover:text-black transition-all"
						>Link All</button
					>

					<button
						onclick={() => newsState.selectAll(false)}
						class="text-[7px] font-black uppercase border border-white/20 text-white px-2 py-1 hover:bg-white hover:text-black transition-all"
						>Unlink All</button
					>

					<button
						onclick={() => (showSettings = false)}
						class="text-[7px] font-black uppercase bg-white text-black px-2 py-1 transition-all"
						>Close</button
					>
				</div>
			</header>

			<div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
				<div class="space-y-6">
					{#each newsState.feedGroups as group}
						<div class="space-y-2">
							<div class="flex items-center justify-between border-b border-slate-800/50 pb-1">
								<h4 class="text-[7px] font-black uppercase text-slate-500 tracking-[0.2em]">
									{group.name}
								</h4>

								<div class="flex gap-2">
									<button
										onclick={() => newsState.toggleCategory(group.name, true)}
										class="text-[6px] font-black uppercase text-slate-600 hover:text-white transition-colors"
										>Link Group</button
									>

									<button
										onclick={() => newsState.toggleCategory(group.name, false)}
										class="text-[6px] font-black uppercase text-slate-600 hover:text-rose-500 transition-colors"
										>Unlink Group</button
									>
								</div>
							</div>

							<div class="flex flex-wrap gap-1">
								{#each group.feeds as feed}
									<label
										class="flex items-center gap-2 px-2 py-1 border border-white/5 hover:bg-white/10 cursor-pointer group transition-all {newsState.selectedFeeds.includes(
											feed.url
										)
											? 'border-white/20 bg-white/5'
											: 'opacity-60'}"
									>
										<input
											type="checkbox"
											checked={newsState.selectedFeeds.includes(feed.url)}
											onchange={() => newsState.toggleFeed(feed.url)}
											class="appearance-none w-2 h-2 border border-slate-700 bg-black checked:bg-white transition-all cursor-pointer"
										/>

										<span
											class="text-[9px] font-bold uppercase tracking-tighter {newsState.selectedFeeds.includes(
												feed.url
											)
												? 'text-white'
												: 'text-slate-400'} group-hover:text-white transition-colors"
											>{feed.name}</span
										>

										{#if feed.custom}
											<button
												onclick={(e) => {
													e.preventDefault();

													if (confirm('Unlink this source permanently?')) {
														newsState.removeFeed(feed.url);
													}
												}}
												class="text-[7px] text-rose-900 hover:text-rose-500 transition-colors ml-1"
												>✕</button
											>
										{/if}
									</label>
								{/each}
							</div>
						</div>
					{/each}
				</div>
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
				onclick={() => (showSettings = true)}
				class="flex-1 md:flex-none flex items-center justify-between gap-4 px-4 py-2 bg-black border border-slate-800 text-slate-300 hover:border-white/30 transition-all group"
			>
				<div class="flex flex-col items-start">
					<span class="text-[7px] font-black uppercase text-slate-600 group-hover:text-slate-400"
						>Filter Source</span
					>

					<span class="text-[10px] font-bold uppercase tracking-tight">
						{newsState.selectedFeeds.length === 0
							? 'All Sources'
							: `${newsState.selectedFeeds.length} Sources Active`}
					</span>
				</div>

				<span class="text-[8px] text-slate-600 group-hover:text-white transition-colors">⚙️</span>
			</button>

			<button
				onclick={() => newsState.refreshAll()}
				class="px-3 border border-slate-800 text-slate-500 hover:text-white transition-all active:rotate-180 duration-500"
				title="Refresh Active Feeds"
				disabled={newsState.loading}
			>
				<span class="text-[10px]">🔄</span>
			</button>
		</div>
	</header>

	<!-- Sub-header: Actions & Filters -->

	<div class="flex flex-wrap items-center gap-2 border-y border-white/5 py-2">
		<div class="relative flex items-center">
			<span class="absolute left-2 text-[6px] font-black text-slate-500 uppercase z-10">Filter</span
			>

			<select
				value={newsState.filterMode}
				onchange={(e) => newsState.setFilterMode(e.currentTarget.value)}
				class="bg-slate-900 border border-slate-800 text-white text-[8px] font-black uppercase tracking-widest pl-10 pr-6 py-1.5 outline-none focus:border-white/20 appearance-none cursor-pointer hover:bg-slate-800 transition-all"
			>
				<option value="all">ALL</option>

				<option value="new">NEW</option>

				<option value="old">ARCHIVED</option>
			</select>

			<div class="absolute right-2 pointer-events-none text-[6px] text-slate-500">▼</div>
		</div>

		{#if newsState.hasNewOnPage}
			<button
				onclick={() => newsState.markPageAsRead()}
				class="px-3 py-1.5 border border-slate-800 text-slate-500 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest bg-slate-900/50 hover:border-slate-600"
				title="Clear NEW indicators on this page"
			>
				Page Read
			</button>
		{/if}

		{#if newsState.hasReadOnPage}
			<button
				onclick={() => newsState.markPageAsUread()}
				class="px-3 py-1.5 border border-slate-800 text-slate-500 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest bg-slate-900/50 hover:border-slate-600"
				title="Mark all articles as NEW"
			>
				Page Unread
			</button>
		{/if}

		<div class="ml-auto flex items-center gap-4">
			<span class="text-[7px] font-black uppercase text-slate-600 tracking-[0.2em]">
				{newsState.filteredArticles.length} / {newsState.articles.length}
			</span>
		</div>
	</div>

	<div class="min-h-[400px] relative">
		{#if newsState.loading && newsState.filteredArticles.length === 0}
			<div class="flex flex-col items-center justify-center py-20 gap-4">
				<div
					class="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"
					style="border-top-color: {accentColor}"
				></div>

				<span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
					>Establishing Link...</span
				>
			</div>
		{:else if newsState.error && newsState.filteredArticles.length === 0}
			<div
				class="flex flex-col items-center justify-center py-20 gap-4 border border-rose-900/30 bg-rose-950/5"
			>
				<div class="text-rose-500 text-2xl">⚠️</div>

				<span class="text-[9px] font-black uppercase text-rose-500 tracking-widest text-center px-4"
					>{newsState.error}</span
				>

				<div class="flex gap-2">
					<button
						onclick={() => newsState.refreshAll()}
						class="mt-2 text-[8px] font-black uppercase border border-rose-900/50 px-3 py-1 text-rose-500 hover:bg-rose-500 hover:text-black transition-all"
						title="Retry fetching feeds"
					>
						Retry Protocol
					</button>
				</div>
			</div>
		{:else if newsState.filteredArticles.length === 0}
			<div
				class="flex flex-col items-center justify-center py-20 gap-4 border border-slate-800 bg-slate-900/5"
			>
				<div class="text-slate-500 text-2xl">📡</div>

				<span
					class="text-[9px] font-black uppercase text-slate-500 tracking-widest text-center px-4"
					>No Active Sources in this Sector</span
				>

				<button
					onclick={() => (showSettings = true)}
					class="mt-2 text-[8px] font-black uppercase border border-slate-800 px-3 py-1 text-slate-400 hover:bg-white hover:text-black transition-all"
				>
					Select Sources
				</button>
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

				{#each newsState.paginatedArticles as article}
					<a
						href={article.link}
						target="_blank"
						rel="noopener noreferrer"
						onclick={() => newsState.markAsRead(article.link)}
						class="group flex p-3 bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all duration-300 relative overflow-hidden gap-4 {article.isNew
							? 'opacity-100'
							: 'opacity-40 hover:opacity-100'}"
						title="Read full article from {article.sourceName}: {article.title}"
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
								<div class="flex items-center gap-2">
									<span
										class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400"
										style="color: var(--accent-color)">{article.date}</span
									>

									<span class="text-[6px] text-slate-700">•</span>

									<span
										class="text-[7px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors"
										>Source: {article.sourceName}</span
									>

									{#if article.isNew}
										<span
											class="px-1 bg-rose-600 text-white text-[6px] font-black uppercase tracking-tighter animate-pulse shadow-[0_0_5px_rgba(225,29,72,0.5)]"
											>NEW</span
										>
									{/if}
								</div>

								<button
									onclick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										newsState.markAsRead(article.link);
									}}
									class="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 border border-white/10 hover:border-white/40 hover:bg-white/5 transition-all"
									title={article.isNew ? 'Mark as Read' : 'Mark as Unread'}
								>
									{article.isNew ? 'READ' : 'UNREAD'}
								</button>
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

			<!-- Pagination Controls -->
			{#if newsState.totalPages > 1}
				<div class="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-white/5">
					<button
						onclick={() => newsState.prevPage()}
						disabled={newsState.currentPage === 1}
						class="px-4 py-2 border border-slate-800 text-[8px] font-black uppercase tracking-widest hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
					>
						PREV
					</button>

					<div class="flex items-center gap-2">
						<span class="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Page</span
						>
						<span class="text-[10px] font-bold text-white">{newsState.currentPage}</span>
						<span class="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">of</span>
						<span class="text-[10px] font-bold text-white">{newsState.totalPages}</span>
					</div>

					<button
						onclick={() => newsState.nextPage()}
						disabled={newsState.currentPage === newsState.totalPages}
						class="px-4 py-2 border border-slate-800 text-[8px] font-black uppercase tracking-widest hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
					>
						NEXT
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.02);
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
