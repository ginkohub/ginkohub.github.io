<script>
	import { humorState } from '../features/humor/humorState.svelte';
	import Joke from '../features/humor/Joke.svelte';
	import Meme from '../features/humor/Meme.svelte';

	let { accentColor } = $props();

	const features = [
		{ name: 'joke', component: Joke },
		{ name: 'meme', component: Meme }
	];
</script>

<div class="space-y-4">
	{#each features as feature}
		<div id="section-{feature.name}">
			<feature.component {accentColor} />
		</div>
	{/each}
</div>
