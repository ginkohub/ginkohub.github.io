<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let {
		load,
		componentProps = {},
		delay = 0,
		placeholder = null,
		component = $bindable()
	} = $props();

	let Component = $state(null);
	let ready = $state(false);

	onMount(async () => {
		if (delay > 0) await new Promise((r) => setTimeout(r, delay));

		try {
			const module = await load();
			Component = module.default;
			ready = true;
		} catch (e) {
			console.error('Deferred load failed:', e);
		}
	});
</script>

{#if ready && Component}
	<div in:fade={{ duration: 500 }}>
		<Component bind:this={component} {...componentProps} />
	</div>
{:else if placeholder}
	{@render placeholder()}
{/if}
