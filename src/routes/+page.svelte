<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import ChatWidget from '$lib/components/ChatWidget.svelte';
	import Fireworks from '$lib/components/effects/Fireworks.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let { data } = $props();

	// Modular Tab System (Lazy Loaded)
	const tabModules = import.meta.glob('$lib/tabs/*.svelte');
	const tabDescriptions = {
		tools: 'Utility tools for developers',
		news: 'Tech news, trends, and leaderboards',
		ai: 'AI model benchmarks and neural metrics',
		humor: 'Jokes and memes for a laugh',
		words: 'Word finder and dictionary tool',
		preview: 'Social media link previewer',
		game: 'Retro arcade games collection'
	};

	const tabs = Object.entries(tabModules)
		.map(([path, moduleFunc]) => {
			const label = path.split('/').pop().replace('.svelte', '').toLowerCase();
			return {
				label,
				load: moduleFunc,
				description: tabDescriptions[label] // Add description here
			};
		})
		.sort((a, b) => {
			const order = { about: 0, tools: 1, news: 2, ai: 3, humor: 4, words: 5, preview: 6, game: 7 };
			return (order[a.label] ?? 99) - (order[b.label] ?? 99);
		});

	let activeTabLabel = $state('about');
	let ActiveTabComponent = $state(null);

	// Custom System Mount Transition
	function systemMount(node, { duration = 400, delay = 0 }) {
		return {
			duration,
			delay,
			css: (t) => {
				const eased = 1 - Math.pow(1 - t, 3); // Cubic ease out
				return `
					opacity: ${t};
					transform: scale(${0.98 + t * 0.02}) translateY(${(1 - eased) * 10}px);
					filter: blur(${(1 - t) * 4}px) hue-rotate(${(1 - t) * 90}deg);
					border-top: 1px solid rgba(var(--accent-rgb), ${1 - t});
				`;
			}
		};
	}

	// Load active tab from localStorage on mount
	onMount(() => {
		const savedTab = localStorage.getItem('ginkohub_active_tab');
		if (savedTab && tabs.some((t) => t.label === savedTab)) {
			activeTabLabel = savedTab;
		}
	});

	// Persist active tab to localStorage
	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('ginkohub_active_tab', activeTabLabel);
		}
	});

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
	let meme = $state({ url: '', title: '', loading: false, channel: 'memes' });
	let joke = $state({ setup: '', punchline: '', loading: false });
	let showAura = $state(false);
	let isGlitching = $state(false);
	let isOverloaded = $state(false);
	let showOverloadModal = $state(false);
	let commandBuffer = $state('');

	// Combo Strike State
	let comboCount = $state(0);
	let comboScale = $state(1);
	let showCombo = $state(false);
	let comboTimeout;
	let isShaking = $state(false);

	// Effects System
	let fireworksSystem;

	// Persistent Session State
	let sessionStartTime = $state(Date.now());
	let mouseX = $state(0);
	let mouseY = $state(0);
	let motes = $state([]);

	function handleMouseMove(e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
	}

	const backgrounds = {
		morning: [
			'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=60&fm=webp',
			'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=1200&q=60&fm=webp',
			'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=60&fm=webp'
		],
		day: [
			'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=60&fm=webp',
			'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=60&fm=webp',
			'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=60&fm=webp',
			'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=60&fm=webp'
		],
		evening: [
			'https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?auto=format&fit=crop&w=1200&q=60&fm=webp',
			'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=60&fm=webp',
			'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60&fm=webp'
		],
		night: [
			'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=60&fm=webp',
			'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=60&fm=webp',
			'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=60&fm=webp'
		]
	};

	function getBackgroundByTime() {
		const hour = new Date().getHours();
		let set = backgrounds.day;
		if (hour >= 5 && hour < 10) set = backgrounds.morning;
		else if (hour >= 10 && hour < 17) set = backgrounds.day;
		else if (hour >= 17 && hour < 21) set = backgrounds.evening;
		else set = backgrounds.night;
		return set[Math.floor(Math.random() * set.length)];
	}

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

		if (comboCount % 10 === 0) {
			fireworksSystem?.trigger(comboCount / 10);
		}

		showCombo = true;

		comboScale = 1 + Math.min(comboCount * 0.02, 0.3);

		isShaking = true;

		// Overload Mode Trigger

		if (comboCount === 50) {
			isOverloaded = true;
			showOverloadModal = true;
		}

		// Reset shake effect

		setTimeout(() => {
			isShaking = false;
		}, 80);

		// Handle Reset Timer

		clearTimeout(comboTimeout);

		comboTimeout = setTimeout(() => {
			if (!isOverloaded) comboCount = 0;

			showCombo = false;

			comboScale = 1;
		}, 2000);
	}

	function handleGlobalKeydown(e) {
		if (e.key.length === 1) {
			commandBuffer += e.key.toLowerCase();

			if (commandBuffer.length > 20) commandBuffer = commandBuffer.slice(-20);

			if (commandBuffer.endsWith('matrix')) {
				currentAccent = { name: 'matrix', hex: '#00ff41' };

				isOverloaded = true;

				commandBuffer = '';
			} else if (commandBuffer.endsWith('reset')) {
				isOverloaded = false;

				comboCount = 0;

				commandBuffer = '';

				shuffleAccent();
			} else if (commandBuffer.endsWith('rumi')) {
				activeTabLabel = 'about';

				commandBuffer = '';
			}
		}
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
			const channel = meme.channel || 'memes';
			const res = await fetch(`https://meme-api.com/gimme/${channel}`);

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

		selectedBg = getBackgroundByTime();

		shuffleAccent();

		if (scrapedQuotes.length > 0) {
			currentQuoteIndex = Math.floor(Math.random() * scrapedQuotes.length);
		}

		window.addEventListener('keydown', handleGlobalKeydown);
		window.addEventListener('mousemove', handleMouseMove);

		// Initialize Data Motes
		motes = Array.from({ length: 20 }, (_, i) => ({
			id: i,
			x: Math.random() * 100,
			y: Math.random() * 100,
			duration: 15 + Math.random() * 20,
			delay: Math.random() * 10
		}));

		// Random Identity Glitch
		const glitchInterval = setInterval(() => {
			if (Math.random() > 0.8) {
				isGlitching = true;
				setTimeout(() => (isGlitching = false), 200);
			}
		}, 8000);

		return () => clearInterval(glitchInterval);
	});

	import { onDestroy } from 'svelte';
	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleGlobalKeydown);
			window.removeEventListener('mousemove', handleMouseMove);
		}
	});

	const contacts = [
		{ label: 'Email', value: 'ginkohub@gmail.com', icon: '📧', link: 'mailto:ginkohub@gmail.com' },
		{ label: 'GitHub', value: 'ginkohub', icon: '🐙', link: 'https://github.com/ginkohub' },
		{ label: 'Discord', value: 'ginkohub', icon: '🎮' }
	];
</script>

<div
	class="min-h-screen bg-black text-slate-100 font-inter p-0 selection:bg-white selection:text-black relative overflow-x-hidden transition-colors duration-500 {isOverloaded
		? 'overload-mode'
		: ''}"
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
		
		<!-- Scanline Effect -->
		<div class="absolute inset-0 z-10 pointer-events-none opacity-[0.03] bg-scanline"></div>

		<!-- Data Motes -->
		{#each motes as mote (mote.id)}
			<div
				class="absolute w-[2px] h-[2px] bg-white rounded-full opacity-0 animate-float pointer-events-none z-0"
				style="
					left: {mote.x}%;
					top: {mote.y}%;
					animation-duration: {mote.duration}s;
					animation-delay: {mote.delay}s;
				"
			></div>
		{/each}

		<!-- Interactive Grid -->
		<div
			class="absolute inset-0 z-0 opacity-[0.15] pointer-events-none transition-opacity duration-300"
			style="
				background-image: radial-gradient({showAura ? 'var(--accent-color)' : '#fff'} 1px, transparent 1px);
				background-size: 24px 24px;
				mask-image: radial-gradient(circle 400px at {mouseX}px {mouseY}px, black 0%, transparent 100%);
				-webkit-mask-image: radial-gradient(circle 400px at {mouseX}px {mouseY}px, black 0%, transparent 100%);
			"
		></div>
		
		<!-- Base Grid (fainter) -->
		<div
			class="absolute inset-0 z-[-1] opacity-[0.03] pointer-events-none"
			style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 24px 24px;"
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
						class="absolute top-[-20%] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap font-black italic tracking-tighter pointer-events-none md:top-0 md:left-auto md:-right-12 md:translate-x-0"
						style="color: var(--accent-color); font-size: {Math.min(
							14 + comboCount,
							32
						)}px; filter: drop-shadow(0 0 10px var(--accent-color));"
						in:fly={{ y: 10, duration: 150 }}
					>
						{isOverloaded ? 'SYSTEM OVERLOAD' : `x${comboCount} STRIKE`}
					</div>
				{/if}

				<button
					onclick={handleLogoClick}
					class="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden transition-all duration-75 ease-out group-hover:scale-105 active:scale-90 z-10 block touch-manipulation"
					style="transform: scale({comboScale})"
					title="Click to trigger aura and shuffle persona"
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
						class="text-2xl font-bold tracking-tight text-white mb-1 font-space active:scale-95 transition-transform {isGlitching
							? 'animate-glitch'
							: ''}"
					>
						GinkoHub
					</h1>
					<button					onclick={() => {
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
			<div class="w-full mb-5 border-b border-slate-800">
				<!-- Row 1: Primary Content -->
				<nav class="flex flex-wrap justify-center w-full">
					{#each tabs.filter((t) => !['words', 'tools', 'game', 'preview'].includes(t.label)) as tab, i}
						<button
							onclick={() => {
								activeTabLabel = tab.label;
							}}
							style={isOverloaded ? `
								--hang-angle: ${-8 + (i * 5) % 20}deg;
								--swing-speed: ${3 + (i % 3)}s;
								--swing-delay: ${i * 0.2}s;
							` : ''}
							class="min-w-[80px] px-4 py-3 font-bold uppercase tracking-widest text-[9px] transition-all duration-300 relative active:bg-slate-900
							{activeTabLabel === tab.label ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
							{isOverloaded ? 'broken-tab' : ''}"
							title={tab.description}
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
				</nav>
				<!-- Row 2: Utilities & Experiments -->
				<nav class="flex flex-wrap justify-center w-full border-t border-slate-800/30 bg-white/5">
					{#each tabs.filter((t) => ['words', 'tools', 'game', 'preview'].includes(t.label)) as tab, i}
						<button
							onclick={() => {
								activeTabLabel = tab.label;
							}}
							style={isOverloaded ? `
								--hang-angle: ${5 + (i * 6) % 15}deg;
								--swing-speed: ${2.5 + (i % 4) * 0.5}s;
								--swing-delay: ${i * 0.15}s;
							` : ''}
							class="min-w-[80px] px-4 py-3 font-bold uppercase tracking-widest text-[9px] transition-all duration-300 relative active:bg-slate-900
							{activeTabLabel === tab.label ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
							{isOverloaded ? 'broken-tab' : ''}"
							title={tab.description}
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
				</nav>
			</div>

			<!-- Dynamic Content -->
			<div class="w-full min-h-[250px] pb-24">
				{#key activeTabLabel}
					<div in:systemMount={{ duration: 500 }} class="w-full">
						{#if activeTabLabel && tabs.find((t) => t.label === activeTabLabel)?.description}
							<div class="text-base text-center mb-6 px-2 text-slate-400 font-mono text-[10px] tracking-[0.2em] uppercase opacity-70">
								[{tabs.find((t) => t.label === activeTabLabel).description}]
							</div>
						{/if}
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
				{/key}
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

<ChatWidget accentColor={currentAccent.hex} />

<Fireworks bind:this={fireworksSystem} accentColor={currentAccent.hex} />

<Modal 
	bind:show={showOverloadModal} 
	title="CRITICAL ERROR" 
	message="You broke it man. The system integrity has been compromised by your excessive clicking." 
	closeOnOutside={false}
	onConfirm={() => {
		comboCount = 0;
		isOverloaded = false;
	}}
/>

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

	.overload-mode {
		filter: contrast(1.1) brightness(1.1);
	}

	.overload-mode :global(button) {
		text-shadow: 0 0 5px var(--accent-color);
	}

	.overload-mode::after {
		content: '';
		position: fixed;
		inset: 0;
		border: 1px solid var(--accent-color);
		opacity: 0.2;
		pointer-events: none;
		z-index: 100;
		animation: critical-flicker 0.1s infinite;
	}

	@keyframes critical-flicker {
		0% {
			opacity: 0.1;
		}
		50% {
			opacity: 0.2;
		}
		100% {
			opacity: 0.1;
		}
	}

	@keyframes hang-broken {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(var(--hang-angle, 15deg));
			transform-origin: top left;
		}
	}

	@keyframes swing {
		0%, 100% {
			transform: rotate(var(--hang-angle, 15deg)) translateY(0);
		}
		25% {
			transform: rotate(calc(var(--hang-angle, 15deg) + 3deg)) translateY(1px);
		}
		50% {
			transform: rotate(calc(var(--hang-angle, 15deg) - 1deg)) translateY(0px);
		}
		75% {
			transform: rotate(calc(var(--hang-angle, 15deg) + 5deg)) translateY(2px);
		}
	}

	.broken-tab {
		animation:
			hang-broken 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards,
			swing var(--swing-speed, 4s) ease-in-out infinite var(--swing-delay, 0s);
		pointer-events: auto;
		z-index: 10;
		box-shadow: -4px 6px 15px rgba(0, 0, 0, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		background: rgba(10, 10, 10, 0.95);
		backdrop-filter: blur(4px);
	}

	@keyframes scanline {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(100%);
		}
	}

	.bg-scanline {
		background: linear-gradient(
			to bottom,
			transparent 50%,
			rgba(255, 255, 255, 0.5) 51%,
			transparent 55%
		);
		background-size: 100% 8px;
		animation: scanline 8s linear infinite;
	}

	@keyframes float {
		0% {
			transform: translate(0, 0);
			opacity: 0;
		}
		25% {
			opacity: 0.3;
		}
		50% {
			transform: translate(20px, -20px);
			opacity: 0.1;
		}
		75% {
			opacity: 0.3;
		}
		100% {
			transform: translate(-10px, 10px);
			opacity: 0;
		}
	}

	.animate-float {
		animation: float infinite ease-in-out;
	}

</style>

