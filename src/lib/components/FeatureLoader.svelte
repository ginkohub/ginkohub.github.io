<script>
	import { onMount } from 'svelte';

	let { modules, order = [], ...restProps } = $props();

	let features = $state([]);

	$effect(() => {
		const loadFeatures = async () => {
			const loaded = await Promise.all(
				Object.entries(modules).map(async ([path, moduleFunc]) => {
					const module = await moduleFunc();
					return {
						path,
						name: path.split('/').pop().replace('.svelte', ''),
						component: module.default
					};
				})
			);

			if (order.length > 0) {
				features = loaded.sort((a, b) => {
					const indexA = order.indexOf(a.name);
					const indexB = order.indexOf(b.name);

					// If both are in the order list, sort by index
					if (indexA !== -1 && indexB !== -1) return indexA - indexB;

					// If only one is in the list, prioritize it
					if (indexA !== -1) return -1;
					if (indexB !== -1) return 1;

					// Fallback to alphabetical for unlisted items
					return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
				});
			} else {
				features = loaded.sort((a, b) =>
					a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
				);
			}
		};
		loadFeatures();
	});
</script>

<div class="space-y-4">
	{#each features as feature (feature.path)}
		{@const FeatureComponent = feature.component}
		<div id="section-{feature.name.toLowerCase()}">
			<FeatureComponent {...restProps} />
		</div>
	{/each}
</div>
