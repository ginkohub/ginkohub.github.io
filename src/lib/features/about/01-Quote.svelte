<script>
	import { fade } from 'svelte/transition';
	let { currentQuoteIndex = $bindable(), quote, prevQuote, nextQuote, scrapedQuotes, accentColor, bgImage } = $props();

	let previewUrl = $state('');
	let showPreview = $state(false);
	let isGenerating = $state(false);
	
	let selectedStyle = $state('minimalist');
	const styles = [
		{ id: 'minimalist', name: 'Minimalist' },
		{ id: 'impact', name: 'Impact' },
		{ id: 'poetic', name: 'Poetic' }
	];

	function copyQuote() {
		const text = `"${quote.text}" — ${quote.author}`;
		navigator.clipboard.writeText(text);
		const btn = document.getElementById('copy-btn');
		const originalText = btn.innerText;
		btn.innerText = 'COPIED!';
		setTimeout(() => btn.innerText = originalText, 2000);
	}

	async function generateImage(download = false) {
		isGenerating = true;
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = 1080;
		canvas.height = 1080;

		if (selectedStyle === 'impact') {
			ctx.fillStyle = accentColor;
			ctx.fillRect(0, 0, 1080, 1080);
		} else {
			const existingImg = document.getElementById('main-bg-image');
			if (existingImg && existingImg.complete) {
				const scale = Math.max(canvas.width / existingImg.naturalWidth, canvas.height / existingImg.naturalHeight);
				const x = (canvas.width / 2) - (existingImg.naturalWidth / 2) * scale;
				const y = (canvas.height / 2) - (existingImg.naturalHeight / 2) * scale;
				ctx.save();
				ctx.filter = selectedStyle === 'poetic' ? 'grayscale(100%) brightness(50%)' : 'grayscale(100%) brightness(35%)';
				ctx.drawImage(existingImg, x, y, existingImg.naturalWidth * scale, existingImg.naturalHeight * scale);
				ctx.restore();
			} else {
				ctx.fillStyle = '#000000';
				ctx.fillRect(0, 0, 1080, 1080);
			}
		}

		if (selectedStyle !== 'impact') {
			const grad = ctx.createLinearGradient(0, 0, 0, 1080);
			grad.addColorStop(0, 'rgba(0,0,0,0.7)');
			grad.addColorStop(0.5, 'transparent');
			grad.addColorStop(1, 'rgba(0,0,0,0.9)');
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, 1080, 1080);
		}

		if (selectedStyle === 'minimalist') {
			ctx.strokeStyle = accentColor;
			ctx.lineWidth = 40;
			ctx.strokeRect(0, 0, 1080, 1080);
			ctx.fillStyle = accentColor;
			ctx.fillRect(100, 100, 80, 4);
		} else if (selectedStyle === 'poetic') {
			ctx.strokeStyle = 'rgba(255,255,255,0.2)';
			ctx.lineWidth = 2;
			ctx.strokeRect(60, 60, 960, 960);
		}

		ctx.textAlign = 'left';
		ctx.fillStyle = selectedStyle === 'impact' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)';
		ctx.font = '900 24px Inter, sans-serif';
		ctx.letterSpacing = '8px';
		if (selectedStyle === 'minimalist') ctx.fillText('GINKOHUB.GITHUB.IO', 200, 115);
		else {
			ctx.textAlign = 'center';
			ctx.fillText('GINKOHUB.GITHUB.IO', 540, 1000);
		}

		ctx.textAlign = 'center';
		ctx.fillStyle = selectedStyle === 'impact' ? '#000000' : '#ffffff';
		let fontSize = selectedStyle === 'impact' ? 84 : 64;
		const fontName = selectedStyle === 'poetic' ? 'serif' : '"Space Grotesk", sans-serif';
		const fontWeight = selectedStyle === 'poetic' ? 'italic' : 'bold italic';
		const fullText = `"${quote.text}"`;
		const maxWidth = 840;
		const maxLines = 8;
		
		function getLines(fs) {
			ctx.font = `${fontWeight} ${fs}px ${fontName}`;
			const words = fullText.split(' ');
			let lines = [];
			let currentLine = '';
			words.forEach(word => {
				let testLine = currentLine + word + ' ';
				if (ctx.measureText(testLine).width > maxWidth) {
					lines.push(currentLine);
					currentLine = word + ' ';
				} else {
					currentLine = testLine;
				}
			});
			lines.push(currentLine);
			return lines;
		}

		let lines = getLines(fontSize);
		while (lines.length > maxLines && fontSize > 32) {
			fontSize -= 4;
			lines = getLines(fontSize);
		}

		const lineHeight = fontSize * 1.2;
		let startY = (1080 / 2) - ((lines.length * lineHeight) / 2);
		lines.forEach((line, i) => {
			ctx.fillText(line.trim(), 540, startY + (i * lineHeight));
		});

		const authorY = Math.min(startY + (lines.length * lineHeight) + 80, 1000);
		ctx.fillStyle = selectedStyle === 'impact' ? 'rgba(0,0,0,0.6)' : accentColor;
		ctx.font = selectedStyle === 'poetic' ? 'italic 32px serif' : 'bold 32px Inter, sans-serif';
		ctx.letterSpacing = '1px';
		ctx.fillText(`— ${quote.author}`, 540, authorY);

		const dataUrl = canvas.toDataURL('image/png');
		isGenerating = false;
		if (download) {
			const link = document.createElement('a');
			link.download = `ginkohub-${selectedStyle}-${Date.now()}.png`;
			link.href = dataUrl;
			link.click();
		} else {
			previewUrl = dataUrl;
			showPreview = true;
		}
	}

	$effect(() => {
		if (showPreview) generateImage(false);
	});
</script>

<div class="pb-10 relative group/quote text-center md:text-left border-b border-slate-800/50 mb-10">
	<div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
		<div class="flex gap-3">
			<button id="copy-btn" onclick={copyQuote} class="text-[8px] font-black uppercase border border-slate-700 px-2 py-1 hover:bg-white hover:text-black transition-all text-slate-300">Copy Text</button>
			<button onclick={() => generateImage(false)} class="text-[8px] font-black uppercase border border-slate-700 px-2 py-1 hover:bg-white hover:text-black transition-all text-slate-300 disabled:opacity-50" disabled={isGenerating}>{isGenerating ? 'GEN...' : 'Save Image'}</button>
		</div>
		<div class="flex gap-2 items-center">
			<button onclick={prevQuote} class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black" style="border-color: {accentColor}; color: {accentColor};">← Prev</button>
			<span class="text-[7px] text-slate-300 font-bold uppercase tracking-widest px-2">{currentQuoteIndex + 1} / {scrapedQuotes.length}</span>
			<button onclick={nextQuote} class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black" style="border-color: {accentColor}; color: {accentColor};">Next →</button>
		</div>
	</div>
	<div class="space-y-3 min-h-[4rem]">
		<p class="text-lg md:text-xl font-bold leading-snug text-slate-200 font-space italic">"{quote.text}"</p>
		<p class="text-[9px] font-black uppercase tracking-widest text-slate-400">— {quote.author}</p>
	</div>
</div>

{#if showPreview}
	<div class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6" onclick={() => showPreview = false} in:fade={{ duration: 250 }}>
		<div class="mb-8 flex gap-2">
			{#each styles as style}
				<button onclick={(e) => { e.stopPropagation(); selectedStyle = style.id; }} class="px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all {selectedStyle === style.id ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:border-white/40'}">{style.name}</button>
			{/each}
		</div>
		<div class="relative w-full max-w-[500px] aspect-square shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden" onclick={(e) => e.stopPropagation()}><img src={previewUrl} alt="Quote Preview" class="w-full h-full object-contain" /></div>
		<div class="mt-10 flex gap-4">
			<button onclick={() => generateImage(true)} class="px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] bg-white text-black hover:invert transition-all active:scale-95">Download PNG</button>
			<button onclick={() => showPreview = false} class="px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] border border-white/20 text-white hover:bg-white/10 transition-all active:scale-95">Close</button>
		</div>
	</div>
{/if}