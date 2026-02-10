<script>
	import { aiLabState } from './aiLabState.svelte';
	let { accentColor } = $props();

	async function fetchLeaderboard() {
		aiLabState.loading = true;
		aiLabState.error = '';

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		try {
			const params = new URLSearchParams({
				sort: aiLabState.sortBy,
				direction: '-1',
				limit: '10',
				filter: 'text-generation',
				full: 'true'
			});

			const response = await fetch(`https://huggingface.co/api/models?${params.toString()}`, {
				signal: controller.signal
			});
			clearTimeout(timeoutId);

			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const data = await response.json();

			aiLabState.models = data.map((model) => {
				const licenseTag = model.tags
					?.find((t) => t.startsWith('license:'))
					?.replace('license:', '');
				return {
					id: model.id,
					name: model.modelId || model.id,
					author: model.author || model.id.split('/')[0],
					likes: model.likes,
					downloads: model.downloads,
					lastModified: new Date(model.lastModified).toLocaleDateString(),
					pipeline: model.pipeline_tag,
					license: licenseTag || 'Unknown',
					tags: model.tags?.slice(0, 3) || [],
					url: `https://huggingface.co/${model.id}`
				};
			});
		} catch (e) {
			const err = /** @type {any} */ (e);
			clearTimeout(timeoutId);
			aiLabState.error = err.name === 'AbortError' ? 'Timeout' : err.message;
		} finally {
			aiLabState.loading = false;
		}
	}

	$effect(() => {
		aiLabState.sortBy;
		fetchLeaderboard();
	});

	function formatNumber(num) {
		return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(
			num
		);
	}
</script>

<div class="space-y-8 pt-12 border-t border-slate-800/50">
	<header class="flex flex-col md:flex-row justify-between items-center gap-4">
		<div class="flex items-center gap-4">
			<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
				Neural Leaderboard
			</h2>
			{#if aiLabState.loading}
				<div class="flex items-center gap-2 animate-pulse">
					<div
						class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]"
					></div>
					<span class="text-[7px] font-black uppercase tracking-tighter text-slate-500"
						>Syncing...</span
					>
				</div>
			{/if}
			<div class="flex border border-slate-800 p-0.5">
				<button
					onclick={() => aiLabState.setSort('likes')}
					class="px-2 py-1 text-[7px] font-black uppercase transition-all {aiLabState.sortBy ===
					'likes'
						? 'bg-white text-black'
						: 'text-slate-500 hover:text-slate-300'}"
					title="Sort by most liked"
				>
					Most Liked
				</button>
				<button
					onclick={() => aiLabState.setSort('downloads')}
					class="px-2 py-1 text-[7px] font-black uppercase transition-all {aiLabState.sortBy ===
					'downloads'
						? 'bg-white text-black'
						: 'text-slate-500 hover:text-slate-300'}"
					title="Sort by most downloads"
				>
					Most Used
				</button>
				<button
					onclick={() => aiLabState.setSort('lastModified')}
					class="px-2 py-1 text-[7px] font-black uppercase transition-all {aiLabState.sortBy ===
					'lastModified'
						? 'bg-white text-black'
						: 'text-slate-500 hover:text-slate-300'}"
					title="Sort by newest models"
				>
					Newest
				</button>
			</div>
		</div>

		<div class="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
			Source: Hugging Face API
		</div>
	</header>

	<div class="min-h-[400px] relative">
		{#if aiLabState.loading && aiLabState.models.length === 0}
			<div class="flex flex-col items-center justify-center py-20 gap-4">
				<div
					class="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"
					style="border-top-color: {accentColor}"
				></div>
				<span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
					>Retrieving Neural Metrics...</span
				>
			</div>
		{:else if aiLabState.error && aiLabState.models.length === 0}
			<div
				class="flex flex-col items-center justify-center py-20 gap-4 border border-rose-900/30 bg-rose-950/5"
			>
				<div class="text-rose-500 text-2xl">⚠️</div>
				<span class="text-[9px] font-black uppercase text-rose-500 tracking-widest text-center px-4"
					>{aiLabState.error}</span
				>
				<button
					onclick={fetchLeaderboard}
					class="mt-2 text-[8px] font-black uppercase border border-rose-900/50 px-3 py-1 text-rose-500 hover:bg-rose-500 hover:text-black transition-all"
					title="Retry fetching leaderboard data"
				>
					Retry Protocol
				</button>
			</div>
		{:else}
			<div
				class="space-y-1 transition-all duration-500 {aiLabState.loading
					? 'opacity-40 grayscale blur-[1px]'
					: 'opacity-100 grayscale-0 blur-0'}"
			>
				{#if aiLabState.error}
					<div
						class="p-2 mb-4 bg-rose-950/20 border border-rose-900/30 text-center animate-in fade-in slide-in-from-top-1"
					>
						<span class="text-[8px] font-black uppercase text-rose-500 tracking-widest"
							>Neural Error: {aiLabState.error}</span
						>
					</div>
				{/if}
				<!-- Table Header (Compact) -->
				<div
					class="grid grid-cols-12 gap-2 p-2 border-b border-white/10 text-[8px] font-black uppercase tracking-[0.3em] text-slate-400"
				>
					<div class="col-span-1 text-center">RANK</div>
					<div class="col-span-7">NEURAL ENTITY</div>
					<div class="col-span-2 text-right">LIKES</div>
					<div class="col-span-2 text-right">DOWNLOADS</div>
				</div>

				{#each aiLabState.models as model, index}
					<a
						href={model.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group grid grid-cols-12 gap-2 p-3 bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all duration-300 items-center"
						title="View {model.id} on Hugging Face"
					>
						<!-- Rank -->
						<div class="col-span-1 text-center">
							<span
								class="text-sm font-black font-space"
								style="color: {index < 3 ? accentColor : '#64748b'}"
							>
								{index + 1}
							</span>
						</div>

						<!-- Model Info -->
						<div class="col-span-7 flex items-center gap-3">
							<!-- Author Logo (Sharp) -->
							<div
								class="flex-shrink-0 w-8 h-8 border border-white/10 bg-slate-950 overflow-hidden"
							>
								<img
									src="https://cdn-thumbnails.huggingface.co/social-thumbnails/models/{model.id}.png"
									alt={model.author}
									class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
									onerror={(e) => (e.target.style.display = 'none')}
								/>
							</div>

							<div class="flex flex-col justify-center min-w-0">
								<div class="flex items-center gap-2">
									<span class="text-[8px] font-black text-slate-400 uppercase truncate"
										>{model.author} /</span
									>
								</div>
								<h3
									class="text-sm md:text-md font-bold text-slate-200 group-hover:text-white transition-colors font-serif italic truncate"
								>
									{model.name.split('/').pop()}
								</h3>
								<div
									class="flex flex-wrap items-center gap-2 mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity"
								>
									<span
										class="text-[7px] font-black uppercase text-slate-100 bg-white/5 px-1 border border-white/5"
									>
										{model.pipeline}
									</span>
									<span class="text-[7px] font-bold text-emerald-400 uppercase">
										{model.license}
									</span>
									<span class="text-[7px] text-slate-500 font-mono ml-auto hidden md:block"
										>{model.lastModified}</span
									>
								</div>
							</div>
						</div>

						<!-- Metrics -->
						<div class="col-span-2 text-right">
							<span
								class="text-xs font-black text-slate-300 font-space group-hover:text-white transition-colors"
							>
								{formatNumber(model.likes)}
							</span>
						</div>
						<div class="col-span-2 text-right">
							<span
								class="text-xs font-black text-slate-400 font-space group-hover:text-slate-200 transition-colors"
							>
								{formatNumber(model.downloads)}
							</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
