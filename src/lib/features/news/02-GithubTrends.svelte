<script>
	import { microlinkFetch } from '$lib/fetcher.js';

	let { accentColor } = $props();

	let repos = $state([]);
	let developers = $state([]);
	let loading = $state(false);
	let error = $state('');
	let mode = $state('repositories'); // 'repositories' or 'developers'

	let languages = [
		'all',
		'javascript',
		'typescript',
		'svelte',
		'python',
		'go',
		'rust',
		'cpp',
		'java',
		'php',
		'ruby'
	];
	let selectedLang = $state('all');

	let isFallback = $state(false);

	async function fetchData() {
		loading = true;
		error = '';
		isFallback = false;
		repos = [];
		developers = [];

		try {
			const langParam = selectedLang === 'all' ? '' : selectedLang;
			const typePath = mode === 'repositories' ? 'trending' : 'trending/developers';
			const targetUrl = `https://github.com/${typePath}/${langParam}?since=daily`;

			// Use Microlink for robust scraping
			const res = await microlinkFetch(targetUrl, {
				meta: false,
				prerender: true // Ensure content is fully rendered
			});

			if (!res.success) {
				throw new Error(res.error);
			}

			// Microlink returns the page content in res.data.html
			const rawContent = res.data.html;

			if (rawContent) {
				const parser = new DOMParser();
				const doc = parser.parseFromString(rawContent, 'text/html');
				const items = Array.from(doc.querySelectorAll('article.Box-row'));

				if (items.length > 0) {
					if (mode === 'repositories') {
						repos = items.slice(0, 10).map((item) => {
							const titleLink = item.querySelector('h2 a');
							const rawTitle = titleLink ? titleLink.innerText.trim() : 'Unknown / Unknown';
							const parts = rawTitle.split('/').map((s) => s.trim());

							const author = parts[0] || 'GitHub';
							const name = parts[1] || rawTitle;

							let link = titleLink ? titleLink.getAttribute('href') : '';
							if (link && !link.startsWith('http')) link = `https://github.com${link}`;

							const descEl = item.querySelector('p');
							const description = descEl ? descEl.innerText.trim() : 'No description provided.';

							// Try to find stars
							const starEl = item.querySelector('a[href$="/stargazers"]');
							const stars = starEl ? starEl.innerText.trim() : '';

							return {
								author,
								name,
								url: link,
								description,
								stars
							};
						});
					} else {
						developers = items.slice(0, 10).map((item) => {
							const nameLink = item.querySelector('h1 a');
							const name = nameLink ? nameLink.innerText.trim() : 'Unknown';

							let link = nameLink ? nameLink.getAttribute('href') : '';
							if (link && !link.startsWith('http')) link = `https://github.com${link}`;

							// Extract username from link for avatar
							const username = link.split('/').pop();

							const descEl = item.querySelector('.f4') || item.querySelector('.Link--secondary');
							const description = descEl ? descEl.innerText.trim() : '';

							return {
								name,
								username,
								url: link,
								description
							};
						});
					}
				} else {
					throw new Error('Structural mismatch (GitHub changed?)');
				}
			} else {
				throw new Error('No content returned from gateway');
			}
		} catch (e) {
			console.error('Scraping error:', e);

			// Fallback / Offline Mode
			isFallback = true;
			if (mode === 'repositories') {
				repos = [
					{
						author: 'sveltejs',
						name: 'svelte',
						url: 'https://github.com/sveltejs/svelte',
						description: 'Cybernetically enhanced web apps.',
						stars: '75k'
					},
					{
						author: 'bun-sh',
						name: 'bun',
						url: 'https://github.com/bun-sh/bun',
						description:
							'Incredibly fast JavaScript runtime, bundler, test runner, and package manager.',
						stars: '72k'
					},
					{
						author: 'torvalds',
						name: 'linux',
						url: 'https://github.com/torvalds/linux',
						description: 'Linux kernel source tree.',
						stars: '170k'
					},
					{
						author: 'ginkohub',
						name: 'ginkohub.github.io',
						url: 'https://github.com/ginkohub/ginkohub.github.io',
						description: 'The source code for this very interface.',
						stars: '∞'
					}
				];
			} else {
				developers = [
					{
						name: 'Rich Harris',
						username: 'Rich-Harris',
						url: 'https://github.com/Rich-Harris',
						description: 'Creator of Svelte.'
					},
					{
						name: 'Evan You',
						username: 'yyx990803',
						url: 'https://github.com/yyx990803',
						description: 'Creator of Vue.js.'
					},
					{
						name: 'Jarred Sumner',
						username: 'Jarred-Sumner',
						url: 'https://github.com/Jarred-Sumner',
						description: 'Creator of Bun.'
					}
				];
			}
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		selectedLang;
		mode;
		fetchData();
	});
</script>

<div class="space-y-8 pt-12 border-t border-slate-800/50">
	<header class="flex flex-col md:flex-row justify-between items-center gap-4">
		<div class="flex items-center gap-4">
			<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
				GitHub Trends
			</h2>
			<div class="flex border border-slate-800 p-0.5">
				<button
					onclick={() => (mode = 'repositories')}
					class="px-2 py-1 text-[7px] font-black uppercase transition-all {mode === 'repositories'
						? 'bg-white text-black'
						: 'text-slate-500 hover:text-slate-300'}"
					title="Show trending repositories"
				>
					REPOS
				</button>
				<button
					onclick={() => (mode = 'developers')}
					class="px-2 py-1 text-[7px] font-black uppercase transition-all {mode === 'developers'
						? 'bg-white text-black'
						: 'text-slate-500 hover:text-slate-300'}"
					title="Show trending developers"
				>
					DEVS
				</button>
			</div>
		</div>

		<div class="relative w-full md:w-48">
			<select
				bind:value={selectedLang}
				class="w-full bg-black border border-slate-800 text-slate-300 text-[10px] font-bold uppercase appearance-none cursor-pointer py-2 px-3 outline-none transition-all hover:bg-slate-900/50 focus:border-white/30"
			>
				{#each languages as lang}
					<option value={lang}>{lang}</option>
				{/each}
			</select>
			<div
				class="absolute right-3 top-1/2 pointer-events-none -translate-y-1/2 text-[8px] text-slate-600"
			>
				▼
			</div>
		</div>

		<div class="flex items-center gap-3 text-[8px] font-bold uppercase tracking-widest ml-auto md:ml-0">
			<span class="text-slate-600">Source: GitHub</span>
			<div class="flex items-center gap-1.5 px-2 py-0.5 border border-slate-800 rounded-full">
				<div class="w-1 h-1 rounded-full {isFallback ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse"></div>
				<span class={isFallback ? 'text-amber-500' : 'text-emerald-500'}>
					{isFallback ? 'Offline Mode' : 'Live Sync'}
				</span>
			</div>
		</div>
	</header>

	<div class="min-h-[400px] relative">
		{#if loading}
			<div class="flex flex-col items-center justify-center py-20 gap-4">
				<div
					class="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"
					style="border-top-color: {accentColor}"
				></div>
				<span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
					>Scanning Trends...</span
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
				<button
					onclick={fetchData}
					class="mt-2 text-[8px] font-black uppercase border border-rose-900/50 px-3 py-1 text-rose-500 hover:bg-rose-500 hover:text-black transition-all"
					title="Retry fetching trending data"
				>
					Retry Protocol
				</button>
			</div>
		{:else if mode === 'repositories'}
			<div class="grid grid-cols-1 gap-1 border border-slate-800">
				{#each repos as repo}
					<a
						href={repo.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex p-4 bg-black hover:bg-slate-900/50 transition-all border-b border-slate-800 last:border-0 gap-4"
						title="View {repo.author}/{repo.name} on GitHub"
					>
						<div class="flex-shrink-0 w-10 h-10 border border-slate-800 bg-slate-900 overflow-hidden">
							<img
								src="https://github.com/{repo.author}.png"
								alt={repo.author}
								class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
								onerror={(e) => (e.currentTarget.style.display = 'none')}
							/>
						</div>
						<div class="flex flex-col min-w-0 flex-1">
							<div class="flex justify-between items-start mb-1">
								<span class="text-[9px] font-black text-slate-400 font-space uppercase"
									>{repo.author} /</span
								>
							</div>
							<h3
								class="text-sm font-bold text-white group-hover:underline transition-colors font-space leading-tight"
							>
								{repo.name}
							</h3>
							<p class="text-[10px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
								{repo.description}
							</p>
							<div class="flex gap-3 mt-3 items-center">
								<span
									class="text-[7px] font-black uppercase py-0.5 text-slate-600"
									style="color: {accentColor}">Access Protocol →</span
								>
								{#if repo.stars}
									<span class="text-[8px] font-mono text-slate-500 flex items-center gap-1">
										★ {repo.stars}
									</span>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-1 border border-slate-800">
				{#each developers as dev}
					<a
						href={dev.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex flex-col p-4 bg-black hover:bg-slate-900/50 transition-all border-r border-b border-slate-800 last:border-0"
						title="View {dev.name} on GitHub"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 border border-slate-800 bg-slate-900 flex-shrink-0 overflow-hidden"
							>
								<img
									src="https://github.com/{dev.username}.png"
									alt={dev.name}
									class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
									onerror={(e) => (e.currentTarget.style.display = 'none')}
								/>
							</div>
							<div class="flex flex-col min-w-0">
								<h3
									class="text-xs font-bold text-white group-hover:underline transition-colors font-space truncate"
								>
									{dev.name}
								</h3>
								<span class="text-[8px] font-black text-slate-500 uppercase">Top Contributor</span>
							</div>
						</div>
						{#if dev.description}
							<p class="text-[9px] text-slate-400 line-clamp-1 mt-3 italic">
								{dev.description}
							</p>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
