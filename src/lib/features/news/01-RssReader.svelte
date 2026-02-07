<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let { accentColor } = $props();

	const defaultFeedGroups = [
		{
			name: 'Tech Media',
			feeds: [
				{ name: 'Ars Technica', url: 'https://arstechnica.com/feed/' },
				{ name: 'Daring Fireball', url: 'https://daringfireball.net/feeds/main' },
				{ name: 'Engadget', url: 'https://www.engadget.com/rss.xml' },
				{ name: 'GSMArena', url: 'https://www.gsmarena.com/rss-news-reviews.php3' },
				{ name: 'MacRumors', url: 'https://feeds.macrumors.com/MacRumors-All' },
				{ name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
				{ name: 'VentureBeat', url: 'https://venturebeat.com/feed/' },
				{ name: 'Wired', url: 'https://www.wired.com/feed/rss' },
				{ name: 'ZDNet', url: 'https://www.zdnet.com/rss.xml' }
			]
		},

		{
			name: 'AI & Machine Learning',
			feeds: [
				{ name: 'Ahead of AI', url: 'https://magazine.sebastianraschka.com/feed' },
				{ name: 'Cohere', url: 'https://txt.cohere.com/rss/' },
				{ name: 'Google AI', url: 'https://blog.google/technology/ai/rss/' },
				{ name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml' },
				{ name: 'LangChain', url: 'https://blog.langchain.dev/rss/' },
				{ name: 'Last Week in AI', url: 'https://lastweekin.ai/feed' },
				{ name: 'Machine Learning Mastery', url: 'https://machinelearningmastery.com/feed/' },
				{ name: 'Microsoft AI', url: 'https://blogs.microsoft.com/ai/feed/' },
				{
					name: 'NVIDIA Deep Learning',
					url: 'https://blogs.nvidia.com/blog/category/deep-learning/feed/'
				},
				{ name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
				{ name: 'The Sequence', url: 'https://thesequence.substack.com/feed' }
			]
		},

		{
			name: 'Developer Blogs',
			feeds: [
				{ name: 'A List Apart', url: 'https://alistapart.com/main/feed/' },
				{ name: 'CodePen Blog', url: 'https://blog.codepen.io/feed/' },
				{ name: 'CSS-Tricks', url: 'https://css-tricks.com/feed/' },
				{ name: 'Dev.to', url: 'https://dev.to/rss' },
				{ name: 'FreeCodeCamp', url: 'https://www.freecodecamp.org/news/rss/' },
				{ name: 'GitHub Blog', url: 'https://github.blog/feed/' },
				{ name: 'Google Developers', url: 'https://developers.googleblog.com/atom.xml' },
				{ name: 'Martin Fowler', url: 'https://martinfowler.com/feed.atom' },
				{ name: 'Mozilla Hacks', url: 'https://hacks.mozilla.org/feed/' },
				{ name: 'React Blog', url: 'https://react.dev/feed.xml' },
				{ name: 'SitePoint', url: 'https://www.sitepoint.com/feed/' },
				{ name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/' },
				{ name: 'Stack Overflow Blog', url: 'https://stackoverflow.blog/feed/' },
				{ name: 'Svelte Blog', url: 'https://svelte.dev/blog/rss.xml' },
				{ name: 'Web.dev', url: 'https://web.dev/feed.xml' }
			]
		},

		{
			name: 'Language & Ecosystem Weekly',
			feeds: [
				{ name: 'Android Weekly', url: 'https://androidweekly.net/rss.xml' },
				{ name: 'Bun Blog', url: 'https://bun.sh/rss.xml' },
				{ name: 'CSS Weekly', url: 'http://feeds.feedburner.com/CSS-Weekly' },
				{ name: 'Deno News', url: 'https://buttondown.email/denonews/rss' },
				{ name: 'ESNext News', url: 'http://feeds.feedburner.com/EsnextNews' },
				{ name: 'Frontend Focus', url: 'https://cprss.s3.amazonaws.com/frontendfoc.us.xml' },
				{ name: 'Go Blog', url: 'https://go.dev/blog/feed.atom' },
				{ name: 'Golang Weekly', url: 'https://cprss.s3.amazonaws.com/golangweekly.com.xml' },
				{ name: 'iOS Dev Weekly', url: 'https://iosdevweekly.com/issues.rss' },
				{
					name: 'JavaScript Weekly',
					url: 'https://cprss.s3.amazonaws.com/javascriptweekly.com.xml'
				},
				{ name: 'Node.js Blog', url: 'https://nodejs.org/en/feed/blog.xml' },
				{ name: 'Node.js Weekly', url: 'https://cprss.s3.amazonaws.com/nodeweekly.com.xml' },
				{ name: 'PHP Weekly', url: 'https://www.phpweekly.com/rss.xml' },
				{ name: 'PostgreSQL Weekly', url: 'https://cprss.s3.amazonaws.com/postgresweekly.com.xml' },
				{
					name: "PyCoder's Weekly",
					url: 'https://pycoders.com/feed'
				},
				{ name: 'React Status', url: 'https://reactstatus.com/rss' },
				{ name: 'Ruby Weekly', url: 'https://rubyweekly.com/rss' },
				{ name: 'Rust Weekly', url: 'https://this-week-in-rust.org/rss.xml' },
				{ name: 'Serverless Status', url: 'https://serverless.email/rss/' },
				{ name: 'Tailwind Weekly', url: 'https://tailwindweekly.com/rss/' },
				{ name: 'The New Stack', url: 'https://thenewstack.io/blog/feed/' },
				{
					name: 'TypeScript Weekly',
					url: 'https://us14.campaign-archive.com/feed?u=809daf9442ece0a92a3d65f99&id=5693c0ed42'
				},
				{
					name: 'VS Code Updates',
					url: 'https://code.visualstudio.com/feed.xml'
				},
				{ name: 'WebAssembly Weekly', url: 'https://wasmweekly.news/feed.xml' }
			]
		},

		{
			name: 'Editors & Tools',
			feeds: [
				{ name: 'Emacs Weekly', url: 'https://sachachua.com/blog/category/weekly/feed/' },
				{ name: 'JS Tools', url: 'https://jstools.substack.com/feed' },
				{ name: 'Neovim Weekly', url: 'https://dotfyle.com/this-week-in-neovim/rss.xml' },
				{
					name: 'Web Tools',
					url: 'https://us5.campaign-archive.com/feed?u=ea228d7061e8bbfa8639666ad&id=104d6bcc2d'
				}
			]
		}
	];

	// Persistence State
	let customFeeds = $state([]);
	let showAddModal = $state(false);
	let newFeedName = $state('');
	let newFeedUrl = $state('');

	const feedGroups = $derived([
		...(customFeeds.length > 0 ? [{ name: 'Custom Feeds', feeds: customFeeds }] : []),
		...defaultFeedGroups
	]);

	let selectedFeed = $state(defaultFeedGroups[0].feeds[0].url);
	let articles = $state([]);
	let loading = $state(false);
	let error = $state('');

	function loadCustomFeeds() {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('ginkohub_custom_feeds');
			if (saved) customFeeds = JSON.parse(saved);
		}
	}

	function saveFeed() {
		if (!newFeedName || !newFeedUrl) return;
		try {
			new URL(newFeedUrl); // Validate URL
			const feed = { name: newFeedName, url: newFeedUrl, custom: true };
			customFeeds = [...customFeeds, feed];
			localStorage.setItem('ginkohub_custom_feeds', JSON.stringify(customFeeds));
			selectedFeed = newFeedUrl;
			newFeedName = '';
			newFeedUrl = '';
			showAddModal = false;
		} catch (e) {
			alert('Invalid URL format');
		}
	}

	function removeFeed(url) {
		customFeeds = customFeeds.filter((f) => f.url !== url);
		localStorage.setItem('ginkohub_custom_feeds', JSON.stringify(customFeeds));
		if (selectedFeed === url) selectedFeed = defaultFeedGroups[0].feeds[0].url;
	}

	async function fetchFeed() {
		loading = true;
		error = '';
		articles = [];

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

		try {
			// Use AllOrigins as a CORS proxy to fetch raw XML
			const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(selectedFeed)}`;
			const response = await fetch(proxyUrl, { signal: controller.signal });
			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();

			if (data.status && data.status.http_code && data.status.http_code >= 400) {
				throw new Error(`Target Server Error: ${data.status.http_code}`);
			}

			if (data.contents) {
				let rawContent = data.contents;

				// Handle Base64 encoded responses (Data URI)
				if (rawContent.startsWith('data:')) {
					const base64Part = rawContent.split(',')[1];
					if (base64Part) {
						rawContent = atob(base64Part);
					}
				}

				const parser = new DOMParser();
				const xmlDoc = parser.parseFromString(rawContent, 'text/xml');

				// Handle parsing error
				if (xmlDoc.querySelector('parsererror')) {
					throw new Error('XML Parsing failed');
				}

				const items = Array.from(xmlDoc.querySelectorAll('item, entry')).slice(0, 10);

				if (items.length === 0) {
					throw new Error('Feed is empty or format unsupported');
				}

				const feedHostname = new URL(selectedFeed).hostname;
				const fallbackImage = `https://www.google.com/s2/favicons?domain=${feedHostname}&sz=64`;

				articles = items.map((item) => {
					// Extract fields with fallbacks for RSS vs Atom
					const rawTitle = item.querySelector('title')?.textContent || 'Untitled Protocol';
					const title = fixEncoding(rawTitle);

					// Link can be a tag text or an href attribute (Atom)
					let link = item.querySelector('link')?.textContent;
					if (!link) link = item.querySelector('link')?.getAttribute('href');

					// Date
					const pubDate = item.querySelector('pubDate, published, updated')?.textContent;
					const date = pubDate ? new Date(pubDate).toISOString().split('T')[0] : 'LATEST';

					// Description/Snippet
					const desc = item.querySelector('description, summary, content')?.textContent || '';
					const snippet = desc
						? desc.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
						: 'Access protocol for full content extraction...';

					// Thumbnail extraction
					let image = null;

					// 1. Try media:content / media:thumbnail
					const media =
						item.getElementsByTagNameNS('*', 'content')[0] ||
						item.getElementsByTagNameNS('*', 'thumbnail')[0];
					if (media && media.getAttribute('url')) {
						image = media.getAttribute('url');
					}

					// 2. Try enclosure
					if (!image) {
						const enclosure = item.querySelector('enclosure');
						if (enclosure && enclosure.getAttribute('type')?.startsWith('image')) {
							image = enclosure.getAttribute('url');
						}
					}

					// 3. Try parsing description/content for img tag
					if (!image && desc) {
						const imgMatch = desc.match(/<img[^>]+src="([^">]+)"/);
						if (imgMatch) {
							image = imgMatch[1];
						}
					}

					return {
						title,
						link,
						date,
						snippet,
						image: image || fallbackImage
					};
				});
			} else {
				throw new Error('Proxy returned no content');
			}
		} catch (e) {
			clearTimeout(timeoutId);
			if (e.name === 'AbortError') {
				error = 'Connection timed out (10s limit).';
			} else {
				error = `Sync Error: ${e.message}`;
			}
			console.error('RSS Feed error:', e);
		} finally {
			loading = false;
		}
	}

	function fixEncoding(str) {
		if (!str) return str;

		// Common mojibake indicators (UTF-8 read as Latin-1)
		if (!/[âÃ¤Ã¶Ã¼Ãâââ]/.test(str)) {
			return str;
		}

		try {
			return decodeURIComponent(
				Array.from(str, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
			);
		} catch {
			return str;
		}
	}

	onMount(() => {
		loadCustomFeeds();
	});

	$effect(() => {
		selectedFeed;
		fetchFeed();
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
					<label class="text-[7px] font-bold uppercase text-slate-500">Protocol Name</label>
					<input
						bind:value={newFeedName}
						placeholder="e.g. My Blog"
						class="w-full bg-slate-900/50 border border-slate-800 p-2 text-xs text-white outline-none focus:border-white/20"
					/>
				</div>
				<div class="space-y-1">
					<label class="text-[7px] font-bold uppercase text-slate-500">Source URL</label>
					<input
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
		{#if loading}
			<div class="flex flex-col items-center justify-center py-20 gap-4">
				<div
					class="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"
					style="border-top-color: {accentColor}"
				></div>
				<span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
					>Establishing Link...</span
				>
			</div>
		{:else if error}
			<div
				class="flex flex-col items-center justify-center py-20 gap-4 border border-rose-900/30 bg-rose-950/5"
			>
				<div class="text-rose-500 text-2xl">⚠️</div>
				<span class="text-[9px] font-black uppercase text-rose-500 tracking-widest text-center px-4"
					>{error}</span
				>
				<div class="flex gap-2">
					<button
						onclick={fetchFeed}
						class="mt-2 text-[8px] font-black uppercase border border-rose-900/50 px-3 py-1 text-rose-500 hover:bg-rose-500 hover:text-black transition-all"
						title="Retry fetching the feed"
					>
						Retry Protocol
					</button>
					{#if customFeeds.some((f) => f.url === selectedFeed)}
						<button
							onclick={() => removeFeed(selectedFeed)}
							class="mt-2 text-[8px] font-black uppercase border border-slate-800 px-3 py-1 text-slate-500 hover:bg-rose-500 hover:text-black transition-all"
						>
							Purge Link
						</button>
					{/if}
				</div>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-1 border border-slate-800">
				{#each articles as article}
					<a
						href={article.link}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex p-4 bg-black hover:bg-slate-900/50 transition-all border-b border-slate-800 last:border-0 gap-4"
						title="Read full article: {article.title}"
					>
						<div
							class="flex-shrink-0 w-16 h-16 border border-slate-800 bg-slate-900 overflow-hidden flex items-center justify-center"
						>
							<img
								src={article.image}
								alt=""
								class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
								onerror={(e) => (e.target.style.display = 'none')}
							/>
						</div>
						<div class="flex flex-col min-w-0 flex-1">
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
						</div>
					</a>
				{/each}
			</div>

			{#if customFeeds.some((f) => f.url === selectedFeed)}
				<div class="flex justify-center pt-8">
					<button
						onclick={() => removeFeed(selectedFeed)}
						class="text-[8px] font-black uppercase border border-slate-800 px-4 py-2 text-slate-600 hover:bg-rose-950/20 hover:text-rose-500 transition-all"
					>
						Unlink Custom Protocol
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>