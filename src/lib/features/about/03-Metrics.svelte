<script>
	import { onMount } from 'svelte';
	let { accentColor, sessionStartTime } = $props();
	
	let uptime = $state('00:00:00');

	function updateUptime() {
		const diff = Date.now() - sessionStartTime;
		const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
		const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
		const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
		uptime = `${hours}:${mins}:${secs}`;
	}

	onMount(() => {
		updateUptime(); // Initial call
		const interval = setInterval(updateUptime, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
	<div class="flex flex-col space-y-1">
		<span class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">Global Connectivity</span>
		<div class="flex items-center gap-3">
			<img 
				src="https://komarev.com/ghpvc/?username=ginkohub-portfolio&color=000000&style=flat-square&label=VISITS" 
				alt="Visit Counter"
				class="h-4 transition-all cursor-crosshair"
			/>
		</div>
	</div>

	<div class="flex flex-col space-y-1 items-end">
		<span class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">Session Uptime</span>
		<span class="text-xs font-mono font-bold text-slate-300 tabular-nums" style="color: {accentColor}">{uptime}</span>
	</div>
</div>