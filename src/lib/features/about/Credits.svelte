<script>
	const credits = [
		{ label: 'AI API', name: 'Siputzx', url: 'https://siputzx.my.id' },
		{ label: 'Crypto Data', name: 'Binance', url: 'https://binance.com' },
		{ label: 'Quran API', name: 'Al-Quran Cloud', url: 'https://alquran.cloud' },
		{ label: 'Meme API', name: 'meme-api', url: 'https://meme-api.com' },
		{ label: 'GitHub API', name: 'GitHub', url: 'https://docs.github.com/en/rest' },
		{ label: 'AI Models', name: 'Hugging Face', url: 'https://huggingface.co' }
	];

	const contributors = [
		{ name: 'ginkohub', url: 'https://github.com/ginkohub', role: 'Creator & Developer' },
		{ name: 'Gemini', url: 'https://geminicli.com', role: 'AI Assistant' },
		{ name: 'Opencode', url: 'https://opencode.ai', role: 'AI Assistant' },
		{ name: 'Antigravity', url: 'https://antigravity.google', role: 'AI CLI' },
		{ name: 'Qwen-Code', url: 'https://qwen.ai/qwencode', role: 'AI Code Model' },
		{ name: 'Contributors', url: 'https://github.com/ginkohub/ginkohub.github.io/graphs/contributors', role: 'Open Source' }
	];
</script>

<div class="space-y-6 pt-6">
	<h2 class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Credits</h2>
	<div class="grid grid-cols-2 gap-1">
		{#each credits as c}
			<div class="flex flex-col p-4 bg-white/5 border border-white/5">
				<span class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">{c.label}</span>
				<span class="text-md font-serif italic text-slate-300">
					<a href={c.url} target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors underline underline-offset-2 decoration-slate-600">{c.name}</a>
				</span>
			</div>
		{/each}
	</div>
	<h2 class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 pt-6">Contributors</h2>
	<div class="grid grid-cols-2 gap-1">
		{#each contributors as c}
			<div class="flex flex-col p-4 bg-white/5 border border-white/5">
				<span class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">{c.role}</span>
				<span class="text-md font-serif italic text-slate-300">
					<a href={c.url} target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors underline underline-offset-2 decoration-slate-600">{c.name}</a>
				</span>
			</div>
		{/each}
	</div>
</div>
