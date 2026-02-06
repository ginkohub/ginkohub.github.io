<script>
	let { data, currentQuoteIndex = $bindable(), quote, prevQuote, nextQuote, scrapedQuotes, contacts, accentColor, bgImage, sessionStartTime } = $props();

	// Automatically scan features for this tab
	const featureModules = import.meta.glob('../features/about/*.svelte', { eager: true });
	
	// Ensure stable sorting by filename prefix (01-, 02-, etc.)
	const features = Object.entries(featureModules)
		.map(([path, module]) => ({
			path,
			name: path.split('/').pop().replace('.svelte', ''),
			component: module.default
		}))
		.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
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