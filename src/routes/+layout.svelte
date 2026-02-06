<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>GINKOHUB</title>
	<meta name="description" content="Ginkohub - Developer Portfolio" />
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
