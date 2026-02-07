<script>
	import { onMount } from 'svelte';
	let { meme = $bindable(), joke = $bindable(), fetchMeme, fetchJoke, accentColor } = $props();

	// Automatically scan features for this tab
	const featureModules = import.meta.glob('../features/humor/*.svelte', { eager: true });
	const features = Object.entries(featureModules)
		.map(([path, module]) => ({
			path,
			name: path.split('/').pop().replace('.svelte', ''),
			component: module.default
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	onMount(() => {
		if (!meme.url) fetchMeme();
		if (!joke.setup) fetchJoke();
	});
</script>

<div class="space-y-4">
	{#each features as feature (feature.path)}
		<feature.component bind:meme bind:joke {fetchMeme} {fetchJoke} {accentColor} />
	{/each}
</div>
