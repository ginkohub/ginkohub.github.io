<script>
	import './layout.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>GinkoHub • Cyber Flâneur | Poetic Digital Portfolio</title>
	<meta
		name="description"
		content="Explore GinkoHub: A minimalist collection of digital experiments, Rumi's poetic wisdom, and interactive arcade games. Click here to initialize your session."
	/>
	<meta
		name="keywords"
		content="developer, portfolio, sveltekit, coding, rumi, quotes, games, word finder, minimalist design"
	/>
	<meta name="author" content="GinkoHub" />
	<meta name="theme-color" content="#000000" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://ginkohub.github.io/" />
	<meta property="og:title" content="GinkoHub • Cyber Flâneur | Poetic Digital Portfolio" />
	<meta
		property="og:description"
		content="Explore GinkoHub: A minimalist collection of digital experiments, Rumi's poetic wisdom, and interactive arcade games. Click here to initialize your session."
	/>
	<meta
		property="og:image"
		content="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=630&q=80"
	/>

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://ginkohub.github.io/" />
	<meta property="twitter:title" content="GinkoHub • Cyber Flâneur | Poetic Digital Portfolio" />
	<meta
		property="twitter:description"
		content="Explore GinkoHub: A minimalist collection of digital experiments, Rumi's poetic wisdom, and interactive arcade games. Click here to initialize your session."
	/>
	<meta
		property="twitter:image"
		content="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=630&q=80"
	/>

	<link rel="icon" href="https://github.com/ginkohub.png" />
</svelte:head>

{@render children()}
