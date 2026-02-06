<script>
	import { microlinkFetch } from '$lib/fetcher.js';
	import ReaderModal from './ReaderModal.svelte';

	let { accentColor } = $props();

	let feeds = [
		{ name: 'Hacker News', url: 'https://news.ycombinator.com/rss' },
		{ name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
		{ name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
		{ name: 'Engadget', url: 'https://www.engadget.com/rss.xml' },
		{ name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
		{ name: 'Wired', url: 'https://www.wired.com/feed/rss' },
		{ name: 'ZDNet', url: 'https://www.zdnet.com/news/rss.xml' },
		{ name: 'VentureBeat', url: 'https://venturebeat.com/feed/' },
		{ name: 'GitHub Blog', url: 'https://github.blog/feed/' },
		{ name: 'Mozilla Hacks', url: 'https://hacks.mozilla.org/feed/' },
		{ name: 'Web.dev', url: 'https://web.dev/feed.xml' },
		{ name: 'React Blog', url: 'https://react.dev/feed.xml' },
		{ name: 'Svelte Blog', url: 'https://svelte.dev/blog/rss.xml' },
		{ name: 'Dev.to', url: 'https://dev.to/feed' },
		{ name: 'FreeCodeCamp', url: 'https://www.freecodecamp.org/news/rss/' },
		{ name: 'CSS-Tricks', url: 'https://css-tricks.com/feed/' },
		{ name: 'Smashing Mag', url: 'https://www.smashingmagazine.com/feed/' },
		{ name: 'SitePoint', url: 'https://www.sitepoint.com/feed/' },
		{ name: 'A List Apart', url: 'https://alistapart.com/main/feed/' },
		{ name: 'Daring Fireball', url: 'https://daringfireball.net/feeds/main' }
	];

	let selectedFeed = $state(feeds[0].url);
	let articles = $state([]);
	let loading = $state(false);
	let error = $state('');

	// Reader Mode State
	let readerUrl = $state('');
	let showReader = $state(false);

	function openReader(e, url) {
		e.preventDefault();
		readerUrl = url;
		showReader = true;
	}

	async function fetchFeed() {
		loading = true;
		error = '';
		articles = [];

		try {
			// Try rss2json first (cleaner results)
			const response = await fetch(
				`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(selectedFeed)}`
			);

			if (response.status === 429) {
				console.warn('rss2json rate limited. Switching to fallback protocol...');
				throw new Error('RATE_LIMIT');
			}

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
			// Fallback to Microlink if rss2json fails or is rate-limited
			console.log('Using fallback fetcher...');
			const result = await microlinkFetch(selectedFeed, { data: 'items' });

			if (result.success) {
				const items = result.data?.items || result.data || [];
				if (Array.isArray(items)) {
					articles = items.slice(0, 10).map((item) => ({
						title: item.title || 'Untitled',
						link: item.link || item.url || '#',
						date: item.pubDate || item.date || 'LATEST',
						snippet: item.description?.slice(0, 120) + '...' || 'No preview available.'
					}));
				} else {
					error = 'Primary and secondary protocols failed.';
				}
			} else {
				error = 'Network congestion. Transmission failed.';
			}
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
	{#if showReader}
		<ReaderModal url={readerUrl} onClose={() => (showReader = false)} {accentColor} />
	{/if}

	<header class="flex flex-col md:flex-row justify-between items-center gap-4">
		<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Data Stream</h2>
		<div class="relative w-full md:w-64">
			<select
				bind:value={selectedFeed}
				class="w-full bg-black border border-slate-800 text-slate-300 text-[10px] font-bold uppercase appearance-none cursor-pointer py-2 px-3 outline-none transition-all hover:bg-slate-900/50 focus:border-white/30"
			>
				{#each feeds as feed}
					<option value={feed.url}>{feed.name}</option>
				{/each}
			</select>
			<div
				class="absolute right-3 top-1/2 pointer-events-none -translate-y-1/2 text-[8px] text-slate-600"
			>
				▼
			</div>
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
						onclick={(e) => openReader(e, article.link)}
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
