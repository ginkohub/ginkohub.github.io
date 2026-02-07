<script>
	let { accentColor } = $props();

	const feedGroups = [
		{
			name: 'Tech Media',
			feeds: [
				{ name: 'Ars Technica', url: 'https://arstechnica.com/feed/' },
				{ name: 'Daring Fireball', url: 'https://daringfireball.net/feeds/main' },
				{ name: 'Engadget', url: 'https://www.engadget.com/rss.xml' },
				{ name: 'GSMArena', url: 'https://www.gsmarena.com/rss-news-reviews.php3' },
				{ name: 'MacRumors', url: 'https://www.macrumors.com/rss/' },
				{ name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
				{ name: 'VentureBeat', url: 'https://venturebeat.com/feed/' },
				{ name: 'Wired', url: 'https://www.wired.com/feed/rss' },
				{ name: 'ZDNet', url: 'https://www.zdnet.com/rss.xml' }
			]
		},

		{
			name: 'AI & Machine Learning',
			feeds: [
				{ name: 'Anthropic', url: 'https://www.anthropic.com/feed' },
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
				{ name: 'OpenAI', url: 'https://openai.com/blog/rss.xml' },
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
				{ name: 'Svelte Blog', url: 'https://svelte.dev/rss.xml' },
				{ name: 'Web.dev', url: 'https://web.dev/feed.xml' }
			]
		},

		{
			name: 'Language & Ecosystem Weekly',
			feeds: [
				{ name: 'Android Weekly', url: 'https://androidweekly.net/rss.xml' },
				{ name: 'Bun Blog', url: 'https://bun.com/rss.xml' },
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
					name: 'Python Weekly',
					url: 'https://us2.campaign-archive.com/feed?u=e2e180baf855ac797ef407fc7&id=9e26887fc5'
				},
				{ name: 'React Status', url: 'https://cprss.s3.amazonaws.com/react.statuscode.com.xml' },
				{ name: 'Ruby Weekly', url: 'https://cprss.s3.amazonaws.com/rubyweekly.com.xml' },
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
					url: 'https://us5.campaign-archive.com/feed?u=ea228d7061e8bbfa8639666ad&id=97e12d9faf'
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

	let selectedFeed = $state(feedGroups[0].feeds[0].url);
	let articles = $state([]);
	let loading = $state(false);
	let error = $state('');

	async function fetchFeed() {
		loading = true;
		error = '';
		articles = [];

		try {
			// Use AllOrigins as a CORS proxy to fetch raw XML
			const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(selectedFeed)}`;
			const response = await fetch(proxyUrl);
			const data = await response.json();

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
			error = 'Failed to sync with data stream.';
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

	$effect(() => {
		selectedFeed;
		fetchFeed();
	});
</script>

<div class="space-y-8">
	<header class="flex flex-col md:flex-row justify-between items-center gap-4">
		<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Data Stream</h2>
		<div class="relative w-full md:w-64">
			<select
				bind:value={selectedFeed}
				class="w-full bg-black border border-slate-800 text-slate-300 text-[10px] font-bold uppercase appearance-none cursor-pointer py-2 px-3 outline-none transition-all hover:bg-slate-900/50 focus:border-white/30"
			>
				{#each feedGroups as group}
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
						class="group flex p-4 bg-black hover:bg-slate-900/50 transition-all border-b border-slate-800 last:border-0 gap-4"
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
		{/if}
	</div>
</div>
