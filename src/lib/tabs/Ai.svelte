<script>
	import FeatureLoader from '$lib/components/FeatureLoader.svelte';

	let { accentColor } = $props();

	// Automatically scan ALL features for this tab
	const featureModules = import.meta.glob('../features/ai/*.svelte');
</script>

<FeatureLoader modules={featureModules} order={['LlmLeaderboard', 'ModelShowcase']} {accentColor} />
