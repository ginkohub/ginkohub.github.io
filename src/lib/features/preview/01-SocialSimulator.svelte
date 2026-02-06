<script>
	let { accentColor } = $props();

	let previewTitle = $state('GinkoHub • Cyber Flâneur | Poetic Digital Portfolio');
	let previewDesc = $state("Explore GinkoHub: A minimalist collection of digital experiments, Rumi's poetic wisdom, and interactive arcade games.");
	let previewImg = $state('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=630&q=80');
	let siteUrl = $state('ginkohub.github.io');

	function resetToCurrent() {
		previewTitle = 'GinkoHub • Cyber Flâneur | Poetic Digital Portfolio';
		previewDesc = "Explore GinkoHub: A minimalist collection of digital experiments, Rumi's poetic wisdom, and interactive arcade games.";
		previewImg = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=630&q=80';
	}
</script>

<div class="space-y-12">
	<!-- Editor Section -->
	<div class="bg-slate-900/30 border border-slate-800 p-6 space-y-6">
		<div class="flex justify-between items-center">
			<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Metadata Editor</h2>
			<button onclick={resetToCurrent} class="text-[8px] font-bold text-slate-400 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-white transition-all">Reset to Site Defaults</button>
		</div>

		<div class="grid grid-cols-1 gap-4">
			<div class="space-y-1">
				<label class="text-[8px] font-bold text-slate-500 uppercase">Title ({previewTitle.length} chars)</label>
				<input bind:value={previewTitle} class="w-full bg-black border border-slate-800 p-3 text-sm focus:border-white transition-colors outline-none font-space" />
			</div>
			<div class="space-y-1">
				<label class="text-[8px] font-bold text-slate-500 uppercase">Description ({previewDesc.length} chars)</label>
				<textarea bind:value={previewDesc} rows="2" class="w-full bg-black border border-slate-800 p-3 text-sm focus:border-white transition-colors outline-none"></textarea>
			</div>
			<div class="space-y-1">
				<label class="text-[8px] font-bold text-slate-500 uppercase">Image URL</label>
				<input bind:value={previewImg} class="w-full bg-black border border-slate-800 p-3 text-sm focus:border-white transition-colors outline-none font-mono text-[10px]" />
			</div>
		</div>
	</div>

	<!-- Previews Section -->
	<div class="space-y-10">
		<!-- X (Twitter) Preview -->
		<div class="space-y-4">
			<h3 class="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
				<span>𝕏</span> Twitter Card (Large)
			</h3>
			<div class="max-w-[500px] bg-black border border-slate-800 rounded-xl overflow-hidden font-sans">
				<div class="aspect-[1.91/1] w-full bg-slate-900 overflow-hidden border-b border-slate-800">
					<img src={previewImg} alt="Preview" class="w-full h-full object-cover" />
				</div>
				<div class="p-3 space-y-1">
					<p class="text-[11px] text-slate-500 uppercase">{siteUrl}</p>
					<p class="text-[14px] font-bold text-slate-100 line-clamp-1">{previewTitle}</p>
					<p class="text-[14px] text-slate-400 line-clamp-2 leading-snug">{previewDesc}</p>
				</div>
			</div>
		</div>

		<!-- Discord/Slack/FB Style -->
		<div class="space-y-4">
			<h3 class="text-[9px] font-black uppercase tracking-widest text-slate-500">
				OG Rich Embed (Discord/Facebook)
			</h3>
			<div class="max-w-[400px] bg-[#2b2d31] border-l-4 p-4 space-y-3" style="border-color: {accentColor}">
				<p class="text-[#00a8fc] text-[14px] font-bold hover:underline cursor-pointer">{previewTitle}</p>
				<p class="text-[#dbdee1] text-[14px] leading-snug">{previewDesc}</p>
				<div class="rounded-md overflow-hidden bg-black border border-white/5 shadow-2xl">
					<img src={previewImg} alt="Preview" class="w-full h-auto" />
				</div>
			</div>
		</div>
	</div>
</div>
