<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let { data } = $props();

	// Modular Tab System (Lazy Loaded)
	const tabModules = import.meta.glob('$lib/tabs/*.svelte');
	const tabs = Object.entries(tabModules)
		.map(([path, moduleFunc]) => {
			const label = path.split('/').pop().replace('.svelte', '').toLowerCase();
			return {
				label,
				load: moduleFunc
			};
		})
		.sort((a, b) => {
			const order = { about: 0, humor: 1, words: 2, preview: 3, game: 4 };
			return (order[a.label] ?? 99) - (order[b.label] ?? 99);
		});

	let activeTabLabel = $state('about');
	let ActiveTabComponent = $state(null);

	// Dynamically load the component when tab changes
	$effect(() => {
		const tab = tabs.find((t) => t.label === activeTabLabel);
		if (tab) {
			tab.load().then((module) => {
				ActiveTabComponent = module.default;
			});
		}
	});

	let persona = $state('Internet Surfer');
	let meme = $state({ url: '', title: '', loading: false });
	let joke = $state({ setup: '', punchline: '', loading: false });
	let showAura = $state(false);
	let isGlitching = $state(false);

	// Combo Strike State
	let comboCount = $state(0);
	let comboScale = $state(1);
	let showCombo = $state(false);
	let comboTimeout;
	let isShaking = $state(false);

	// Persistent Session State
	let sessionStartTime = $state(Date.now());

	const backgrounds = [
		'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=60&fm=webp',
		'https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?auto=format&fit=crop&w=1200&q=60&fm=webp'
	];
	let selectedBg = $state('');

	// Accent Color State
	const accents = [
		{ name: 'emerald', hex: '#10b981' },
		{ name: 'sky', hex: '#0ea5e9' },
		{ name: 'violet', hex: '#8b5cf6' },
		{ name: 'rose', hex: '#f43f5e' },
		{ name: 'amber', hex: '#f59e0b' }
	];
	let currentAccent = $state(accents[0]);

	function shuffleAccent() {
		let newAccent;
		do {
			newAccent = accents[Math.floor(Math.random() * accents.length)];
		} while (newAccent.name === currentAccent.name);
		currentAccent = newAccent;
	}

	// Use build-time scraped quotes (derived from data prop)
	let scrapedQuotes = $derived(data.quotes || []);
	let currentQuoteIndex = $state(0);
	let quote = $derived({
		text: scrapedQuotes[currentQuoteIndex]?.text || 'Seeking wisdom...',
		author: scrapedQuotes[currentQuoteIndex]?.author || 'Rumi',
		loading: false
	});

	const personas = [
		'Cyber Flâneur',
		'Digital Observer',
		'Web Tinkerer',
		'Logic Voyager',
		'Information Gatherer',
		'Internet Surfer',
		'System Architect',
		'Data Mystic',
		'Code Alchemist',
		'Pixel Dreamer',
		'Virtual Nomad',
		'Syntax Weaver',
		'Binary Poet',
		'Neural Navigator',
		'Reality Glitcher',
		'Ghost in the Shell',
		'Protocol Phantom',
		'Void Walker',
		'Silicon Sage',
		'Bit Explorer'
	];

	function shufflePersona() {
		let newPersona;
		do {
			newPersona = personas[Math.floor(Math.random() * personas.length)];
		} while (newPersona === persona);

		isGlitching = true;
		setTimeout(() => {
			persona = newPersona;
			if (typeof document !== 'undefined') {
				document.title = `GinkoHub • ${persona}`;
			}
		}, 50);
		setTimeout(() => {
			isGlitching = false;
		}, 300);
	}

	function triggerAura() {
		showAura = false;
		setTimeout(() => {
			showAura = true;
		}, 10);
		setTimeout(() => {
			showAura = false;
		}, 2500);
	}

	function handleLogoClick(e) {
		triggerAura();
		shufflePersona();
		shuffleAccent();

		// Combo Strike Logic
		comboCount++;
		showCombo = true;
		comboScale = 1 + Math.min(comboCount * 0.02, 0.3);
		isShaking = true;

		// Reset shake effect
		setTimeout(() => {
			isShaking = false;
		}, 80);

		// Handle Reset Timer
		clearTimeout(comboTimeout);
		comboTimeout = setTimeout(() => {
			comboCount = 0;
			showCombo = false;
			comboScale = 1;
		}, 1500);
	}

	function nextQuote() {
		if (scrapedQuotes.length === 0) return;
		currentQuoteIndex = (currentQuoteIndex + 1) % scrapedQuotes.length;
	}

	function prevQuote() {
		if (scrapedQuotes.length === 0) return;
		currentQuoteIndex = (currentQuoteIndex - 1 + scrapedQuotes.length) % scrapedQuotes.length;
	}

	async function fetchMeme() {
		meme.loading = true;
		try {
			const res = await fetch('https://meme-api.com/gimme');
			const data = await res.json();
			meme.url = data.url;
			meme.title = data.title;
		} catch (e) {
			meme.title = 'Failed to load artifact.';
			meme.url = '';
		} finally {
			meme.loading = false;
		}
	}

	async function fetchJoke() {
		joke.loading = true;
		try {
			const res = await fetch('https://official-joke-api.appspot.com/random_joke');
			const data = await res.json();
			joke.setup = data.setup;
			joke.punchline = data.punchline;
		} catch (e) {
			joke.setup = 'Why did the developer go broke?';
			joke.punchline = 'Because he used up all his cache.';
		} finally {
			joke.loading = false;
		}
	}

	onMount(() => {
		shufflePersona();
		selectedBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
		shuffleAccent();
		if (scrapedQuotes.length > 0) {
			currentQuoteIndex = Math.floor(Math.random() * scrapedQuotes.length);
		}
	});

	const contacts = [
		{ label: 'Email', value: 'ginkohub@gmail.com', icon: '📧', link: 'mailto:ginkohub@gmail.com' },
		{ label: 'GitHub', value: 'ginkohub', icon: '🐙', link: 'https://github.com/ginkohub' },
		{ label: 'Discord', value: 'ginkohub', icon: '🎮' }
	];
</script>

<div
	class="min-h-screen bg-black text-slate-100 font-inter p-0 selection:bg-white selection:text-black relative overflow-x-hidden transition-colors duration-500"
	style="--accent-color: {currentAccent.hex}"
>
	<!-- Stable Background: Outside the shaking container -->
	<div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
		{#if selectedBg}
			<img
				id="main-bg-image"
				src={selectedBg}
				crossorigin="anonymous"
				alt=""
				class="w-full h-full object-cover transition-opacity duration-1000 opacity-[0.25]"
				in:fade={{ duration: 1000 }}
			/>
		{/if}
		<div
			class="absolute inset-0 z-0 opacity-[0.05] pointer-events-none transition-all duration-1000"
			style="background-image: radial-gradient({showAura
				? 'var(--accent-color)'
				: '#fff'} 1px, transparent 1px); background-size: 24px 24px;"
		></div>
		<div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40"></div>
	</div>

	<!-- Shaking Wrapper: Target only the content -->
	<div
		class="relative z-10 w-full min-h-screen {isShaking ? 'animate-shake' : ''}"
		style="will-change: transform;"
	>
		<div class="max-w-xl mx-auto flex flex-col items-center px-6">
			<!-- Profile Image & Combo Strike -->
			<div class="group perspective mt-12 mb-2 relative select-none">
				{#if showAura}
					<div
						class="absolute inset-0 rounded-full blur-2xl animate-glow-expand pointer-events-none"
						style="background-color: var(--accent-color); opacity: 0.3;"
					></div>
					<div
						class="absolute inset-0 rounded-full border-2 animate-ripple pointer-events-none"
						style="border-color: var(--accent-color); opacity: 0.2;"
					></div>
				{/if}

				{#if showCombo && comboCount > 1}
					<div
						class="absolute top-[-20%] left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:-right-12 md:top-0 z-20 pointer-events-none font-black italic tracking-tighter whitespace-nowrap"
						style="color: var(--accent-color); font-size: {Math.min(
							14 + comboCount,
							32
						)}px; filter: drop-shadow(0 0 10px var(--accent-color));"
						in:fly={{ y: 10, duration: 150 }}
					>
						x{comboCount} STRIKE
					</div>
				{/if}

				<button
					onclick={handleLogoClick}
					class="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden transition-all duration-75 ease-out group-hover:scale-105 active:scale-90 z-10 block touch-manipulation"
					style="transform: scale({comboScale})"
				>
					<img
						src="https://github.com/ginkohub.png"
						alt="GinkoHub Profile"
						class="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 active:grayscale-0 scale-125 {showAura
							? 'grayscale-0'
							: ''}"
						onerror={(e) => (e.currentTarget.style.display = 'none')}
					/>
				</button>
			</div>

			<!-- Identity -->
			<header class="mb-8 text-center">
				<h1
					class="text-2xl font-bold tracking-tight text-white mb-1 font-space active:scale-95 transition-transform"
				>
					GinkoHub
				</h1>
				<button
					onclick={() => {
						if (!showAura) {
							triggerAura();
							shufflePersona();
							shuffleAccent();
						}
					}}
					class="text-[9px] font-bold text-slate-300 uppercase tracking-widest hover:text-white active:text-white transition-colors cursor-pointer select-none {isGlitching
						? 'animate-glitch'
						: ''}"
					title="Click to shuffle"
				>
					{persona} ↻
				</button>
			</header>

			<!-- Modular Navigation -->
			<nav
				class="flex w-full border-b border-slate-800 mb-10 overflow-x-auto no-scrollbar scroll-smooth"
			>
				<div class="flex min-w-full">
					{#each tabs as tab}
						<button
							onclick={() => (activeTabLabel = tab.label)}
							class="flex-1 min-w-[80px] py-3 font-bold uppercase tracking-widest text-[9px] transition-colors duration-300 relative active:bg-slate-900
							{activeTabLabel === tab.label ? 'text-white' : 'text-slate-400 hover:text-slate-200'}"
						>
							{tab.label}
							{#if activeTabLabel === tab.label}
								<div
									class="absolute bottom-0 left-0 w-full h-[2px] animate-pulse-slow"
									style="background-color: var(--accent-color)"
									in:fade={{ duration: 200 }}
								></div>
							{/if}
						</button>
					{/each}
				</div>
			</nav>

			<!-- Dynamic Content -->
			<div class="w-full min-h-[250px] pb-24">
				{#if ActiveTabComponent}
					<ActiveTabComponent
						{data}
						bind:meme
						bind:joke
						{fetchMeme}
						{fetchJoke}
						{scrapedQuotes}
						bind:currentQuoteIndex
						{quote}
						{prevQuote}
						{nextQuote}
						{contacts}
						accentColor={currentAccent.hex}
						bgImage={selectedBg}
						{sessionStartTime}
					/>
				{/if}
			</div>

			<!-- Footer -->
			<footer
				class="mt-auto w-full py-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3 text-[8px] font-bold uppercase tracking-widest text-slate-400"
			>
				<div class="flex gap-3">
					<span>&copy; {new Date().getFullYear()} GINKOHUB</span>
					<span>SvelteKit 5.0</span>
				</div>
				<span class="font-medium normal-case">Made with ❤️ by Google Gemini 3 Pro</span>
			</footer>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background-color: #000000;
		font-family: 'Inter', sans-serif;
		transition: background-color 0.5s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.font-space {
		font-family: 'Space Grotesk', sans-serif;
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.touch-manipulation {
		touch-action: manipulation;
	}

	@keyframes shake {
		0% {
			transform: translate(1px, 1px);
		}
		20% {
			transform: translate(-1px, 0px);
		}
		40% {
			transform: translate(1px, -1px);
		}
		60% {
			transform: translate(-1px, 1px);
		}
		80% {
			transform: translate(1px, 1px);
		}
		100% {
			transform: translate(0, 0);
		}
	}

	.animate-shake {
		animation: shake 0.1s linear;
	}

	@keyframes glow-expand {
		0% {
			transform: scale(0.8);
			opacity: 0;
		}
		30% {
			transform: scale(1.1);
			opacity: 1;
		}
		100% {
			transform: scale(1.6);
			opacity: 0;
		}
	}

	@keyframes ripple {
		0% {
			transform: scale(1);
			opacity: 1;
			border-width: 4px;
		}
		100% {
			transform: scale(2.2);
			opacity: 0;
			border-width: 1px;
		}
	}

	.animate-glow-expand {
		animation: glow-expand 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.animate-ripple {
		animation: ripple 2s cubic-bezier(0, 0, 0.2, 1) forwards;
	}

	@keyframes glitch {
		0% {
			transform: translate(0);
			text-shadow:
				-2px 0 var(--accent-color),
				2px 0 #fff;
		}
		20% {
			transform: translate(-2px, 2px);
		}
		40% {
			transform: translate(-2px, -2px);
			text-shadow:
				2px 0 var(--accent-color),
				-2px 0 #fff;
		}
		60% {
			transform: translate(2px, 2px);
		}
		80% {
			transform: translate(2px, -2px);
			text-shadow:
				-1px 0 var(--accent-color),
				1px 0 #fff;
		}
		100% {
			transform: translate(0);
		}
	}

	.animate-glitch {
		animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
	}

	@keyframes pulse-slow {
		0%,
		100% {
			opacity: 1;
			filter: brightness(1);
		}
		50% {
			opacity: 0.6;
			filter: brightness(1.5);
		}
	}

	.animate-pulse-slow {
		animation: pulse-slow 3s ease-in-out infinite;
	}
</style>
