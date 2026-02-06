<script>
	let { accentColor } = $props();

	let feeds = [
		{ name: 'Hacker News', url: 'https://news.ycombinator.com/rss' },
		{ name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
		{ name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
		{ name: 'CSS-Tricks', url: 'https://css-tricks.com/feed/' },
		{ name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
		{ name: 'Smashing Mag', url: 'https://www.smashingmagazine.com/feed/' },
		{ name: 'FreeCodeCamp', url: 'https://www.freecodecamp.org/news/rss/' },
		{ name: 'GitHub Blog', url: 'https://github.blog/feed/' }
	];

	let selectedFeed = $state(feeds[0].url);
	let articles = $state([]);
	let loading = $state(false);
	let error = $state('');

	async function fetchFeed() {
		loading = true;
		error = '';
		articles = [];

		try {
			// Using rss2json.com for specialized RSS parsing
			const response = await fetch(
				`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(selectedFeed)}`
			);
			const result = await response.json();

			if (result.status === 'ok' && Array.isArray(result.items)) {
				articles = result.items.slice(0, 10).map((item) => {
					return {
						title: item.title || 'Untitled',
						link: item.link || '#',
						date: item.pubDate || '',
						snippet:
							item.description
								?.replace(/<[^>]*>?/gm, '')
								.trim()
								.slice(0, 120) + '...' || 'No preview available.'
					};
				});
			} else {
				throw new Error('RSS conversion failed');
			}
		} catch (e) {
			error = 'Failed to parse transmission.';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		selectedFeed;
		fetchFeed();
	});
</script>

<div class="space-y-8">
	<header class="flex flex-col md:flex-row justify-between items-center gap-4">
		<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Data Stream</h2>
		<div class="flex flex-wrap justify-center gap-2">
			{#each feeds as feed}
				<button
					onclick={() => (selectedFeed = feed.url)}
					class="text-[8px] font-bold uppercase border px-3 py-1 transition-all
					{selectedFeed === feed.url
						? 'bg-white text-black border-white'
						: 'border-slate-800 text-slate-500 hover:border-slate-600'}"
				>
					{feed.name}
				</button>
			{/each}
		</div>
	</header>

	<div class="min-h-[400px] relative">
		{#if loading}
			<div class="space-y-4">
				{#each Array(5) as _}
					<div class="h-12 bg-slate-900/50 animate-pulse border border-slate-800/50"></div>
				{/each}
			</div>
		{:else if error}
			<div class="flex items-center justify-center h-40 border border-rose-900/30 bg-rose-950/10">
				<span class="text-[9px] font-black uppercase text-rose-500 tracking-widest">{error}</span>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-1 border border-slate-800">
				{#each articles as article}
					<a
						href={article.link}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex flex-col p-4 bg-black hover:bg-slate-900/50 transition-all border-b border-slate-800 last:border-0"
					>
						<span class="text-[7px] font-bold text-slate-600 uppercase mb-1">{article.date}</span>
						<h3
							class="text-sm font-bold text-slate-200 group-hover:text-white transition-colors font-space leading-tight"
						>
							{article.title}
						</h3>
						<p class="text-[10px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
							{article.snippet}
						</p>
						<span
							class="text-[8px] font-black text-slate-700 uppercase mt-3 group-hover:translate-x-1 transition-transform inline-block"
							style="color: {accentColor}">Access Protocol →</span
						>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
