<script>
	import { appState } from '$lib/state/appState.svelte';
	import { i18n } from '$lib/state/i18n.svelte';
	import { fly } from 'svelte/transition';

	let { fireworksSystem } = $props();

	function handleLogoClick() {
		appState.addStrike(fireworksSystem);
	}
</script>

<div class="group perspective relative select-none">
	{#if appState.showAura}
		<div
			class="absolute inset-0 rounded-full blur-2xl animate-glow-expand pointer-events-none"
			style="background-color: var(--accent-color); opacity: 0.3;"
		></div>
		<div
			class="absolute inset-0 rounded-full border-2 animate-ripple pointer-events-none"
			style="border-color: var(--accent-color); opacity: 0.2;"
		></div>
	{/if}

	{#if appState.showCombo && appState.comboCount > 1}
		<div
			class="absolute top-[-20%] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap font-black italic tracking-tighter pointer-events-none md:top-0 md:left-auto md:-right-12 md:translate-x-0"
			style="color: var(--accent-color); font-size: {Math.min(
				14 + appState.comboCount,
				32
			)}px; filter: drop-shadow(0 0 10px var(--accent-color));"
			in:fly={{ y: 10, duration: 150 }}
		>
			{appState.isOverloaded ? 'SYSTEM OVERLOAD' : `x${appState.comboCount} STRIKE`}
		</div>
	{/if}

	<button
		onclick={handleLogoClick}
		class="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden transition-all duration-75 ease-out group-hover:scale-105 active:scale-90 z-10 block touch-manipulation"
		style="transform: scale({appState.comboScale})"
		title="Click to trigger aura and shuffle persona"
	>
		<img
			src="https://github.com/ginkohub.png"
			alt="GinkoHub Profile"
			class="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 active:grayscale-0 scale-125 {appState.showAura
				? 'grayscale-0'
				: ''}"
			onerror={(e) => (e.currentTarget.style.display = 'none')}
		/>
	</button>
</div>

<!-- Identity -->
<header class="text-center">
	<h1
		class="text-2xl font-bold tracking-tight text-white mb-1 font-space active:scale-95 transition-transform {appState.isGlitching
			? 'animate-glitch'
			: ''}"
	>
		GinkoHub
	</h1>
	<button
		onclick={() => {
			if (!appState.showAura) {
				appState.triggerAura();
				appState.shufflePersona();
				appState.shuffleAccent();
			}
		}}
		class="text-[9px] font-bold text-slate-300 uppercase tracking-widest hover:text-white active:text-white transition-colors cursor-pointer select-none {appState.isGlitching
			? 'animate-glitch'
			: ''}"
		title="Click to shuffle"
	>
		{appState.persona} ↻
	</button>

	<div class="mt-2 flex flex-col items-center gap-2">
		<!-- Theme Strip -->
		<div class="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
			{#each appState.accents as accent}
				<button
					class="w-2.5 h-2.5 rounded-full transition-all hover:scale-125 border {appState
						.currentAccent.name === accent.name
						? 'border-white'
						: 'border-transparent'}"
					style="background-color: {accent.hex}"
					onclick={() => appState.setAccent(accent)}
					title={accent.name}
				></button>
			{/each}

			<div class="w-px h-3 bg-white/10 mx-1"></div>

			<!-- Color Picker -->
			<div class="relative w-3 h-3 group/picker">
				<input
					type="color"
					value={appState.currentAccent.hex}
					oninput={(e) => appState.setAccent({ name: 'custom', hex: e.target.value })}
					class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
					title="Custom Color Picker"
				/>
				<div
					class="w-full h-full rounded-full border border-white/20 group-hover/picker:border-white/50 transition-colors"
					style="background-color: {appState.currentAccent.hex}"
				></div>
			</div>
		</div>

		<!-- Language -->
		<div class="flex justify-center gap-3">
			<button
				onclick={() => i18n.setLang('en')}
				class="text-[16px] transition-all hover:scale-110 {i18n.lang === 'en'
					? 'filter-none grayscale-0 opacity-100'
					: 'grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}"
				title="English"
			>
				🇬🇧
			</button>
			<button
				onclick={() => i18n.setLang('id')}
				class="text-[16px] transition-all hover:scale-110 {i18n.lang === 'id'
					? 'filter-none grayscale-0 opacity-100'
					: 'grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}"
				title="Bahasa Indonesia"
			>
				🇮🇩
			</button>
		</div>
	</div>
</header>

<style>
	.font-space {
		font-family: 'Space Grotesk', sans-serif;
	}
	.touch-manipulation {
		touch-action: manipulation;
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
</style>
