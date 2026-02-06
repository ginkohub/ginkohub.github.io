<script>
	import { fade } from 'svelte/transition';
	let { currentQuoteIndex = $bindable(), quote, prevQuote, nextQuote, scrapedQuotes, contacts, accentColor, bgImage } = $props();

	let previewUrl = $state('');
	let showPreview = $state(false);
	let isGenerating = $state(false);
	let canShare = $state(false);
	let customBg = $state(null);
	
	let selectedStyle = $state('minimalist');
	let selectedFont = $state('sans');
	
	const styles = [
		{ id: 'minimalist', name: 'Minimal' },
		{ id: 'impact', name: 'Impact' },
		{ id: 'poetic', name: 'Poetic' },
		{ id: 'cyber', name: 'Cyber' },
		{ id: 'glass', name: 'Glass' }
	];

	const fonts = [
		{ id: 'sans', name: 'Inter', css: 'Inter' },
		{ id: 'display', name: 'Grotesk', css: '"Space Grotesk"' },
		{ id: 'serif', name: 'Serif', css: 'serif' },
		{ id: 'mono', name: 'Mono', css: 'monospace' }
	];

	function copyQuote() {
		const text = `"${quote.text}" — ${quote.author}`;
		navigator.clipboard.writeText(text);
		const btn = document.getElementById('copy-btn');
		const originalText = btn.innerText;
		btn.innerText = 'COPIED!';
		setTimeout(() => btn.innerText = originalText, 2000);
	}

	function handleFileUpload(e) {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				customBg = event.target.result;
			};
			reader.readAsDataURL(file);
		}
	}

	async function generateImage(download = false) {
		isGenerating = true;
		
		const font = fonts.find(f => f.id === selectedFont);
		try {
			await document.fonts.load(`bold italic 64px ${font.css}`);
		} catch(e) {}

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = 1080;
		canvas.height = 1080;

		const currentBg = customBg || bgImage;

		if (selectedStyle === 'impact') {
			ctx.fillStyle = accentColor;
			ctx.fillRect(0, 0, 1080, 1080);
		} else {
			const existingImg = document.getElementById('main-bg-image');
			if (currentBg) {
				try {
					const img = new Image();
					if (!customBg) img.crossOrigin = "anonymous";
					img.src = currentBg;
					await new Promise((resolve, reject) => {
						img.onload = resolve;
						img.onerror = reject;
					});
					
					const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
					const x = (canvas.width / 2) - (img.width / 2) * scale;
					const y = (canvas.height / 2) - (img.height / 2) * scale;
					
					ctx.save();
					ctx.filter = 'grayscale(100%) brightness(35%)';
					if (selectedStyle === 'glass') ctx.filter = 'grayscale(100%) brightness(50%) blur(10px)';
					ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
					ctx.restore();
				} catch (e) {
					ctx.fillStyle = '#000000';
					ctx.fillRect(0, 0, 1080, 1080);
				}
			} else {
				ctx.fillStyle = '#000000';
				ctx.fillRect(0, 0, 1080, 1080);
			}
		}

		if (selectedStyle === 'glass') {
			ctx.fillStyle = 'rgba(255,255,255,0.1)';
			ctx.fillRect(100, 100, 880, 880);
			ctx.strokeStyle = 'rgba(255,255,255,0.2)';
			ctx.lineWidth = 2;
			ctx.strokeRect(100, 100, 880, 880);
		} else if (selectedStyle !== 'impact') {
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
		} else if (selectedStyle === 'cyber') {
			ctx.strokeStyle = accentColor;
			ctx.lineWidth = 4;
			ctx.strokeRect(60, 60, 960, 960);
			ctx.fillStyle = accentColor;
			ctx.fillRect(40, 40, 100, 10); ctx.fillRect(40, 40, 10, 100);
			ctx.fillRect(940, 40, 100, 10); ctx.fillRect(1030, 40, 10, 100);
			ctx.fillRect(40, 1030, 100, 10); ctx.fillRect(40, 940, 10, 100);
			ctx.fillRect(940, 1030, 100, 10); ctx.fillRect(1030, 940, 10, 100);
		}

		ctx.textAlign = 'center';
		ctx.fillStyle = selectedStyle === 'impact' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)';
		ctx.font = '900 24px Inter, sans-serif';
		ctx.letterSpacing = '8px';
		ctx.fillText('GINKOHUB.GITHUB.IO', 540, 1000);

		ctx.textAlign = 'center';
		ctx.fillStyle = selectedStyle === 'impact' ? '#000000' : '#ffffff';
		
		let fontSize = selectedStyle === 'impact' ? 84 : 64;
		const fontConfig = `${selectedStyle === 'poetic' ? 'italic' : 'bold italic'}`;
		
		const fullText = `"${quote.text}"`;
		const maxWidth = 800;
		const maxLines = 10;
		
		function getLines(fs) {
			ctx.font = `${fontConfig} ${fs}px ${font.css}, sans-serif`;
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
		while (lines.length > maxLines && fontSize > 24) {
			fontSize -= 4;
			lines = getLines(fontSize);
		}

		const lineHeight = fontSize * 1.3;
		let startY = (1080 / 2) - ((lines.length * lineHeight) / 2);
		lines.forEach((line, i) => {
			ctx.fillText(line.trim(), 540, startY + (i * lineHeight));
		});

		const authorY = Math.min(startY + (lines.length * lineHeight) + 80, 940);
		ctx.fillStyle = selectedStyle === 'impact' ? 'rgba(0,0,0,0.6)' : accentColor;
		ctx.font = `bold 32px ${font.css}, sans-serif`;
		ctx.fillText(`— ${quote.author}`, 540, authorY);

		const dataUrl = canvas.toDataURL('image/png');
		isGenerating = false;
		
		if (download) {
			const link = document.createElement('a');
			link.download = `ginkohub-quote-${Date.now()}.png`;
			link.href = dataUrl;
			link.click();
		} else {
			previewUrl = dataUrl;
			showPreview = true;
		}
	}

	async function shareImage() {
		try {
			const response = await fetch(previewUrl);
			const blob = await response.blob();
			const file = new File([blob], 'ginkohub-wisdom.png', { type: 'image/png' });
			
			if (navigator.share) {
				await navigator.share({
					files: [file],
					title: 'GinkoHub Wisdom',
					text: `"${quote.text}" — ${quote.author}`
				});
			}
		} catch (err) {
			console.error("Sharing failed", err);
		}
	}

	$effect(() => {
		if (showPreview) generateImage(false);
		if (typeof navigator !== 'undefined') {
			canShare = !!navigator.share;
		}
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
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-start md:justify-center p-4 md:p-6 overflow-y-auto" onclick={() => showPreview = false} in:fade={{ duration: 250 }}>
		<div class="w-full max-w-4xl flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center pt-10 md:pt-0" onclick={(e) => e.stopPropagation()}>
			
			<!-- Controls Column -->
			<div class="flex flex-col gap-6 w-full md:w-64 order-2 md:order-1">
				<div>
					<h3 class="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3 text-center md:text-left">Visual Style</h3>
					<div class="grid grid-cols-3 md:grid-cols-2 gap-2">
						{#each styles as style}
							<button onclick={() => selectedStyle = style.id} class="px-2 py-2 text-[8px] font-black uppercase border transition-all {selectedStyle === style.id ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/30'}">{style.name}</button>
						{/each}
					</div>
				</div>

				<div>
					<h3 class="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3 text-center md:text-left">Typography</h3>
					<div class="grid grid-cols-2 gap-2">
						{#each fonts as font}
							<button onclick={() => selectedFont = font.id} class="px-2 py-2 text-[8px] font-black uppercase border transition-all {selectedFont === font.id ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/30'}">{font.name}</button>
						{/each}
					</div>
				</div>

				<div class="flex flex-col gap-3">
					<h3 class="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1 text-center md:text-left">Background</h3>
					<label class="block w-full py-2 text-center text-[8px] font-black uppercase border border-white/10 text-white/40 hover:bg-white/5 cursor-pointer transition-all">
						Upload Image
						<input type="file" accept="image/*" class="hidden" onchange={handleFileUpload} />
					</label>
				</div>
			</div>

			<!-- Preview Image -->
			<div class="relative w-full max-w-[400px] md:max-w-[500px] aspect-square shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5 order-1 md:order-2">
				<img src={previewUrl} alt="Quote Preview" class="w-full h-full object-contain" />
				<div class="absolute bottom-2 right-2 md:hidden">
					<span class="text-[7px] font-bold text-white/30 uppercase tracking-widest bg-black/40 px-2 py-1 backdrop-blur-md">Long press image to save</span>
				</div>
			</div>

			<!-- Action Column -->
			<div class="flex flex-col gap-3 w-full md:w-48 order-3 pb-10 md:pb-0">
				{#if canShare}
					<button onclick={shareImage} class="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] bg-emerald-500 text-black hover:bg-emerald-400 transition-all active:scale-95">Share Card</button>
				{/if}
				<button onclick={() => generateImage(true)} class="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] bg-white text-black hover:bg-slate-200 transition-all active:scale-95">Download PNG</button>
				<button onclick={() => showPreview = false} class="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] border border-white/20 text-white hover:bg-white/10 transition-all">Close</button>
			</div>
		</div>
	</div>
{/if}