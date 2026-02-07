<script>
	import { onMount } from 'svelte';
	import { ghpFetch } from '$lib/fetcher.js';
	let { accentColor, sessionStartTime } = $props();

	let uptime = $state('00:00:00');
	let hitCounterSvg = $state('');

	function updateUptime() {
		const diff = Date.now() - sessionStartTime;
		const hours = Math.floor(diff / 3600000)
			.toString()
			.padStart(2, '0');
		const mins = Math.floor((diff % 3600000) / 60000)
			.toString()
			.padStart(2, '0');
		const secs = Math.floor((diff % 60000) / 1000)
			.toString()
			.padStart(2, '0');
		uptime = `${hours}:${mins}:${secs}`;
	}

	async function fetchHitCounter() {
		const cleanColor = accentColor.replace('#', '');
		const url = `https://ghp-tools.vercel.app/api/tools/hit-counter/ginkohub.github.io?format=svg&color=${cleanColor}&label=visitors`;
		const res = await ghpFetch(url);
		if (res.success) {
			hitCounterSvg = res.data.contents || res.data;
		}
	}

	onMount(() => {
		updateUptime();
		const interval = setInterval(updateUptime, 1000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		accentColor;
		fetchHitCounter();
	});
</script>

<div class="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
	<div class="flex flex-col space-y-1">
		<span class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600"
			>System Traffic</span
		>
		<div class="flex items-center h-[18px]">
			{#if hitCounterSvg}
				<div class="h-full opacity-80 scale-90 origin-left">
					{@html hitCounterSvg}
				</div>
			{:else}
				<div class="w-20 h-4 bg-slate-900 animate-pulse rounded"></div>
			{/if}
		</div>
	</div>

	<div class="flex flex-col space-y-1 items-end">
		<span class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600"
			>Session Duration</span
		>
		<span class="text-xs font-mono font-bold tabular-nums" style="color: {accentColor}"
			>{uptime}</span
		>
	</div>

	<!-- GitHub Contribution Block -->
	<div class="col-span-2 mt-4 pt-4 border-t border-slate-800/50">
		<div class="flex flex-col space-y-2">
			<div class="flex justify-between items-center">
				<span class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">Contribution Pulse</span>
				<span class="text-[7px] font-mono text-slate-700 uppercase">source: github.com/ginkohub</span>
			</div>
			<div class="w-full bg-black/40 border border-slate-800/50 p-3 rounded-lg overflow-hidden flex items-center justify-center">
				<img 
					src="https://ghchart.rshah.org/{accentColor.replace('#', '')}/ginkohub" 
					alt="ginkohub's GitHub contributions" 
					class="w-full h-auto opacity-80 hover:opacity-100 transition-opacity grayscale-50 hover:grayscale-0"
					onerror={(e) => (e.target.style.display = 'none')}
				/>
			</div>
		</div>
	</div>
</div>
