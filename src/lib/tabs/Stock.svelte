<script>
	import StockOverview from '$lib/features/stock/StockOverview.svelte';
	let { accentColor } = $props();
</script>

<div class="space-y-8">
	<StockOverview {accentColor} />
</div>
