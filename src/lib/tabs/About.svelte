<script>
	import FeatureLoader from '$lib/components/FeatureLoader.svelte';

	let { data, contacts, accentColor, bgImage, sessionStartTime } = $props();

	// Automatically scan features for this tab
	const featureModules = import.meta.glob('../features/about/*.svelte');
</script>

<FeatureLoader
	modules={featureModules}
	order={['Connect', 'GitHub', 'Comments']}
	{data}
	{contacts}
	{accentColor}
	{bgImage}
	{sessionStartTime}
/>
