<script>
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import FooterMetrics from '$lib/components/FooterMetrics.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import MainHeader from '$lib/components/ui/MainHeader.svelte';
	import Navigation from '$lib/components/ui/Navigation.svelte';
	import KeyboardManager from '$lib/components/ui/KeyboardManager.svelte';
	import DeferredLoader from '$lib/components/DeferredLoader.svelte';

	import { getHandlers } from '$lib/ai/tools.js';
	import { initWatchdog } from '$lib/services/watchdog.js';
	import { appState } from '$lib/state/appState.svelte';
	import { contextManager } from '$lib/state/context.svelte';
	import { wisdomState } from '$lib/features/wisdom/wisdomState.svelte';
	import { i18n } from '$lib/state/i18n.svelte';

	let { data } = $props();

	// Modular Tab System (Lazy Loaded)
	const tabModules = import.meta.glob('$lib/tabs/*.svelte');
	const tabDescriptions = {
		intro: 'Warm welcome and digital sanctuary introduction',
		about: 'Connect and system metrics',
		wisdom: 'Poetic wisdom and quote generator',
		github: 'GitHub repository and developer trends',
		tools: 'Utility tools for developers',
		news: 'Tech news and specialized data streams',
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
				description: tabDescriptions[label]
			};
		})
		.sort((a, b) => {
			const order = {
				intro: 0,
				about: 1,
				wisdom: 2,
				github: 3,
				tools: 4,
				news: 5,
				ai: 6,
				humor: 7,
				words: 8,
				preview: 9,
				game: 10
			};
			return (order[a.label] ?? 99) - (order[b.label] ?? 99);
		});

	let ActiveTabComponent = $state(null);

	// Custom System Mount Transition
	function systemMount(node, { duration = 400, delay = 0 }) {
		const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
		if (isMobile) return {}; // Zero overhead on mobile

		return {
			duration,
			delay,
			css: (t) => {
				const eased = 1 - Math.pow(1 - t, 3);
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
		initWatchdog();
		const savedTab = localStorage.getItem('ginkohub_active_tab');
		if (savedTab && tabs.some((t) => t.label === savedTab)) {
			appState.activeTabLabel = savedTab;
		}
		appState.init();
		wisdomState.init(data.quotes);

		window.addEventListener('mousemove', handleMouseMove);

		// Random Identity Glitch
		const glitchInterval = setInterval(() => {
			if (Math.random() > 0.8) {
				appState.isGlitching = true;
				setTimeout(() => (appState.isGlitching = false), 200);
			}
		}, 8000);

		return () => {
			clearInterval(glitchInterval);
			window.removeEventListener('mousemove', handleMouseMove);
		};
	});

	// Persist active tab
	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('ginkohub_active_tab', appState.activeTabLabel);
		}
	});

	// Dynamically load tab component
	$effect(() => {
		const tab = tabs.find((t) => t.label === appState.activeTabLabel);
		if (tab) {
			tab
				.load()
				.then((module) => {
					if (module && module.default) {
						ActiveTabComponent = module.default;
					} else {
						console.warn(`[HMR] Tab module for ${tab.label} loaded but has no default export.`);
					}
				})
				.catch((err) => {
					console.error(`[Tab Load Error] Failed to import ${tab.label}:`, err);
				});
		}
	});

	// Effects System
	let fireworksSystem = $state();
	let sessionStartTime = $state(Date.now());
	let mouseX = $state(0);
	let mouseY = $state(0);

	function handleMouseMove(e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
	}

	const contacts = [
		{ label: 'Email', value: 'ginkohub@gmail.com', icon: '📧', link: 'mailto:ginkohub@gmail.com' },
		{ label: 'GitHub', value: 'ginkohub', icon: '🐙', link: 'https://github.com/ginkohub' },
		{ label: 'Discord', value: 'ginkohub', icon: '🎮' }
	];

	async function handleAiCommand(name, args) {
		const handlers = getHandlers({
			setTab: (t) => (appState.activeTabLabel = t),
			setAccent: (a) => appState.setAccent(a),
			accents: appState.accents,
			fireworks: fireworksSystem,
			tabs
		});
		if (handlers[name]) return await handlers[name](args);
		return 'Unknown command.';
	}
</script>

<KeyboardManager />

<div
	class="min-h-screen bg-black text-slate-100 font-inter p-0 selection:bg-white selection:text-black relative overflow-x-hidden transition-colors duration-500 {appState.isOverloaded
		? 'overload-mode'
		: ''}"
	style="--accent-color: {appState.currentAccent.hex}"
>
	<DeferredLoader
		load={() => import('$lib/components/effects/CyberBackground.svelte')}
		delay={500}
		componentProps={{
			selectedBg: appState.selectedBg,
			showAura: appState.showAura,
			mouseX,
			mouseY,
			accentColor: appState.currentAccent.hex,
			isOverloaded: appState.isOverloaded
		}}
	/>

	<div
		class="relative z-10 w-full min-h-screen {appState.isShaking ? 'animate-shake' : ''}"
		style="will-change: transform;"
	>
		<div class="max-w-xl mx-auto flex flex-col items-center px-6">
			<MainHeader {fireworksSystem} />

			<Navigation {tabs} />

			<!-- Dynamic Content -->
			<div class="w-full min-h-[100px] pb-24">
				{#key appState.activeTabLabel}
					<div in:systemMount={{ duration: 500 }} class="w-full">
						{#if appState.activeTabLabel && tabs.find((t) => t.label === appState.activeTabLabel)?.description}
							<div
								class="text-base text-center mb-6 px-2 text-slate-400 font-mono text-[10px] tracking-[0.2em] uppercase opacity-70"
							>
								[{tabs.find((t) => t.label === appState.activeTabLabel).description}]
							</div>
						{/if}
						{#if ActiveTabComponent}
							<ActiveTabComponent
								{data}
								{contacts}
								accentColor={appState.currentAccent.hex}
								bgImage={appState.selectedBg}
								{sessionStartTime}
							/>
						{/if}
					</div>
				{/key}
			</div>

			<footer
				class="mt-auto w-full py-8 border-t border-slate-800 flex flex-col gap-6 text-[8px] font-bold uppercase tracking-widest text-slate-400"
			>
				<FooterMetrics accentColor={appState.currentAccent.hex} {sessionStartTime} />
				<div
					class="flex flex-col md:flex-row justify-between items-center gap-3 w-full border-t border-slate-800/50 pt-6"
				>
					<div class="flex gap-3">
						<span>{i18n.t('footer.copyright', { year: new Date().getFullYear() })}</span>
						<span>SvelteKit 5.0</span>
					</div>
					<span class="font-medium normal-case">{i18n.t('footer.made_with')}</span>
				</div>
			</footer>
		</div>
	</div>
</div>

<DeferredLoader
	load={() => import('$lib/components/ChatWidget.svelte')}
	delay={1500}
	componentProps={{
		accentColor: appState.currentAccent.hex,
		onCommand: handleAiCommand,
		context: contextManager.aiContext
	}}
/>

<DeferredLoader
	load={() => import('$lib/components/effects/Fireworks.svelte')}
	delay={2000}
	componentProps={{
		accentColor: appState.currentAccent.hex
	}}
	bind:component={fireworksSystem}
/>

<Modal
	bind:show={appState.showOverloadModal}
	title="CRITICAL ERROR"
	message="You broke it man. The system integrity has been compromised by your excessive clicking."
	closeOnOutside={false}
	onConfirm={() => {
		appState.resetCombo();
		appState.isOverloaded = false;
	}}
/>

<style>
	:global(body) {
		background-color: #000000;
		font-family: 'Inter', sans-serif;
		transition: background-color 0.5s ease;
		-webkit-tap-highlight-color: transparent;
	}

	@keyframes shake {
		0%,
		100% {
			transform: translate(0, 0);
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
	}
	.animate-shake {
		animation: shake 0.1s linear;
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
		0%,
		100% {
			opacity: 0.1;
		}
		50% {
			opacity: 0.2;
		}
	}

	/* Disable Monochrome/Grayscale on Mobile only */
	@media (max-width: 768px) {
		:global(.grayscale) {
			filter: none !important;
		}
		:global(.group-hover\:grayscale-0) {
			filter: none !important;
		}
	}
</style>
