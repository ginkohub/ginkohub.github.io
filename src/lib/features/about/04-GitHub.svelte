<script>
	import { onMount } from 'svelte';
	let { accentColor } = $props();

	let stats = $state({
		repos: '..',
		followers: '..',
		stars: '..'
	});

	async function fetchGitHubStats() {
		try {
			const userRes = await fetch('https://api.github.com/users/ginkohub');
			const userData = await userRes.json();

			// Stars require fetching repos or using a specialized API,
			// for simplicity and reliability without a token, we'll focus on primary stats.
			stats.repos = userData.public_repos ?? 0;
			stats.followers = userData.followers ?? 0;

			// Attempt to sum stars (limited to 100 most recent repos)
			const reposRes = await fetch('https://api.github.com/users/ginkohub/repos?per_page=100');
			const reposData = await reposRes.json();
			stats.stars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
		} catch (e) {
			console.error('Failed to fetch GitHub stats', e);
		}
	}

	onMount(() => {
		fetchGitHubStats();
	});
</script>

<div class="pt-10 space-y-6">
	<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-400">
		System Artifacts (GitHub)
	</h2>

	<div class="grid grid-cols-3 gap-4">
		<div
			class="flex flex-col p-4 bg-slate-900/30 border border-slate-800/50 group hover:border-white/20 transition-all"
		>
			<span class="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1"
				>Repositories</span
			>
			<span
				class="text-xl font-bold font-space text-white tabular-nums group-hover:scale-110 origin-left transition-transform"
				style="color: {accentColor}"
			>
				{stats.repos}
			</span>
		</div>

		<div
			class="flex flex-col p-4 bg-slate-900/30 border border-slate-800/50 group hover:border-white/20 transition-all"
		>
			<span class="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1"
				>Followers</span
			>
			<span
				class="text-xl font-bold font-space text-white tabular-nums group-hover:scale-110 origin-left transition-transform"
				style="color: {accentColor}"
			>
				{stats.followers}
			</span>
		</div>

		<div
			class="flex flex-col p-4 bg-slate-900/30 border border-slate-800/50 group hover:border-white/20 transition-all"
		>
			<span class="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1"
				>Total Stars</span
			>
			<span
				class="text-xl font-bold font-space text-white tabular-nums group-hover:scale-110 origin-left transition-transform"
				style="color: {accentColor}"
			>
				{stats.stars}
			</span>
		</div>
	</div>

	<a
		href="https://github.com/ginkohub"
		target="_blank"
		rel="noopener noreferrer"
		class="block w-full py-2 text-center text-[8px] font-black uppercase tracking-[0.3em] border border-slate-800 text-slate-500 hover:bg-white hover:text-black transition-all"
		title="View source code on GitHub"
	>
		View Source Code →
	</a>
</div>
