<script>
	import { previewState } from '../features/preview/previewState.svelte';
	let { accentColor } = $props();

	// Automatically scan ALL features for this tab
	const featureModules = import.meta.glob('../features/preview/*.svelte', { eager: true });

	// Map and sort to ensure consistent order
	const allFeatures = Object.entries(featureModules)
		.map(([path, module]) => {
			const name = path.split('/').pop().replace('.svelte', '');
			return {
				path,
				name,
				component: module.default
			};
		})
		.sort((a, b) => {
			if (a.name === 'Input') return -1;
			if (b.name === 'Input') return 1;
			return a.name.localeCompare(b.name, undefined, { numeric: true });
		});

	// Filter based on state, but always keep the input component (Input)
	const filteredFeatures = $derived(
		allFeatures.filter((f) => {
			if (f.name === 'Input') return true;
			// Platform name is now just the filename (e.g., "Twitter" -> "Twitter")
			return previewState.visiblePreviews.includes(f.name);
		})
	);

	console.log(
		'Preview features loaded:',
		allFeatures.map((f) => f.name)
	);
</script>

<div class="space-y-12">
	{#if filteredFeatures.length === 0}
		<div class="text-center py-20 border border-dashed border-slate-800">
			<p class="text-[10px] font-black uppercase tracking-widest text-slate-500">
				No preview modules detected
			</p>
		</div>
	{:else}
		{#each filteredFeatures as feature (feature.path)}
			{@const FeatureComponent = feature.component}
			<div class="animate-in fade-in slide-in-from-bottom-2 duration-500">
				<FeatureComponent {accentColor} />
			</div>
		{/each}
	{/if}
</div>
