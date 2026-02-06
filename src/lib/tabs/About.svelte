<script>
	import { fade, fly } from 'svelte/transition';
	let { currentQuoteIndex = $bindable(), quote, prevQuote, nextQuote, scrapedQuotes, contacts, accentColor } = $props();

	function copyQuote() {
		const text = `"${quote.text}" — ${quote.author}`;
		navigator.clipboard.writeText(text);
		
		// Visual feedback
		const btn = document.getElementById('copy-btn');
		const originalText = btn.innerText;
		btn.innerText = 'COPIED!';
		setTimeout(() => btn.innerText = originalText, 2000);
	}

	function downloadAsImage() {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		
		// High res for sharing
		canvas.width = 1080;
		canvas.height = 1080;

		// Background
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, 1080, 1080);

		// Accent accent line
		ctx.fillStyle = accentColor;
		ctx.fillRect(100, 100, 10, 880);

		// Branding
		ctx.fillStyle = 'rgba(255,255,255,0.2)';
		ctx.font = 'bold 24px Inter, sans-serif';
		ctx.letterSpacing = '4px';
		ctx.fillText('GINKOHUB.GITHUB.IO', 140, 125);

		// Quote text wrapping logic
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold italic 56px "Space Grotesk", sans-serif';
		const words = `"${quote.text}"`.split(' ');
		let line = '';
		let y = 300;
		const maxWidth = 800;
		const lineHeight = 75;

		for (let n = 0; n < words.length; n++) {
			let testLine = line + words[n] + ' ';
			let metrics = ctx.measureText(testLine);
			let testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
				ctx.fillText(line, 140, y);
				line = words[n] + ' ';
				y += lineHeight;
			} else {
				line = testLine;
			}
		}
		ctx.fillText(line, 140, y);

		// Author
		ctx.fillStyle = 'rgba(255,255,255,0.5)';
		ctx.font = 'bold 32px Inter, sans-serif';
		ctx.fillText(`— ${quote.author}`, 140, y + 100);

		// Trigger download
		const link = document.createElement('a');
		link.download = `rumi-quote-${Date.now()}.png`;
		link.href = canvas.toDataURL('image/png');
		link.click();
	}
</script>

<div class="space-y-10 animate-in fade-in duration-500" in:fly={{ y: 10, duration: 400, delay: 100 }}>
	<!-- Rumi Section -->
	<div class="pb-10 relative group/quote text-center md:text-left">
		<div class="flex justify-between items-center mb-6">
			<div class="flex gap-3">
				<button 
					id="copy-btn"
					onclick={copyQuote}
					class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all"
				>
					Copy Text
				</button>
				<button 
					onclick={downloadAsImage}
					class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all"
				>
					Save Image
				</button>
			</div>
			<div class="flex gap-2 items-center">
				<button 
					onclick={prevQuote} 
					class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
					style="border-color: var(--accent-color); color: var(--accent-color);"
				>
					← Prev
				</button>
				<span class="text-[7px] text-slate-500 font-bold uppercase tracking-widest px-2">
					{currentQuoteIndex + 1} / {scrapedQuotes.length}
				</span>
				<button 
					onclick={nextQuote} 
					class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
					style="border-color: var(--accent-color); color: var(--accent-color);"
				>
					Next →
				</button>
			</div>
		</div>
		<div class="space-y-3 min-h-[4rem]">
			<p class="text-lg md:text-xl font-bold leading-snug text-slate-200 font-space italic">
				"{quote.text}"
			</p>
			<p class="text-[9px] font-black uppercase tracking-widest text-slate-500/70">— {quote.author}</p>
		</div>
	</div>

	<div class="space-y-6 pt-6 border-t border-slate-800">
		<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-500">Connect</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
			{#each contacts as contact}
				<div class="flex flex-col group/item">
					<span class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 group-hover/item:text-slate-300 transition-colors">{contact.label}</span>
					{#if contact.link}
						<a href={contact.link} target="_blank" class="text-sm font-bold text-white hover:text-slate-300 active:text-slate-300 transition-colors w-fit break-all font-space">
							{contact.value}
						</a>
					{:else}
						<span class="text-sm font-bold text-white break-all font-space">{contact.value}</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>