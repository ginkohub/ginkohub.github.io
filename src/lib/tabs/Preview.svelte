<script>
	let { accentColor } = $props();

	// Automatically scan ALL features for this tab
	const featureModules = import.meta.glob('../features/preview/*.svelte', { eager: true });
	
	// Map and sort to ensure consistent order
	const features = Object.entries(featureModules).map(([path, module]) => {
		const name = path.split('/').pop().replace('.svelte', '');
		return {
			path,
			name,
			component: module.default
		};
	}).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

	console.log('Preview features loaded:', features.map(f => f.name));
</script>

<div class="space-y-12">
	{#each features as feature (feature.path)}
		<div class="animate-in fade-in slide-in-from-bottom-2 duration-500">
			<feature.component {accentColor} />
		</div>
	{/each}
</div>