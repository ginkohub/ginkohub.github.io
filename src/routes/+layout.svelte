<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>GinkoHub • Cyber Flâneur</title>
	<meta name="description" content="GinkoHub - Developer portfolio, poetic wisdom, and digital experiments. Cyber flâneur in the digital void." />
	<meta name="keywords" content="developer, portfolio, sveltekit, coding, rumi, quotes, games, word finder" />
	<meta name="author" content="GinkoHub" />
	<meta name="theme-color" content="#000000" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://ginkohub.github.io/" />
	<meta property="og:title" content="GinkoHub • Cyber Flâneur" />
	<meta property="og:description" content="Explore a minimalist collection of digital artifacts, poetic wisdom, and developer experiments." />
	<meta property="og:image" content="https://github.com/ginkohub.png" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://ginkohub.github.io/" />
	<meta property="twitter:title" content="GinkoHub • Cyber Flâneur" />
	<meta property="twitter:description" content="Explore a minimalist collection of digital artifacts, poetic wisdom, and developer experiments." />
	<meta property="twitter:image" content="https://github.com/ginkohub.png" />

	<link rel="icon" href="https://github.com/ginkohub.png" />
</svelte:head>

{@render children()}
