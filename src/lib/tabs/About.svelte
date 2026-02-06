<script>
	let {
		data,
		currentQuoteIndex = $bindable(),
		quote,
		prevQuote,
		nextQuote,
		scrapedQuotes,
		contacts,
		accentColor,
		bgImage,
		sessionStartTime
	} = $props();

	// Automatically scan features for this tab
	const featureModules = import.meta.glob('../features/about/*.svelte');

	let features = $state([]);

	// Load all features for this tab
	$effect(() => {
		const loadFeatures = async () => {
			const loaded = await Promise.all(
				Object.entries(featureModules).map(async ([path, moduleFunc]) => {
					const module = await moduleFunc();
					return {
						path,
						name: path.split('/').pop().replace('.svelte', ''),
						component: module.default
					};
				})
			);
			features = loaded.sort((a, b) =>
				a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
			);
		};
		loadFeatures();
	});
</script>

<div class="space-y-4">
	{#each features as feature (feature.path)}
		<feature.component
			{data}
			bind:currentQuoteIndex
			{quote}
			{prevQuote}
			{nextQuote}
			{scrapedQuotes}
			{contacts}
			{accentColor}
			{bgImage}
			{sessionStartTime}
		/>
	{/each}
</div>
