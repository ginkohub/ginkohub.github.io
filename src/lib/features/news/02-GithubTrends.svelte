<script>
	let { accentColor } = $props();

	let repos = $state([]);
	let loading = $state(false);
	let error = $state('');
	let languages = ['all', 'javascript', 'typescript', 'svelte', 'python', 'go', 'rust'];
	let selectedLang = $state('all');

	async function fetchTrends() {
		loading = true;

		error = '';

		repos = [];

		try {
			// Using GitHub's RSS feed via rss2json for maximum stability

			const langParam = selectedLang === 'all' ? '' : selectedLang;

			const rssUrl = `https://github.com/trending/${langParam}?since=daily`;

			const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

			const response = await fetch(apiUrl);

			const result = await response.json();

			if (result.status === 'ok') {
				repos = result.items.slice(0, 10).map((item) => {
					// GitHub RSS titles are usually "author / repo"

					const parts = item.title.split(' / ');

					return {
						author: parts[0]?.trim() || 'GitHub',

						name: parts[1]?.trim() || item.title,

						url: item.link,

						description: item.description?.replace(/<[^>]*>?/gm, '').trim() || 'No description.',

						stars: 0, // RSS doesn't provide star count directly

						currentPeriodStars: 0
					};
				});
			} else {
				throw new Error('RSS conversion failed');
			}
		} catch (e) {
			error = 'Failed to fetch GitHub trends.';

			console.error(e);
		} finally {
			loading = false;
		}
	}
	$effect(() => {
		selectedLang;
		fetchTrends();
	});
</script>

<div class="space-y-8 pt-12 border-t border-slate-800/50">
	<header class="flex flex-col md:flex-row justify-between items-center gap-4">
		<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">GitHub Trends</h2>
		<div class="flex flex-wrap justify-center gap-2">
			{#each languages as lang}
				<button
					onclick={() => (selectedLang = lang)}
					class="text-[8px] font-bold uppercase border px-3 py-1 transition-all
					{selectedLang === lang
						? 'bg-white text-black border-white'
						: 'border-slate-800 text-slate-500 hover:border-slate-600'}"
				>
					{lang}
				</button>
			{/each}
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
		{:else}
			<div class="grid grid-cols-1 gap-1 border border-slate-800">
				{#each repos as repo}
					<a
						href={repo.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex flex-col p-4 bg-black hover:bg-slate-900/50 transition-all border-b border-slate-800 last:border-0"
					>
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
							{repo.description || 'No description provided.'}
						</p>
						<div class="flex gap-3 mt-3">
							<span
								class="text-[7px] font-black uppercase py-0.5 text-slate-600"
								style="color: {accentColor}">Access Protocol →</span
							>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
