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
					hide_legend: true,
					hide_side_toolbar: true,
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
	<!-- Stock Selection & Summary -->
	<div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
		<div class="relative w-full md:w-72 group">
			<label
				for="stock-select"
				class="mb-1 block text-[8px] font-black uppercase tracking-[0.3em] text-slate-500"
			>
				Neural Market Entity
			</label>
			<div class="relative">
				<select
					id="stock-select"
					value={stockState.selectedSymbol}
					onchange={(e) => stockState.setSelectedSymbol(e.target.value)}
					class="w-full appearance-none border border-slate-800 bg-black p-3 font-mono text-xs font-bold text-white transition-all hover:bg-slate-900 focus:border-white/20 focus:outline-none"
				>
					{#each stockState.assets as stock}
						<option value={stock.symbol}>
							{stock.symbol.includes(':') ? stock.symbol.split(':')[1] : stock.symbol} - {stock.name}
						</option>
					{/each}
				</select>
				<div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
					▼
				</div>
			</div>
		</div>

		<div
			class="flex w-full items-center justify-between border border-slate-800/50 bg-white/5 p-3 md:w-auto md:min-w-[200px]"
		>
			<div class="flex flex-col">
				<span class="text-[7px] font-black uppercase tracking-widest text-slate-500"
					>Active Asset</span
				>
				<span class="text-[10px] font-bold text-slate-200">{stockState.selectedAsset.name}</span>
			</div>
			<div class="flex flex-col items-end pl-6">
				<span class="text-[7px] font-black uppercase tracking-widest text-slate-500">Exchange</span>
				<span class="text-[9px] font-black text-emerald-500"
					>{stockState.selectedAsset.exchange}</span
				>
			</div>
		</div>
	</div>

	<!-- Chart Area -->
	<div class="group relative h-[500px] border border-slate-800 bg-black">
		<!-- Aesthetic Overlay -->
		<div
			class="pointer-events-none absolute left-0 top-0 z-10 h-full w-full opacity-5"
			style="background-image: radial-gradient(circle at 50% 50%, {accentColor} 0%, transparent 70%);"
		></div>

		<div id={containerId} class="h-full w-full"></div>

		<!-- Live Indicator -->
		<div
			class="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/60 px-2 py-1 backdrop-blur-md border border-white/5"
		>
			<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
			<span class="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500"
				>Live Neural Stream</span
			>
		</div>
	</div>

	<!-- Market Insights Placeholder -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="p-4 border border-slate-800 bg-white/5 space-y-1">
			<span class="text-[7px] font-black uppercase text-slate-500 tracking-widest"
				>Market Phase</span
			>
			<div class="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
				Accumulation Detected
			</div>
		</div>
		<div class="p-4 border border-slate-800 bg-white/5 space-y-1">
			<span class="text-[7px] font-black uppercase text-slate-500 tracking-widest"
				>Volatility Index</span
			>
			<div class="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
				Low - Stable Link
			</div>
		</div>
		<div class="p-4 border border-slate-800 bg-white/5 space-y-1">
			<span class="text-[7px] font-black uppercase text-slate-500 tracking-widest"
				>Trade execution</span
			>
			<div class="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
				Optimal Connectivity
			</div>
		</div>
	</div>
</div>

<style>
	:global(.tradingview-widget-container) {
		background-color: transparent !important;
	}
</style>
