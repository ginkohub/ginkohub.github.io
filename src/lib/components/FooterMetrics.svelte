<script>
	import { onMount } from 'svelte';
	import { ghpFetch } from '$lib/fetcher';
	let { accentColor, sessionStartTime } = $props();

	let uptime = $state('00:00:00');
	let hitCounterSvg = $state('');
	let puterUser = $state('');

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

	async function fetchPuterUser() {
		if (typeof window !== 'undefined' && window.puter) {
			try {
				const user = await window.puter.auth.getUser();
				if (user) puterUser = user.username;
			} catch (e) {
				// Ignore errors
			}
		}
	}

	onMount(() => {
		updateUptime();
		const interval = setInterval(updateUptime, 1000);
		fetchHitCounter();
		fetchPuterUser();
		return () => clearInterval(interval);
	});

	// Only re-fetch if color changes significantly, but ideally we keep it stable
	$effect(() => {
		accentColor;
		// Optional: We can re-fetch if color changes, or just leave it to load once.
		// For now, let's just update the color if possible or just re-fetch.
		fetchHitCounter();
	});
</script>

<div class="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
	<div class="flex flex-col space-y-1">
		<span class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-600"
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

	{#if puterUser}
		<div class="flex flex-col space-y-1 items-center">
			<span class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-600"
				>Neural Identity</span
			>
			<span class="text-[10px] font-bold text-white tracking-wide">{puterUser}</span>
		</div>
	{/if}

	<div class="flex flex-col space-y-1 items-end md:items-start">
		<span class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-600"
			>Session Duration</span
		>
		<span class="text-xs font-mono font-bold tabular-nums" style="color: var(--accent-color)"
			>{uptime}</span
		>
	</div>
</div>
