<script>
	import { fade } from 'svelte/transition';

	let { selectedBg, showAura, mouseX, mouseY, accentColor, isOverloaded = false } = $props();
</script>

<!-- Stable Background -->
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
	<div
		class="absolute inset-0 z-10 pointer-events-none opacity-[0.03] bg-scanline hidden md:block"
	></div>

	<!-- Interactive Grid -->
	<div
		class="absolute inset-0 z-0 opacity-[0.15] pointer-events-none transition-opacity duration-300 hidden md:block"
		style="
			background-image: radial-gradient({showAura ? 'var(--accent-color)' : '#fff'} 1px, transparent 1px);
			background-size: 24px 24px;
			mask-image: radial-gradient(circle 400px at {mouseX}px {mouseY}px, black 0%, transparent 100%);
			-webkit-mask-image: radial-gradient(circle 400px at {mouseX}px {mouseY}px, black 0%, transparent 100%);
		"
	></div>

	<!-- Static Grid for Mobile (Lighter) -->
	<div
		class="absolute inset-0 z-0 opacity-[0.05] pointer-events-none md:hidden"
		style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 24px 24px;"
	></div>

	<!-- Base Grid (fainter) -->
	<div
		class="absolute inset-0 z-[-1] opacity-[0.03] pointer-events-none hidden md:block"
		style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 24px 24px;"
	></div>

	<div class="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/40"></div>
</div>

<style>
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
</style>
