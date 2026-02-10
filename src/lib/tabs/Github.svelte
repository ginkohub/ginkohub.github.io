<script>
	import { ghpFetch } from '$lib/fetcher';
	import { githubState } from '../features/about/githubState.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';

	let { accentColor } = $props();

	// Local shorthand for template but synchronized with global state
	let repos = $derived(githubState.repos);
	let developers = $derived(githubState.developers);

	let loading = $state(false);
	let error = $state('');

	function formatUnit(num) {
		if (!num) return '0';
		const val = typeof num === 'string' ? parseInt(num.replace(/,/g, '')) : num;
		if (isNaN(val)) return num;
		if (val >= 1000000000) return (val / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
		if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
		if (val >= 1000) return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
		return val.toString();
	}

	const languages = [
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

	let isFallback = $state(false);

	function loadPersistedState() {
		if (typeof window !== 'undefined') {
			const savedMode = localStorage.getItem('ginkohub_trends_mode');
			if (savedMode) githubState.mode = savedMode;
			const savedLang = localStorage.getItem('ginkohub_trends_lang');
			if (savedLang) githubState.selectedLang = savedLang;
		}
	}

	import { onMount } from 'svelte';
	onMount(() => {
		loadPersistedState();
	});

	async function fetchData() {
		if (typeof window !== 'undefined') {
			localStorage.setItem('ginkohub_trends_mode', githubState.mode);
			localStorage.setItem('ginkohub_trends_lang', githubState.selectedLang);
		}

		loading = true;
		error = '';
		isFallback = false;

		try {
			const typePath = githubState.mode === 'repositories' ? 'trending' : 'trending/developers';
			const langPath = githubState.selectedLang === 'all' ? '' : `/${githubState.selectedLang}`;
			const targetUrl = `https://github.com/${typePath}${langPath}?since=daily`;

			const res = await ghpFetch(targetUrl);

			if (!res.success) {
				throw new Error(res.error);
			}

			let data = res.data;

			let rawHtml = '';
			if (!Array.isArray(data) && data.contents) rawHtml = data.contents;
			else if (typeof data === 'string') rawHtml = data;

			if (Array.isArray(data) && data.length > 0) {
				// JSON API Logic
				if (githubState.mode === 'repositories') {
					githubState.repos = data.slice(0, 10).map((item) => ({
						author: item.author || item.name.split('/')[0].trim(),
						name: item.name.split('/').pop().trim(),
						url: item.url || `https://github.com/${item.name}`,
						description: item.description || 'No description.',
						stars: item.stars,
						forks: item.forks || '0',
						language: item.language || 'Code',
						starsToday: item.starsInPeriod || '0',
						builtBy: item.builtBy || [],
						socialImage: `https://opengraph.githubassets.com/1/${item.author || item.name.split('/')[0].trim()}/${item.name.split('/').pop().trim()}`
					}));
				} else {
					githubState.developers = data.slice(0, 10).map((item) => ({
						name: item.name || item.username,
						username: item.username,
						url: item.url || `https://github.com/${item.username}`,
						popularRepo: item.popularRepo?.name || '',
						description: item.popularRepo?.description || ''
					}));
				}
			} else if (rawHtml) {
				// HTML Scraping Logic
				const parser = new DOMParser();
				const doc = parser.parseFromString(rawHtml, 'text/html');
				const items = Array.from(doc.querySelectorAll('article.Box-row'));

				if (items.length > 0) {
					if (githubState.mode === 'repositories') {
						githubState.repos = items.slice(0, 10).map((item) => {
							const titleLink = item.querySelector('h2 a');
							const rawTitle = titleLink ? titleLink.innerText.trim() : 'Unknown / Unknown';
							const parts = rawTitle.split('/').map((s) => s.trim());
							return {
								author: parts[0],
								name: parts[1],
								url: `https://github.com${titleLink?.getAttribute('href')}`,
								description: item.querySelector('p')?.innerText.trim() || '',
								stars: item.querySelector('a[href$="/stargazers"]')?.innerText.trim() || '0',
								forks: item.querySelector('a[href$="/forks"]')?.innerText.trim() || '0',
								language:
									item.querySelector('[itemprop="programmingLanguage"]')?.innerText.trim() ||
									'Text',
								starsToday:
									item.querySelector('.float-sm-right')?.innerText.trim().split(' ')[0] || '0',
								builtBy: [],
								socialImage: `https://opengraph.githubassets.com/1/${parts[0]}/${parts[1]}`
							};
						});
					} else {
						githubState.developers = items.slice(0, 10).map((item) => {
							const nameLink = item.querySelector('h1 a');
							const link = nameLink?.getAttribute('href');
							return {
								name: nameLink?.innerText.trim() || 'Dev',
								username: link?.split('/').pop() || 'user',
								url: `https://github.com${link}`,
								popularRepo: item.querySelector('.h4 a')?.innerText.trim() || '',
								description: 'Top Contributor'
							};
						});
					}
				} else {
					throw new Error('Parsing failed');
				}
			} else {
				throw new Error('No data');
			}
		} catch (e) {
			const err = /** @type {any} */ (e);
			console.warn('Sync failed:', err.message);
			error = '';
			isFallback = true;
			// Fallback data
			if (githubState.mode === 'repositories') {
				githubState.repos = [
					{
						author: 'ginkohub',
						name: 'ginkohub.github.io',
						url: '#',
						description: 'Offline mode active.',
						stars: '∞',
						forks: '0',
						language: 'Svelte',
						starsToday: '1',
						builtBy: [],
						socialImage: 'https://opengraph.githubassets.com/1/ginkohub/ginkohub.github.io'
					}
				];
			} else {
				githubState.developers = [
					{
						name: 'Ginko',
						username: 'ginkohub',
						url: '#',
						popularRepo: 'ginkohub',
						description: 'Offline.'
					}
				];
			}
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		githubState.refreshSignal; // Trigger re-fetch
		// Also watch simple changes if no signal used
		githubState.mode;
		githubState.selectedLang;
		fetchData();
	});
</script>

<div id="section-trending" class="space-y-8 pt-12 border-t border-slate-800/50">
	<header class="flex flex-col md:flex-row justify-between items-center gap-4">
		<div class="flex items-center gap-4">
			<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
				GitHub Trends
			</h2>
			{#if loading}
				<div class="flex items-center gap-2 animate-pulse">
					<div
						class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]"
					></div>
					<span class="text-[7px] font-black uppercase tracking-tighter text-slate-500"
						>Syncing...</span
					>
				</div>
			{/if}
			<div class="flex border border-slate-800 p-0.5">
				<button
					onclick={() => githubState.setMode('repositories')}
					class="px-2 py-1 text-[7px] font-black uppercase transition-all {githubState.mode ===
					'repositories'
						? 'bg-white text-black'
						: 'text-slate-500 hover:text-slate-300'}"
					title="Show trending repositories"
				>
					REPOS
				</button>
				<button
					onclick={() => githubState.setMode('developers')}
					class="px-2 py-1 text-[7px] font-black uppercase transition-all {githubState.mode ===
					'developers'
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
				bind:value={githubState.selectedLang}
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
		<!-- rest of template matches original -->

		<div
			class="flex items-center gap-3 text-[8px] font-bold uppercase tracking-widest ml-auto md:ml-0"
		>
			<span class="text-slate-600">Source: GitHub</span>
			<div class="flex items-center gap-1.5 px-2 py-0.5 border border-slate-800">
				<div class="w-1 h-1 {isFallback ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse"></div>
				<span class={isFallback ? 'text-amber-500' : 'text-emerald-500'}>
					{isFallback ? 'Offline Mode' : 'Live Sync'}
				</span>
			</div>
		</div>
	</header>

	<div class="min-h-[400px] relative">
		{#if loading && repos.length === 0 && developers.length === 0}
			<div class="flex flex-col items-center justify-center py-20 gap-4">
				<div
					class="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"
					style="border-top-color: {accentColor}"
				></div>
				<span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
					>Scanning Trends...</span
				>
			</div>
		{:else if error && repos.length === 0 && developers.length === 0}
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
		{:else}
			<div
				class="space-y-1 transition-all duration-500 {loading
					? 'opacity-40 grayscale blur-[1px]'
					: 'opacity-100 grayscale-0 blur-0'}"
			>
				{#if error}
					<div
						class="p-2 mb-4 bg-rose-950/20 border border-rose-900/30 text-center animate-in fade-in slide-in-from-top-1"
					>
						<span class="text-[8px] font-black uppercase text-rose-500 tracking-widest"
							>Network Desync: {error}</span
						>
					</div>
				{/if}
				{#if githubState.mode === 'repositories'}
					{#each repos as repo}
						<a
							href={repo.url}
							target="_blank"
							rel="noopener noreferrer"
							class="group block p-3 bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all duration-300 relative overflow-hidden"
							title="View {repo.author}/{repo.name} on GitHub"
						>
							<div class="flex flex-row gap-3 md:gap-4 relative z-10">
								{#if repo.socialImage}
									<div
										class="w-16 h-16 md:w-32 md:h-16 border border-white/5 bg-slate-950 overflow-hidden rounded-sm opacity-70 group-hover:opacity-100 transition-all duration-500 shrink-0"
									>
										<LazyImage
											src={repo.socialImage}
											alt={repo.name}
											aspectRatio="aspect-square md:aspect-video"
											class="grayscale group-hover:grayscale-0 transition-all duration-700"
											fallbackText="GIT"
										/>
									</div>
								{/if}
								<div class="flex flex-col gap-1.5 flex-1 min-w-0">
									<!-- Header Metadata -->
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2">
											<span
												class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 max-w-[100px] md:max-w-none"
												>{repo.author} /</span
											>
											<div class="h-[1px] w-2 bg-slate-700"></div>
											<span
												class="text-[8px] font-black uppercase tracking-[0.1em] text-emerald-400"
												>{repo.language}</span
											>
										</div>
										<div class="flex items-center gap-3">
											<div class="flex items-center gap-1 opacity-80">
												<span class="text-[8px] font-mono text-slate-300"
													>★ {formatUnit(repo.stars)}</span
												>
												<span class="text-[8px] font-mono text-slate-300"
													>⑂ {formatUnit(repo.forks)}</span
												>
											</div>
											<span
												class="text-[7px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors"
												>Protocol: Source</span
											>
										</div>
									</div>

									<!-- Title & Description -->
									<div>
										<h3
											class="text-sm md:text-lg font-serif italic text-slate-200 group-hover:text-white transition-colors leading-tight"
										>
											{repo.name}
										</h3>
										<p
											class="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors mt-0.5"
										>
											{repo.description}
										</p>
									</div>

									<!-- Footer Metadata (Contributors & Stars Today) -->
									<div class="flex items-center justify-between pt-1 border-t border-white/5">
										<div class="flex -space-x-1.5">
											{#each repo.builtBy?.slice(0, 5) || [] as dev}
												<LazyImage
													src={dev.avatar}
													alt={dev.username}
													class="w-4 h-4 border border-black grayscale group-hover:grayscale-0 transition-all"
													fallbackText=""
												/>
											{/each}
										</div>
										<div
											class="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors"
										>
											<span>+{formatUnit(repo.starsToday)}</span>
											<span class="opacity-50">STARS TODAY</span>
										</div>
									</div>
								</div>
							</div></a
						>
					{/each}
				{:else}
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
						{#each developers as dev}
							<a
								href={dev.url}
								target="_blank"
								rel="noopener noreferrer"
								class="group block p-3 bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all duration-300 relative overflow-hidden"
								title="View {dev.name} on GitHub"
							>
								<div class="flex flex-col gap-2 relative z-10">
									<div class="flex items-center gap-3">
										<div
											class="w-10 h-10 border border-white/10 bg-slate-950 flex-shrink-0 overflow-hidden"
										>
											<LazyImage
												src="https://github.com/{dev.username}.png"
												alt={dev.name}
												class="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
												fallbackText={dev.username.slice(0, 2).toUpperCase()}
											/>
										</div>
										<div class="flex flex-col min-w-0">
											<h3
												class="text-md font-serif italic text-slate-300 group-hover:text-white transition-colors truncate"
											>
												{dev.name}
											</h3>
											<span
												class="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors"
												>@{dev.username}</span
											>
										</div>
									</div>

									{#if dev.popularRepo}
										<div class="pt-2 border-t border-white/5">
											<div class="flex items-center gap-2 mb-1">
												<span class="text-[6px] font-black text-slate-600 uppercase tracking-widest"
													>🔥 POPULAR PROJECT</span
												>
												<div class="h-[1px] flex-1 bg-white/5"></div>
											</div>
											<h4
												class="text-xs font-bold text-slate-400 group-hover:text-white transition-colors truncate"
											>
												{dev.popularRepo}
											</h4>
											<p
												class="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors line-clamp-2 mt-1 italic"
											>
												{dev.description}
											</p>
										</div>
									{/if}
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
