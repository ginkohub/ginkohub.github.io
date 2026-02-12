<script>
	import { onMount } from 'svelte';
	import { marketState } from './marketState.svelte';
	import { fade } from 'svelte/transition';

	let { accentColor } = $props();
	let containerId = `tv-chart-${Math.random().toString(36).substr(2, 9)}`;
	let widget = null;

	function initTradingView() {
		if (typeof window !== 'undefined' && window.TradingView) {
			// Small delay to ensure container is in DOM
			setTimeout(() => {
				const container = document.getElementById(containerId);
				if (!container) return;

				widget = new window.TradingView.widget({
					autosize: true,
					symbol: `BINANCE:${marketState.selectedSymbol}USDT`,
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

	// Re-init chart when symbol changes
	$effect(() => {
		if (marketState.selectedSymbol) {
			initTradingView();
		}
	});
</script>

<div class="space-y-6">
	<!-- Asset Selection Dropdown -->

	<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
		<div class="relative w-full md:w-64 group">
			<label
				for="market-select"
				class="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1 block"
			>
				Select Neural Asset
			</label>

			<div class="relative">
				<select
					id="market-select"
					value={marketState.selectedSymbol}
					onchange={(e) => marketState.setSelectedSymbol(e.target.value)}
					class="w-full bg-black border border-slate-800 p-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-white/20 appearance-none cursor-pointer transition-all hover:bg-slate-900"
				>
					{#each marketState.assets as asset}
						<option value={asset.symbol}>
							{asset.symbol} - ${asset.price.toLocaleString()}
						</option>
					{/each}
				</select>

				<div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
					▼
				</div>
			</div>
		</div>

		<div class="flex gap-4">
			<div class="flex flex-col items-end">
				<span class="text-[7px] font-black uppercase text-slate-500 tracking-widest"
					>Selected Price</span
				>

				<span class="text-sm font-mono font-black text-white">
					${marketState.selectedAsset?.price.toLocaleString(undefined, {
						minimumFractionDigits: 2
					})}
				</span>
			</div>

			<div class="flex flex-col items-end">
				<span class="text-[7px] font-black uppercase text-slate-500 tracking-widest"
					>24h Change</span
				>

				<span
					class="text-sm font-mono font-black {marketState.selectedAsset?.change24h >= 0
						? 'text-emerald-500'
						: 'text-rose-500'}"
				>
					{marketState.selectedAsset?.change24h >= 0
						? '+'
						: ''}{marketState.selectedAsset?.change24h.toFixed(2)}%
				</span>
			</div>
		</div>
	</div>

	<!-- Main Chart Area -->
	<div class="relative h-[400px] border border-slate-800 bg-black group/chart">
		<!-- Aesthetic Overlays -->
		<div
			class="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 z-10"
			style="background-image: radial-gradient(circle at 50% 50%, {accentColor} 0%, transparent 70%);"
		></div>

		<div id={containerId} class="w-full h-full"></div>

		{#if marketState.loading}
			<div
				class="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm"
				out:fade
			>
				<div class="flex flex-col items-center gap-4">
					<div
						class="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
						style="border-color: {accentColor}; border-top-color: transparent"
					></div>
					<span class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500"
						>Synchronizing Neural Market Feed...</span
					>
				</div>
			</div>
		{/if}
	</div>

	<!-- Statistics Row -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-slate-800">
		<div class="flex flex-col">
			<span class="text-[7px] font-black uppercase text-slate-500 tracking-widest">24h High</span>
			<span class="text-xs font-mono font-bold"
				>${marketState.selectedAsset?.high24h.toLocaleString()}</span
			>
		</div>
		<div class="flex flex-col">
			<span class="text-[7px] font-black uppercase text-slate-500 tracking-widest">24h Low</span>
			<span class="text-xs font-mono font-bold"
				>${marketState.selectedAsset?.low24h.toLocaleString()}</span
			>
		</div>
		<div class="flex flex-col">
			<span class="text-[7px] font-black uppercase text-slate-500 tracking-widest">24h Volume</span>
			<span class="text-xs font-mono font-bold"
				>${marketState.selectedAsset?.volume.toLocaleString(undefined, {
					maximumFractionDigits: 0
				})}</span
			>
		</div>
		<div class="flex flex-col">
			<span class="text-[7px] font-black uppercase text-slate-500 tracking-widest"
				>Network Status</span
			>
			<span class="text-[9px] font-bold text-emerald-500 flex items-center gap-1 uppercase">
				<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
				Uplink Active
			</span>
		</div>
	</div>

	<!-- Currency Exchange Section (Kurs) -->
	<div class="pt-8 space-y-4">
		<div class="flex items-center gap-3">
			<div class="h-[1px] flex-1 bg-slate-800"></div>
			<h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
				Currency Exchange (IDR)
			</h3>
			<div class="h-[1px] flex-1 bg-slate-800"></div>
		</div>

		<!-- Converter UI -->

		<div class="p-6 border border-slate-800 bg-black/40 space-y-4">
			<div class="flex items-center gap-3 mb-2">
				<span class="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500"
					>Neural Currency Bridge</span
				>

				<div class="h-[1px] flex-1 bg-slate-800/50"></div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative">
				<!-- FROM -->

				<div class="space-y-2">
					<div class="flex justify-between items-end">
						<label for="conv-from" class="text-[7px] font-black uppercase text-slate-500"
							>Source Asset</label
						>

						<select
							bind:value={marketState.convFrom}
							class="bg-transparent text-[10px] font-bold text-slate-300 focus:outline-none cursor-pointer"
						>
							{#each marketState.currencies as curr}
								<option value={curr.code}>{curr.flag} {curr.code}</option>
							{/each}
						</select>
					</div>

					<input
						id="conv-from"
						type="number"
						value={marketState.valFromComputed}
						oninput={(e) => {
							marketState.valFrom = parseFloat(e.target.value) || 0;

							marketState.lastEdited = 'from';
						}}
						class="w-full bg-slate-900/50 border border-slate-800 p-3 text-sm font-mono font-black text-white focus:outline-none focus:border-white/20 transition-all"
					/>
				</div>

				<!-- Interaction Icon (Center) -->

				<div
					class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black border border-slate-800 items-center justify-center text-[10px] text-slate-500"
				>
					⇄
				</div>

				<div class="md:hidden flex justify-center text-slate-700">⇅</div>

				<!-- TO -->

				<div class="space-y-2">
					<div class="flex justify-between items-end">
						<label for="conv-to" class="text-[7px] font-black uppercase text-slate-500"
							>Target Asset</label
						>

						<select
							bind:value={marketState.convTo}
							class="bg-transparent text-[10px] font-bold text-slate-300 focus:outline-none cursor-pointer"
						>
							{#each marketState.currencies as curr}
								<option value={curr.code}>{curr.flag} {curr.code}</option>
							{/each}
						</select>
					</div>

					<input
						id="conv-to"
						type="number"
						value={marketState.valToComputed}
						oninput={(e) => {
							marketState.valTo = parseFloat(e.target.value) || 0;

							marketState.lastEdited = 'to';
						}}
						class="w-full bg-slate-900/50 border border-slate-800 p-3 text-sm font-mono font-black text-emerald-400 focus:outline-none focus:border-emerald-500/20 transition-all"
					/>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
			{#if marketState.rates && marketState.rates.length > 0}
				{#each marketState.rates as rate}
					<div class="p-3 border border-slate-800/50 bg-white/5 relative group overflow-hidden">
						<div class="flex justify-between items-center mb-1">
							<span class="text-[10px] font-black text-slate-500">{rate.code}</span>

							<span class="text-xs">{rate.flag}</span>
						</div>

						<div class="text-xs font-mono font-bold text-slate-200">
							Rp {rate.rate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
						</div>

						<!-- Aesthetic scanning line -->

						<div
							class="absolute top-0 left-0 w-full h-[1px] bg-white/10 -translate-y-full group-hover:animate-scan"
						></div>
					</div>
				{/each}
			{:else}
				<div
					class="col-span-full py-8 text-center border border-slate-800 border-dashed opacity-50"
				>
					<span class="text-[8px] font-black uppercase tracking-widest"
						>Establishing Neural Forex Connection...</span
					>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	:global(.tradingview-widget-container) {
		background-color: transparent !important;
	}

	@keyframes scan {
		from {
			transform: translateY(-100%);
		}
		to {
			transform: translateY(400%);
		}
	}
	.group-hover\:animate-scan {
		animation: scan 1.5s linear infinite;
	}
</style>
