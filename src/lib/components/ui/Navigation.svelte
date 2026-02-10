<script>
	import { appState } from '$lib/state/appState.svelte';
	import { i18n } from '$lib/state/i18n.svelte';
	import { fade } from 'svelte/transition';

	let { tabs } = $props();
</script>

<div class="w-full border-b border-slate-800">
	<!-- Row 1: Primary Content -->
	<nav class="flex flex-wrap justify-center w-full">
		{#each tabs.filter((t) => !['words', 'tools', 'game', 'preview', 'wisdom', 'github', 'ai'].includes(t.label)) as tab, i}
			<button
				onclick={() => {
					appState.activeTabLabel = tab.label;
				}}
				style={appState.isOverloaded
					? `
                    --hang-angle: ${-8 + ((i * 5) % 20)}deg;
                    --swing-speed: ${3 + (i % 3)}s;
                    --swing-delay: ${i * 0.2}s;
                `
					: ''}
				class="min-w-[60px] md:min-w-[70px] px-2 py-2 md:px-3 md:py-1.5 font-black uppercase tracking-widest text-[9px] md:text-[8.5px] transition-all duration-300 relative active:bg-slate-900
                {appState.activeTabLabel === tab.label
					? 'text-white'
					: 'text-slate-400 hover:text-slate-200'}
                {appState.isOverloaded ? 'broken-tab' : ''}"
				title={tab.description}
			>
				{i18n.t('nav.' + tab.label)}
				{#if appState.activeTabLabel === tab.label}
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
		{#each tabs.filter( (t) => ['words', 'tools', 'game', 'preview', 'wisdom', 'github', 'ai'].includes(t.label) ) as tab, i}
			<button
				onclick={() => {
					appState.activeTabLabel = tab.label;
				}}
				style={appState.isOverloaded
					? `
                    --hang-angle: ${5 + ((i * 6) % 15)}deg;
                    --swing-speed: ${2.5 + (i % 4) * 0.5}s;
                    --swing-delay: ${i * 0.15}s;
                `
					: ''}
				class="min-w-[60px] md:min-w-[70px] px-2 py-2 md:px-3 md:py-1.5 font-black uppercase tracking-widest text-[9px] md:text-[8.5px] transition-all duration-300 relative active:bg-slate-900
                {appState.activeTabLabel === tab.label
					? 'text-white'
					: 'text-slate-400 hover:text-slate-200'}
                {appState.isOverloaded ? 'broken-tab' : ''}"
				title={tab.description}
			>
				{i18n.t('nav.' + tab.label)}
				{#if appState.activeTabLabel === tab.label}
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

<style>
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
		0%,
		100% {
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
</style>
