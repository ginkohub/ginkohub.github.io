<script>
	import { microlinkFetch } from '$lib/fetcher.js';
	import ReaderModal from './ReaderModal.svelte';

	let { accentColor } = $props();

	let feeds = [
		{ name: 'Hacker News', url: 'https://news.ycombinator.com/' },
		{ name: 'TechCrunch', url: 'https://techcrunch.com/' },
		{ name: 'The Verge', url: 'https://www.theverge.com/' },
		{ name: 'Engadget', url: 'https://www.engadget.com/' },
		{ name: 'Ars Technica', url: 'https://arstechnica.com/' },
		{ name: 'Wired', url: 'https://www.wired.com/' },
		{ name: 'ZDNet', url: 'https://www.zdnet.com/' },
		{ name: 'VentureBeat', url: 'https://venturebeat.com/' },
		{ name: 'GitHub Blog', url: 'https://github.blog/' },
		{ name: 'Mozilla Hacks', url: 'https://hacks.mozilla.org/' },
		{ name: 'Web.dev', url: 'https://web.dev/blog' },
		{ name: 'React Blog', url: 'https://react.dev/blog' },
		{ name: 'Svelte Blog', url: 'https://svelte.dev/blog' },
		{ name: 'Dev.to', url: 'https://dev.to/' },
		{ name: 'FreeCodeCamp', url: 'https://www.freecodecamp.org/news/' },
		{ name: 'CSS-Tricks', url: 'https://css-tricks.com/' },
		{ name: 'Smashing Mag', url: 'https://www.smashingmagazine.com/articles/' },
		{ name: 'SitePoint', url: 'https://www.sitepoint.com/' },
		{ name: 'A List Apart', url: 'https://alistapart.com/articles/' },
		{ name: 'Daring Fireball', url: 'https://daringfireball.net/' }
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
			// Using centralized Microlink fetcher with data extraction
			const result = await microlinkFetch(selectedFeed, {
				data: {
					items: {
						selector: 'h2, h3, .post-title, .entry-title',
						type: 'list',
						attr: {
							title: { text: true },
							link: { selector: 'a', attr: 'href' }
						}
					}
				}
			});

			if (result.success && result.data) {
				const rawItems = result.data.items || [];
				const items = Array.isArray(rawItems) ? rawItems : [rawItems];

				if (items.length > 0 && items[0] !== null) {
					// Filter out items without links or titles and clean URLs
					articles = items
						.filter((item) => item.title && item.link)
						.slice(0, 10)
						.map((item) => {
							let link = item.link;
							if (link.startsWith('/')) {
								const urlObj = new URL(selectedFeed);
								link = `${urlObj.origin}${link}`;
							}
							return {
								title: item.title.trim(),
								link: link,
								date: 'LATEST',
								snippet: 'Access protocol for full content extraction...'
							};
						});
				} else {
					throw new Error('Feed extraction failed');
				}
			} else {
				throw new Error('Feed extraction failed');
			}
		} catch (e) {
			error = 'Failed to sync with data stream.';
			console.error('Microlink Feed error:', e);
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
