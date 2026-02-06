<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import HumorSection from '$lib/HumorSection.svelte';
	import WordFinder from '$lib/WordFinder.svelte';
	
	let { data } = $props(); 
	
	let activeTab = $state('about');
	let persona = $state('Internet Surfer');
	let meme = $state({ url: '', title: '', loading: false });
	let joke = $state({ setup: '', punchline: '', loading: false });
	let showAura = $state(false);
	
	// Background State
	const backgrounds = [
		'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80'
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

	// Lazy Loaded Components
	let HumorSectionComponent = $state(null);
	let WordFinderComponent = $state(null);
	let SnakeGameComponent = $state(null);

	async function loadHumor() {
		if (!HumorSectionComponent) {
			const module = await import('$lib/HumorSection.svelte');
			HumorSectionComponent = module.default;
		}
	}

	async function loadWords() {
		if (!WordFinderComponent) {
			const module = await import('$lib/WordFinder.svelte');
			WordFinderComponent = module.default;
		}
	}

	async function loadGame() {
		if (!SnakeGameComponent) {
			const module = await import('$lib/SnakeGame.svelte');
			SnakeGameComponent = module.default;
		}
	}

	$effect(() => {
		if (activeTab === 'humor') loadHumor();
		if (activeTab === 'words') loadWords();
		if (activeTab === 'game') loadGame();
	});

	const personas = [
		'Cyber Flâneur',
		'Digital Observer',
		'Web Tinkerer',
		'Logic Voyager',
		'Information Gatherer',
		'Internet Surfer'
	];

	function shufflePersona() {
		let newPersona;
		do {
			newPersona = personas[Math.floor(Math.random() * personas.length)];
		} while (newPersona === persona);
		persona = newPersona;
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

	function handleLogoClick() {
		triggerAura();
		shufflePersona();
		shuffleAccent();
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
			meme.title = "Failed to load artifact.";
			meme.url = "";
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
			joke.setup = "Why did the developer go broke?";
			joke.punchline = "Because he used up all his cache.";
		} finally {
			joke.loading = false;
		}
	}

	onMount(() => {
		selectedBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
		shuffleAccent();
		if (scrapedQuotes.length > 0) {
			currentQuoteIndex = Math.floor(Math.random() * scrapedQuotes.length);
		}
	});

	const contacts = [
		{ label: 'WhatsApp', value: '+62 878-2174-7174', icon: '💬' },
		{ label: 'Email', value: 'ginkohub@gmail.com', icon: '📧', link: 'mailto:ginkohub@gmail.com' },
		{ label: 'GitHub', value: 'ginkohub', icon: '🐙', link: 'https://github.com/ginkohub' },
		{ label: 'Discord', value: 'ginkohub', icon: '🎮' }
	];
</script>

<div class="min-h-screen bg-black text-slate-100 font-inter p-0 selection:bg-white selection:text-black relative overflow-hidden transition-colors duration-500" 
	style="--accent-color: {currentAccent.hex}">
	
	<!-- Random Single-Load Background -->
	<div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
		{#if selectedBg}
			<img 
				src={selectedBg} 
				alt="" 
				class="w-full h-full object-cover grayscale transition-opacity duration-1000 opacity-[0.35]"
				in:fade={{ duration: 1000 }}
			/>
		{/if}
		<!-- Subtle Background Pattern Overlay -->
		<div class="absolute inset-0 z-0 opacity-[0.05] pointer-events-none transition-all duration-1000" 
			style="background-image: radial-gradient({showAura ? 'var(--accent-color)' : '#fff'} 1px, transparent 1px); background-size: 24px 24px;">   
		</div>
		<!-- Subtle Gradient Overlay -->
		<div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40"></div>
	</div>

	<div class="max-w-xl mx-auto flex flex-col items-center relative z-10 px-6">
		<!-- Profile Image -->
		<div class="group perspective mt-12 mb-2 relative select-none">
			{#if showAura}
				<div class="absolute inset-0 rounded-full blur-2xl animate-glow-expand pointer-events-none" style="background-color: var(--accent-color); opacity: 0.3;"></div>
				<div class="absolute inset-0 rounded-full border-2 animate-ripple pointer-events-none" style="border-color: var(--accent-color); opacity: 0.2;"></div>
			{/if}
			
			<button 
				onclick={handleLogoClick}
				class="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 active:scale-95 z-10 block"
			>
				<img 
					src="https://github.com/ginkohub.png" 
					alt="GinkoHub Profile" 
					class="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 active:grayscale-0 scale-125 {showAura ? 'grayscale-0' : ''}"
					onerror={(e) => e.currentTarget.style.display='none'}
				/>
			</button>
		</div>

		<!-- Identity -->
		<header class="mb-8 text-center">
			<h1 class="text-2xl font-bold tracking-tight text-white mb-1 font-space active:scale-95 transition-transform">GinkoHub</h1>
			<button 
				onclick={() => { if (!showAura) { triggerAura(); shufflePersona(); shuffleAccent(); } }}
				class="text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-white active:text-white transition-colors cursor-pointer select-none"
				title="Click to shuffle"
			>
				{persona} ↻
			</button>
		</header>

		<!-- Navigation -->
		<nav class="flex w-full border-b border-slate-800 mb-10 relative">
			{#each ['about', 'humor', 'words', 'game'] as tab}
				<button
					onclick={() => (activeTab = tab)}
					class="flex-1 py-3 font-bold uppercase tracking-widest text-[9px] transition-colors duration-300 relative active:bg-slate-900
                    {activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}"
				>
					{tab}
					{#if activeTab === tab}
						<div class="absolute bottom-0 left-0 w-full h-[2px]" style="background-color: var(--accent-color)" in:fade={{ duration: 200 }}></div>
					{/if}
				</button>
			{/each}
		</nav>

		<!-- Content -->
		<div class="w-full min-h-[250px] pb-24">
			{#if activeTab === 'about'}
				<div class="space-y-10 animate-in fade-in duration-500" in:fly={{ y: 10, duration: 400, delay: 100 }}>
					<!-- Rumi Section -->
					<div class="pb-10 relative group/quote text-center md:text-left">
						<div class="flex justify-end items-center mb-4">
							<div class="flex gap-2 items-center">
								<button 
									onclick={prevQuote} 
									class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
									style="border-color: var(--accent-color); color: var(--accent-color);"
								>
									← Prev
								</button>
								<span class="text-[7px] text-slate-500 font-bold uppercase tracking-widest px-2">
									{currentQuoteIndex + 1} / {scrapedQuotes.length}
								</span>
								<button 
									onclick={nextQuote} 
									class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
									style="border-color: var(--accent-color); color: var(--accent-color);"
								>
									Next →
								</button>
							</div>
						</div>
						<div class="space-y-3 min-h-[4rem]">
							<p class="text-lg md:text-xl font-bold leading-snug text-slate-200 font-space italic">
								"{quote.text}"
							</p>
							<p class="text-[9px] font-black uppercase tracking-widest text-slate-500/70">— {quote.author}</p>
						</div>
					</div>

					<div class="space-y-6 pt-6 border-t border-slate-800">
						<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-500">Connect</h2>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
							{#each contacts as contact}
								<div class="flex flex-col group/item">
									<span class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 group-hover/item:text-slate-300 transition-colors">{contact.label}</span>
									{#if contact.link}
										<a href={contact.link} target="_blank" class="text-sm font-bold text-white hover:text-slate-300 active:text-slate-300 transition-colors w-fit break-all font-space">
											{contact.value}
										</a>
									{:else}
										<span class="text-sm font-bold text-white break-all font-space">{contact.value}</span>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>
			{:else if activeTab === 'humor'}
				<div class="animate-in fade-in duration-700" in:fly={{ y: 10, duration: 400, delay: 100 }}>
					{#if HumorSectionComponent}
						<HumorSectionComponent bind:meme bind:joke {fetchMeme} {fetchJoke} />
					{:else}
						<div class="py-20 text-center animate-pulse">
							<p class="text-[9px] font-bold text-slate-200 uppercase tracking-widest font-space">Loading Humor...</p>
						</div>
					{/if}
				</div>
			{:else if activeTab === 'words'}
				<div class="animate-in fade-in duration-500" in:fly={{ y: 10, duration: 400, delay: 100 }}>
					{#if WordFinderComponent}
						<WordFinderComponent />
					{:else}
						<div class="py-20 text-center animate-pulse">
							<p class="text-[9px] font-bold text-slate-200 uppercase tracking-widest font-space">Loading Tools...</p>
						</div>
					{/if}
				</div>
			{:else if activeTab === 'game'}
				<div class="animate-in fade-in duration-500" in:fly={{ y: 10, duration: 400, delay: 100 }}>
					{#if SnakeGameComponent}
						<SnakeGameComponent />
					{:else}
						<div class="py-20 text-center animate-pulse">
							<p class="text-[9px] font-bold text-slate-200 uppercase tracking-widest font-space">Initializing Systems...</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<footer class="mt-auto w-full py-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3 text-[8px] font-bold uppercase tracking-widest text-slate-500">
			<div class="flex gap-3">
				<span>&copy; {new Date().getFullYear()} GINKOHUB</span>
				<span>SvelteKit 5.0</span>
			</div>
			<span class="font-medium normal-case">Made with ❤️ by Google Gemini 3 Pro</span>
		</footer>
	</div>
</div>

<style>
	:global(body) {
		background-color: #000000;
		font-family: 'Inter', sans-serif;
		transition: background-color 0.5s ease;
	}

	.font-space {
		font-family: 'Space Grotesk', sans-serif;
	}

	@keyframes glow-expand {
		0% { transform: scale(0.8); opacity: 0; }
		30% { transform: scale(1.1); opacity: 1; }
		100% { transform: scale(1.6); opacity: 0; }
	}

	@keyframes ripple {
		0% { transform: scale(1); opacity: 1; border-width: 4px; }
		100% { transform: scale(2.2); opacity: 0; border-width: 1px; }
	}

	.animate-glow-expand {
		animation: glow-expand 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.animate-ripple {
		animation: ripple 2s cubic-bezier(0, 0, 0.2, 1) forwards;
	}
</style>