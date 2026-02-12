<script>
	import MarketOverview from '$lib/features/market/MarketOverview.svelte';
	let { accentColor } = $props();
</script>

<div class="space-y-8">
	<MarketOverview {accentColor} />
</div>
