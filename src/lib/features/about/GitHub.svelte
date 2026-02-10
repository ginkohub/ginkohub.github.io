<script>
	import { onMount } from 'svelte';
	import { aboutState } from './aboutState.svelte';
	let { accentColor } = $props();

	onMount(() => {
		if (aboutState.githubStats.repos === 0) {
			aboutState.fetchStats();
		}
	});
</script>

<div class="pt-10 space-y-6">
	<h2 class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
		System Artifacts (GitHub)
	</h2>

	<div class="grid grid-cols-3 gap-1">
		<div
			class="flex flex-col p-4 bg-white/5 backdrop-blur-sm border border-white/5 group hover:border-white/20 transition-all"
		>
			<span class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Repos</span
			>
			<span
				class="text-2xl font-serif italic font-bold text-slate-200 tabular-nums group-hover:scale-110 origin-left transition-transform"
				style="color: {accentColor}"
			>
				{aboutState.githubStats.repos}
			</span>
		</div>

		<div
			class="flex flex-col p-4 bg-white/5 backdrop-blur-sm border border-white/5 group hover:border-white/20 transition-all"
		>
			<span class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1"
				>Followers</span
			>
			<span
				class="text-2xl font-serif italic font-bold text-slate-200 tabular-nums group-hover:scale-110 origin-left transition-transform"
				style="color: {accentColor}"
			>
				{aboutState.githubStats.followers}
			</span>
		</div>

		<div
			class="flex flex-col p-4 bg-white/5 backdrop-blur-sm border border-white/5 group hover:border-white/20 transition-all"
		>
			<span class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Stars</span
			>
			<span
				class="text-2xl font-serif italic font-bold text-slate-200 tabular-nums group-hover:scale-110 origin-left transition-transform"
				style="color: {accentColor}"
			>
				{aboutState.githubStats.stars}
			</span>
		</div>
	</div>

	<a
		href="https://github.com/ginkohub"
		target="_blank"
		rel="noopener noreferrer"
		class="block w-full py-3 text-center text-[8px] font-black uppercase tracking-[0.3em] border border-white/10 text-slate-500 hover:bg-white hover:text-black transition-all"
		title="View source code on GitHub"
	>
		Access Source Code →
	</a>
</div>
