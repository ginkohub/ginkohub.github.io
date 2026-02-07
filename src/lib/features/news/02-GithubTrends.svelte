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

	async function fetchData() {
		loading = true;
		error = '';
		repos = [];
		developers = [];

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		try {
			const langParam = selectedLang === 'all' ? '' : selectedLang;
			const typePath = mode === 'repositories' ? 'trending' : 'trending/developers';
			const targetUrl = `https://github.com/${typePath}/${langParam}?since=daily`;
			const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

			const response = await fetch(proxyUrl, { signal: controller.signal });
			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();

			if (data.contents) {
				let rawContent = data.contents;
				if (rawContent.startsWith('data:')) {
					const base64Part = rawContent.split(',')[1];
					if (base64Part) {
						rawContent = atob(base64Part);
					}
				}

				const parser = new DOMParser();
				const doc = parser.parseFromString(rawContent, 'text/html');
				const items = Array.from(doc.querySelectorAll('article.Box-row'));

				if (items.length > 0) {
					if (mode === 'repositories') {
						repos = items.slice(0, 10).map((item) => {
							const titleLink = item.querySelector('h2 a');
							const rawTitle = titleLink ? titleLink.innerText.trim() : 'Unknown / Unknown';
							const parts = rawTitle.split('/').map(s => s.trim());
							
							const author = parts[0] || 'GitHub';
							const name = parts[1] || rawTitle;
							
							let link = titleLink ? titleLink.getAttribute('href') : '';
							if (link && !link.startsWith('http')) link = `https://github.com${link}`;

							const descEl = item.querySelector('p');
							const description = descEl ? descEl.innerText.trim() : 'No description provided.';

							return {
								author,
								name,
								url: link,
								description
							};
						});
					} else {
						developers = items.slice(0, 10).map((item) => {
							const nameLink = item.querySelector('h1 a');
							const name = nameLink ? nameLink.innerText.trim() : 'Unknown';
							
							let link = nameLink ? nameLink.getAttribute('href') : '';
							if (link && !link.startsWith('http')) link = `https://github.com${link}`;

							// Description for devs is often in a specific div or implicit
							// GitHub trending devs structure is volatile, let's try generic
							// Usually inside a div with class f4 or similar
							const descEl = item.querySelector('.f4') || item.querySelector('.Link--secondary');
							const description = descEl ? descEl.innerText.trim() : '';

							return {
								name,
								url: link,
								description
							};
						});
					}
				} else {
					throw new Error('No items found (structure changed?)');
				}
			} else {
				throw new Error('Proxy returned no content');
			}
		} catch (e) {
			clearTimeout(timeoutId);
			if (e.name === 'AbortError') {
				error = 'Connection timed out.';
			} else {
				error = `Trend Sync Failed: ${e.message}`;
			}
			console.error('Scraping error:', e);
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
	</header>

	<div class="min-h-[400px] relative">
		{#if loading}
			<div class="space-y-4">
				{#each Array(5) as _}
					<div class="h-20 bg-slate-900/50 animate-pulse border border-slate-800/50"></div>
				{/each}
			</div>
		{:else if error}
			<div class="flex items-center justify-center h-40 border border-rose-900/30 bg-rose-950/10">
				<span class="text-[9px] font-black uppercase text-rose-500 tracking-widest">{error}</span>
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
							<div class="flex gap-3 mt-3">
								<span
									class="text-[7px] font-black uppercase py-0.5 text-slate-600"
									style="color: {accentColor}">Access Protocol →</span
								>
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
									src="https://github.com/{dev.name.split(' ')[0]}.png"
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
