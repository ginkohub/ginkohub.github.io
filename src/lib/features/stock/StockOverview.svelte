<script>
	import { onMount } from 'svelte';
	import { stockState } from './stockState.svelte';
	import { fade } from 'svelte/transition';

	let { accentColor } = $props();
	let containerId = `tv-stock-chart-${Math.random().toString(36).substr(2, 9)}`;
	let widget = null;

	function initTradingView() {
		if (typeof window !== 'undefined' && window.TradingView) {
			setTimeout(() => {
				const container = document.getElementById(containerId);
				if (!container) return;

				widget = new window.TradingView.widget({
					autosize: true,
					symbol: stockState.selectedSymbol,
					interval: 'D',
					timezone: 'Etc/UTC',
					theme: 'dark',
					style: '1',
					locale: 'en',
					toolbar_bg: '#f1f3f6',
					enable_publishing: false,
					hide_top_toolbar: true,
					save_image: false,
					container_id: containerId,
					backgroundColor: 'rgba(0, 0, 0, 0)',
					gridColor: 'rgba(255, 255, 255, 0.05)',
					loading_screen: { backgroundColor: '#000000' }
				});
			}, 50);
		}
	}

	onMount(() => {
		initTradingView();
	});

	$effect(() => {
		if (stockState.selectedSymbol) {
			initTradingView();
		}
	});
</script>

<div class="space-y-6">
	<!-- Stock Selection Dropdown -->
	<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
		<div class="relative w-full md:w-64 group">
			<label
				for="stock-select"
				class="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1 block"
			>
				Select Market Entity
			</label>
			<div class="relative">
				<select
					id="stock-select"
					value={stockState.selectedSymbol}
					onchange={(e) => stockState.setSelectedSymbol(e.target.value)}
					class="w-full bg-black border border-slate-800 p-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-white/20 appearance-none cursor-pointer transition-all hover:bg-slate-900"
				>
					{#each stockState.indices as stock}
						<option value={stock.symbol}>
							{stock.symbol.split(':')[1]} - {stock.name}
						</option>
					{/each}
				</select>
				<div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
					▼
				</div>
			</div>
		</div>

		<div class="px-4 py-2 border border-slate-800/50 bg-white/5 hidden md:block">
			<span class="text-[8px] font-black uppercase tracking-widest text-slate-500 block"
				>Active Exchange</span
			>
			<span class="text-[10px] font-bold text-slate-200">
				{stockState.selectedSymbol.split(':')[0] === 'IDX'
					? 'Bursa Efek Indonesia'
					: 'Global Markets'}
			</span>
		</div>
	</div>

	<!-- Chart Area -->
	<div class="relative h-[450px] border border-slate-800 bg-black">
		<div id={containerId} class="w-full h-full"></div>

		<!-- Overlay for aesthetic -->
		<div
			class="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5 z-10"
			style="background-image: radial-gradient(circle at 50% 50%, {accentColor} 0%, transparent 70%);"
		></div>
	</div>

	<div class="p-4 border border-slate-800 bg-white/5 flex items-center justify-between">
		<div class="flex flex-col">
			<span class="text-[7px] font-black uppercase text-slate-500 tracking-[0.2em]"
				>Global Markets</span
			>
			<span class="text-[10px] font-bold text-slate-300">Synchronized with Neural Trading Hub</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
			<span class="text-[8px] font-black uppercase text-emerald-500">Market Open</span>
		</div>
	</div>
</div>
