<script>
	let { accentColor } = $props();

	// Automatically scan ALL features for this tab
	const featureModules = import.meta.glob('../features/ai/*.svelte');

	let features = $state([]);

	$effect(() => {
		const loadFeatures = async () => {
			const loaded = await Promise.all(
				Object.entries(featureModules)
					.filter(([path]) => {
						const name = path.split('/').pop() || '';
						return /^\d/.test(name);
					})
					.map(async ([path, moduleFunc]) => {
						const module = await moduleFunc();
						return {
							path,
							name: path.split('/').pop().replace('.svelte', ''),
							component: module.default
						};
					})
			);
			features = loaded.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
		};
		loadFeatures();
	});
</script>

<div class="space-y-12">
	{#each features as feature (feature.path)}
		<div
			id="section-{feature.name.toLowerCase()}"
			class="animate-in fade-in slide-in-from-bottom-2 duration-500"
		>
			<feature.component {accentColor} />
		</div>
	{/each}
</div>
