<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import CyberBackground from '$lib/components/effects/CyberBackground.svelte';
	import assetsData from '$lib/data/assets.json';

	const assets = assetsData;
	const glitchChars = '!<>-_\\/[]{}—=+*^?#';
	let glitchText = $state('');
	let interval;
	let mouseX = $state(0);
	let mouseY = $state(0);
	let selectedBg = $state('');

	onMount(() => {
		const allBgs = Object.values(assets.backgrounds).flat();
		selectedBg = allBgs[Math.floor(Math.random() * allBgs.length)];
		mouseX = window.innerWidth / 2;
		mouseY = window.innerHeight / 2;
		function onMove(e) {
			mouseX = e.clientX;
			mouseY = e.clientY;
		}
		window.addEventListener('mousemove', onMove);
		return () => window.removeEventListener('mousemove', onMove);
	});

	$effect(() => {
		const code = String(page.status);
		interval = setInterval(() => {
			let result = '';
			for (let i = 0; i < code.length; i++) {
				if (Math.random() > 0.6) {
					result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
				} else {
					result += code[i];
				}
			}
			glitchText = result;
		}, 80);
		return () => clearInterval(interval);
	});

	const errorMessages = {
		400: 'bad request',
		401: 'unauthorized',
		403: 'forbidden',
		404: 'not found',
		405: 'method not allowed',
		408: 'request timeout',
		429: 'too many requests',
		500: 'internal server error',
		502: 'bad gateway',
		503: 'service unavailable'
	};

	const message = $derived(errorMessages[page.status] || page.error?.message || 'unknown error');
</script>

<svelte:head>
	<title>{page.status} — GinkoHub</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<CyberBackground {selectedBg} showAura={false} {mouseX} {mouseY} />

<div
	class="min-h-screen text-slate-100 font-inter flex items-center justify-center p-6 relative z-10"
>
	<div class="text-center max-w-md">
		<div class="font-space-grotesk text-[10px] tracking-[0.3em] uppercase text-slate-500 mb-8">
			error
		</div>

		<div
			class="text-[120px] font-bold leading-none font-space-grotesk tracking-tight mb-4 text-slate-100/10 select-none"
		>
			{glitchText || page.status}
		</div>

		<div class="text-sm font-mono text-slate-400 tracking-[0.15em] uppercase mb-2">
			{message}
		</div>

		<div class="w-12 h-px bg-slate-700 mx-auto my-8"></div>

		<div class="text-xs text-slate-500 font-mono leading-relaxed max-w-xs mx-auto">
			the page you're looking for doesn't exist or has been moved.
		</div>

		<button
			onclick={() => goto('/', { replaceState: true })}
			class="mt-10 px-6 py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase border border-slate-700 border-b-2 border-b-[#10b981] text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:border-slate-500 transition-all duration-300 cursor-pointer"
		>
			← return home
		</button>
	</div>
</div>

<style>
	:global(body) {
		background-color: #000000;
		font-family: 'Inter', sans-serif;
	}
</style>
