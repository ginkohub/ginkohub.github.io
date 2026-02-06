<script>
	let { accentColor } = $props();

	let inputUrl = $state('https://ginkohub.github.io');
	let isLoading = $state(false);
	
	let metadata = $state({
		title: 'GinkoHub • Cyber Flâneur | Poetic Digital Portfolio',
		description: "Explore GinkoHub: A minimalist collection of digital experiments, Rumi's poetic wisdom, and interactive arcade games.",
		image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=630&q=80',
		url: 'ginkohub.github.io'
	});

	async function fetchMetadata() {
		if (!inputUrl) return;
		isLoading = true;
		
		try {
			// Using microlink.io free tier for client-side metadata fetching
			const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(inputUrl)}`);
			const result = await response.json();
			
			if (result.status === 'success') {
				const data = result.data;
				metadata = {
					title: data.title || 'No title found',
					description: data.description || 'No description found',
					image: data.image?.url || data.logo?.url || '',
					url: new URL(inputUrl).hostname
				};
			}
		} catch (e) {
			console.error("Failed to fetch metadata", e);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-12">
	<!-- URL Input Section -->
	<div class="bg-slate-900/30 border border-slate-800 p-6 space-y-6">
		<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Link Previewer</h2>
		
		<div class="flex flex-col md:flex-row gap-3">
			<input 
				bind:value={inputUrl} 
				placeholder="Enter any URL (e.g. https://google.com)"
				class="flex-1 bg-black border border-slate-800 p-3 text-sm focus:border-white transition-colors outline-none font-space"
			/>
			<button 
				onclick={fetchMetadata}
				disabled={isLoading}
				class="px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
				style="background-color: {accentColor}; color: #000;"
			>
				{isLoading ? 'Fetching...' : 'Preview Link'}
			</button>
		</div>
		<p class="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">Enter a URL to see how it appears on social media</p>
	</div>

	<!-- Previews Section -->
	<div class="space-y-10 {isLoading ? 'opacity-20 pointer-events-none' : 'opacity-100'} transition-opacity duration-300">
		<!-- X (Twitter) Preview -->
		<div class="space-y-4">
			<h3 class="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
				<span>𝕏</span> Twitter Card (Large)
			</h3>
			<div class="max-w-[500px] bg-black border border-slate-800 rounded-xl overflow-hidden font-sans">
				<div class="aspect-[1.91/1] w-full bg-slate-900 overflow-hidden border-b border-slate-800">
					{#if metadata.image}
						<img src={metadata.image} alt="Preview" class="w-full h-full object-cover" />
					{:else}
						<div class="w-full h-full flex items-center justify-center text-slate-800 text-[10px] font-black uppercase tracking-widest">No Image Asset</div>
					{/if}
				</div>
				<div class="p-3 space-y-1">
					<p class="text-[11px] text-slate-500 uppercase">{metadata.url}</p>
					<p class="text-[14px] font-bold text-slate-100 line-clamp-1">{metadata.title}</p>
					<p class="text-[14px] text-slate-400 line-clamp-2 leading-snug">{metadata.description}</p>
				</div>
			</div>
		</div>

		<!-- Discord Style -->
		<div class="space-y-4">
			<h3 class="text-[9px] font-black uppercase tracking-widest text-slate-500">
				Discord Rich Embed
			</h3>
			<div class="max-w-[400px] bg-[#2b2d31] border-l-4 p-4 space-y-3" style="border-color: {accentColor}">
				<p class="text-[#00a8fc] text-[14px] font-bold hover:underline cursor-pointer">{metadata.title}</p>
				<p class="text-[#dbdee1] text-[14px] leading-snug">{metadata.description}</p>
				{#if metadata.image}
					<div class="rounded-md overflow-hidden bg-black border border-white/5 shadow-2xl">
						<img src={metadata.image} alt="Preview" class="w-full h-auto" />
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>