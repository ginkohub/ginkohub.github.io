<script>
	let { accentColor } = $props();

	let models = $state([]);
	let loading = $state(false);
	let error = $state('');
	let sortBy = $state('likes'); // 'likes' or 'downloads'

	async function fetchLeaderboard() {
		loading = true;
		error = '';
		models = [];

		try {
			// Hugging Face API
			const params = new URLSearchParams({
				sort: sortBy,
				direction: '-1',
				limit: '10',
				filter: 'text-generation',
				full: 'true' // Get more details like card data
			});

			const response = await fetch(`https://huggingface.co/api/models?${params.toString()}`);
			
			if (!response.ok) {
				throw new Error(`Status: ${response.status}`);
			}

			const data = await response.json();

			models = data.map((model) => ({
				id: model.id, // "meta-llama/Llama-2-7b"
				name: model.modelId || model.id,
				author: model.author || model.id.split('/')[0],
				likes: model.likes,
				downloads: model.downloads,
				lastModified: new Date(model.lastModified).toLocaleDateString(),
				pipeline: model.pipeline_tag,
				url: `https://huggingface.co/${model.id}`
			}));

		} catch (e) {
			error = 'Failed to retrieve neural metrics.';
			console.error('HF API Error:', e);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		sortBy;
		fetchLeaderboard();
	});

	function formatNumber(num) {
		return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
	}
</script>

<div class="space-y-8 pt-12 border-t border-slate-800/50">
	<header class="flex flex-col md:flex-row justify-between items-center gap-4">
		<div class="flex items-center gap-4">
			<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
				Neural Leaderboard
			</h2>
			<div class="flex border border-slate-800 p-0.5">
				<button
					onclick={() => (sortBy = 'likes')}
					class="px-2 py-1 text-[7px] font-black uppercase transition-all {sortBy === 'likes'
						? 'bg-white text-black'
						: 'text-slate-500 hover:text-slate-300'}"
				>
					Most Liked
				</button>
				<button
					onclick={() => (sortBy = 'downloads')}
					class="px-2 py-1 text-[7px] font-black uppercase transition-all {sortBy === 'downloads'
						? 'bg-white text-black'
						: 'text-slate-500 hover:text-slate-300'}"
				>
					Most Used
				</button>
				<button
					onclick={() => (sortBy = 'lastModified')}
					class="px-2 py-1 text-[7px] font-black uppercase transition-all {sortBy === 'lastModified'
						? 'bg-white text-black'
						: 'text-slate-500 hover:text-slate-300'}"
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
		{#if loading}
			<div class="space-y-1">
				{#each Array(10) as _}
					<div class="h-16 bg-slate-900/50 animate-pulse border-b border-slate-800/50"></div>
				{/each}
			</div>
		{:else if error}
			<div class="flex items-center justify-center h-40 border border-rose-900/30 bg-rose-950/10">
				<span class="text-[9px] font-black uppercase text-rose-500 tracking-widest">{error}</span>
			</div>
		{:else}
			<div class="border border-slate-800 bg-black">
				<!-- Header Row -->
				<div class="grid grid-cols-12 gap-2 p-3 border-b border-slate-800 text-[7px] font-black uppercase tracking-widest text-slate-500">
					<div class="col-span-1 text-center">#</div>
					<div class="col-span-7">Model</div>
					<div class="col-span-2 text-right">Likes</div>
					<div class="col-span-2 text-right">DLs</div>
				</div>

				{#each models as model, index}
					<a
						href={model.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group grid grid-cols-12 gap-2 p-3 border-b border-slate-800 last:border-0 hover:bg-slate-900/50 transition-all items-center"
					>
						<!-- Rank -->
						<div class="col-span-1 text-center">
							<span class="text-xs font-black font-space" style="color: {index < 3 ? accentColor : '#64748b'}">
								{index + 1}
							</span>
						</div>

						<!-- Model Info -->
						<div class="col-span-7 flex items-center gap-3">
							<!-- Author Logo -->
							<div class="flex-shrink-0 w-8 h-8 border border-slate-800 bg-slate-900 overflow-hidden rounded">
								<img 
									src="https://github.com/{model.author}.png" 
									alt="{model.author}"
									class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
									onerror={(e) => e.target.style.display = 'none'} 
								/>
							</div>
							
							<div class="flex flex-col justify-center min-w-0">
								<div class="flex items-center gap-2 mb-0.5">
									<span class="text-[8px] font-bold text-slate-400 uppercase truncate">{model.author} /</span>
								</div>
								<h3 class="text-sm font-bold text-slate-200 group-hover:text-white group-hover:underline transition-colors font-space truncate">
									{model.name.split('/').pop()}
								</h3>
								<div class="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<span class="text-[7px] font-black uppercase text-slate-600 bg-slate-900 px-1 rounded">
										{model.pipeline}
									</span>
									<span class="text-[7px] text-slate-600">{model.lastModified}</span>
								</div>
							</div>
						</div>

						<!-- Metrics -->
						<div class="col-span-2 text-right">
							<span class="text-xs font-bold text-slate-300 font-space">
								{formatNumber(model.likes)}
							</span>
						</div>
						<div class="col-span-2 text-right">
							<span class="text-xs font-bold text-slate-500 font-space group-hover:text-slate-300">
								{formatNumber(model.downloads)}
							</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
