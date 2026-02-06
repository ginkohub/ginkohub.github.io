<script>
	let { data, currentQuoteIndex = $bindable(), quote, prevQuote, nextQuote, scrapedQuotes, contacts, accentColor, bgImage } = $props();

	// Automatically scan features for this tab
	const featureModules = import.meta.glob('../features/about/*.svelte', { eager: true });
	const features = Object.entries(featureModules).map(([path, module]) => ({
		name: path.split('/').pop().replace('.svelte', ''),
		component: module.default
	})).sort((a, b) => a.name.localeCompare(b.name));
</script>

<div class="space-y-4">
	{#each features as feature}
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
		/>
	{/each}
</div>