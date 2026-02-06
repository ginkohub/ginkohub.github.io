<script>
	let { accentColor } = $props();

	// Automatically scan features for this tab
	const featureModules = import.meta.glob('../features/preview/*.svelte', { eager: true });
	const features = Object.entries(featureModules).map(([path, module]) => ({
		path,
		name: path.split('/').pop().replace('.svelte', ''),
		component: module.default
	})).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
</script>

<div class="space-y-10">
	{#each features as feature (feature.path)}
		<feature.component {accentColor} />
	{/each}
</div>
