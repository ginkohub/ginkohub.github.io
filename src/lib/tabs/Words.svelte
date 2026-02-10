<script>
	let { accentColor } = $props();

	// Automatically scan features for this tab
	const featureModules = import.meta.glob('../features/words/*.svelte', { eager: true });
	const features = Object.entries(featureModules)
		.map(([path, module]) => ({
			name: path.split('/').pop().replace('.svelte', ''),
			component: module.default
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
</script>

<div class="space-y-4">
	{#each features as feature}
		<div id="section-{feature.name.toLowerCase()}">
			<feature.component {accentColor} />
		</div>
	{/each}
</div>
