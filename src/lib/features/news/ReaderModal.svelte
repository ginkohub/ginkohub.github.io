<script>
	import { fade, fly } from 'svelte/transition';
	import { microlinkFetch } from '$lib/fetcher.js';

	let { url, onClose, accentColor } = $props();

	let content = $state(null);
	let loading = $state(true);
	let error = $state('');

	async function loadContent() {
		loading = true;
		error = '';

		// Use Microlink to extract full content
		const result = await microlinkFetch(url, {
			meta: true,
			content: true,
			media: true
		});

		if (result.success) {
			content = result.data;
		} else {
			error = 'Failed to extract content protocol.';
		}
		loading = false;
	}

	$effect(() => {
		if (url) loadContent();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col overflow-y-auto"
	in:fade={{ duration: 300 }}
	onclick={onClose}
>
	<div
		class="w-full max-w-3xl mx-auto min-h-screen bg-black border-x border-slate-800 p-6 md:p-12 relative"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- Toolbar -->
		<div
			class="sticky top-0 bg-black/80 backdrop-blur-md z-10 py-4 mb-8 flex justify-between items-center border-b border-slate-800"
		>
			<button
				onclick={onClose}
				class="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors"
			>
				← RETURN TO STREAM
			</button>
			{#if content?.url}
				<a
					href={content.url}
					target="_blank"
					rel="noopener noreferrer"
					class="text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 border border-slate-800 hover:bg-white hover:text-black transition-all"
				>
					VIEW ORIGINAL
				</a>
			{/if}
		</div>

		{#if loading}
			<div class="space-y-8 animate-pulse">
				<div class="h-10 bg-slate-900 w-3/4"></div>
				<div class="h-64 bg-slate-900 w-full"></div>
				<div class="space-y-4">
					<div class="h-4 bg-slate-900 w-full"></div>
					<div class="h-4 bg-slate-900 w-full"></div>
					<div class="h-4 bg-slate-900 w-5/6"></div>
				</div>
			</div>
		{:else if error}
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<span class="text-[10px] font-black uppercase text-rose-500 mb-4">{error}</span>
				<p class="text-sm text-slate-400 mb-8">This frequency is encrypted or unavailable.</p>
				<a
					href={url}
					target="_blank"
					class="text-[9px] font-black uppercase underline tracking-widest"
					style="color: {accentColor}">Access External Terminal instead</a
				>
			</div>
		{:else}
			<article class="space-y-8 pb-20" in:fly={{ y: 20, duration: 500 }}>
				<header class="space-y-4">
					{#if content.publisher}
						<span
							class="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500"
							style="color: {accentColor}">{content.publisher}</span
						>
					{/if}
					<h1 class="text-2xl md:text-4xl font-bold font-space leading-tight text-white">
						{content.title}
					</h1>
					{#if content.author}
						<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							BY {content.author}
						</p>
					{/if}
				</header>

				{#if content.image?.url}
					<div class="w-full aspect-video overflow-hidden border border-slate-800">
						<img
							src={content.image.url}
							alt={content.title}
							class="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700"
						/>
					</div>
				{/if}

				<div
					class="prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg prose-headings:text-white prose-headings:font-space font-inter"
				>
					{#if content.description}
						<p
							class="font-bold text-xl italic text-slate-200 border-l-2 pl-6"
							style="border-color: {accentColor}"
						>
							{content.description}
						</p>
					{/if}

					<!-- Content body fallback if content.content isn't available but description is -->
					{#if !content.content && !content.description}
						<div class="py-10 text-center border border-slate-800">
							<p class="text-xs uppercase tracking-widest text-slate-500 mb-4">
								Content extraction failed
							</p>
							<a href={url} target="_blank" class="text-xs font-bold text-white underline"
								>Read on source site</a
							>
						</div>
					{/if}
				</div>
			</article>
		{/if}
	</div>
</div>

<style>
	/* Subtle transition for the article image */
	img {
		opacity: 0;
		animation: reveal 1s forwards;
	}
	@keyframes reveal {
		to {
			opacity: 1;
		}
	}
</style>
