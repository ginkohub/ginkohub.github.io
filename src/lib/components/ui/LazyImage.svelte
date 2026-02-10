<script>
	let {
		src,
		alt = '',
		class: className = '',
		fallbackText = '?',
		aspectRatio = 'aspect-square'
	} = $props();

	let loaded = $state(false);
	let error = $state(false);

	function handleLoad() {
		loaded = true;
	}

	function handleError() {
		error = true;
		loaded = true;
	}
</script>

<div class="relative overflow-hidden bg-white/5 {aspectRatio} {className}">
	{#if !loaded && !error}
		<!-- Loading Placeholder (Shimmer) -->
		<div
			class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
		></div>
	{/if}

	{#if error}
		<!-- Error Fallback -->
		<div
			class="absolute inset-0 flex items-center justify-center bg-slate-900 text-[10px] font-black uppercase text-slate-600"
		>
			{fallbackText}
		</div>
	{:else}
		<img
			{src}
			{alt}
			loading="lazy"
			class="w-full h-full object-cover transition-opacity duration-700 {loaded
				? 'opacity-100'
				: 'opacity-0'}"
			onload={handleLoad}
			onerror={handleError}
		/>
	{/if}
</div>

<style>
	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
	.animate-shimmer {
		animation: shimmer 1.5s infinite;
	}
</style>
