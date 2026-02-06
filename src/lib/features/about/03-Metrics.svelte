<script>
	import { onMount } from 'svelte';
	let { accentColor, sessionStartTime } = $props();

	let uptime = $state('00:00:00');

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

	onMount(() => {
		updateUptime();
		const interval = setInterval(updateUptime, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
	<div class="flex flex-col space-y-1">
		<span class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600"
			>System Traffic</span
		>
		<div class="flex items-center">
			<img
				src="https://hits.dwyl.com/ginkohub/ginkohub.github.io.svg?style=flat-square&show=count"
				alt="Visits"
				class="h-[18px] opacity-80"
			/>
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
</div>
