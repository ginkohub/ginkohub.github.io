<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	
	let { data } = $props(); 
	
	// Modular Tab System
	const tabModules = import.meta.glob('$lib/tabs/*.svelte', { eager: true });
	const tabs = Object.entries(tabModules).map(([path, module]) => {
		const label = path.split('/').pop().replace('.svelte', '').toLowerCase();
		return {
			label,
			component: module.default
		};
	}).sort((a, b) => {
		if (a.label === 'about') return -1;
		if (b.label === 'about') return 1;
		if (a.label === 'game') return 1;
		if (b.label === 'game') return -1;
		return a.label.localeCompare(b.label);
	});

	let activeTabLabel = $state('about');
	let ActiveTabComponent = $derived(tabs.find(t => t.label === activeTabLabel)?.component);

	let persona = $state('Internet Surfer');
	let meme = $state({ url: '', title: '', loading: false });
	let joke = $state({ setup: '', punchline: '', loading: false });
	let showAura = $state(false);
	
	// Expanded Background Library (20 Images)
	const backgrounds = [
		'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1434725039720-aaad6dd32dee?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1475924156734-496f6acc6716?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80',
		'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1920&q=80'
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
				id="main-bg-image"
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
				class="text-[9px] font-bold text-slate-300 uppercase tracking-widest hover:text-white active:text-white transition-colors cursor-pointer select-none"
				title="Click to shuffle"
			>
				{persona} ↻
			</button>
		</header>

		<!-- Modular Navigation -->
		<nav class="flex w-full border-b border-slate-800 mb-10 relative">
			{#each tabs as tab}
				<button
					onclick={() => (activeTabLabel = tab.label)}
					class="flex-1 py-3 font-bold uppercase tracking-widest text-[9px] transition-colors duration-300 relative active:bg-slate-900
                    {activeTabLabel === tab.label ? 'text-white' : 'text-slate-400 hover:text-slate-200'}"
				>
					{tab.label}
					{#if activeTabLabel === tab.label}
						<div class="absolute bottom-0 left-0 w-full h-[2px]" style="background-color: var(--accent-color)" in:fade={{ duration: 200 }}></div>
					{/if}
				</button>
			{/each}
		</nav>

		<!-- Dynamic Content -->
		<div class="w-full min-h-[250px] pb-24">
			{#if ActiveTabComponent}
				<ActiveTabComponent 
					{data} 
					{meme} 
					{joke} 
					{fetchMeme} 
					{fetchJoke} 
					{scrapedQuotes} 
					{currentQuoteIndex} 
					{quote} 
					{prevQuote} 
					{nextQuote} 
					{contacts} 
					accentColor={currentAccent.hex}
					bgImage={selectedBg}
				/>
			{/if}
		</div>

		<!-- Footer -->
		<footer class="mt-auto w-full py-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3 text-[8px] font-bold uppercase tracking-widest text-slate-400">
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