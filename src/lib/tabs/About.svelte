<script>
	import { fade, fly } from 'svelte/transition';
	let { currentQuoteIndex = $bindable(), quote, prevQuote, nextQuote, scrapedQuotes, contacts, accentColor, bgImage } = $props();

	let previewUrl = $state('');
	let showPreview = $state(false);
	let isGenerating = $state(false);

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

		// 1. Draw Background Image
		if (bgImage) {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.src = bgImage;
			await new Promise(r => img.onload = r);
			
			// Fill cover logic
			const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
			const x = (canvas.width / 2) - (img.width / 2) * scale;
			const y = (canvas.height / 2) - (img.height / 2) * scale;
			
			ctx.save();
			// Make background grayscale
			ctx.filter = 'grayscale(100%) brightness(40%)';
			ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
			ctx.restore();
		} else {
			ctx.fillStyle = '#000000';
			ctx.fillRect(0, 0, 1080, 1080);
		}

		// 2. Add Gradient Overlay for Depth
		const grad = ctx.createLinearGradient(0, 0, 0, 1080);
		grad.addColorStop(0, 'rgba(0,0,0,0.6)');
		grad.addColorStop(0.5, 'transparent');
		grad.addColorStop(1, 'rgba(0,0,0,0.8)');
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, 1080, 1080);

		// 3. Draw Design Elements
		// Accent border/line
		ctx.strokeStyle = accentColor;
		ctx.lineWidth = 40;
		ctx.strokeRect(0, 0, 1080, 1080);

		// Accent decoration
		ctx.fillStyle = accentColor;
		ctx.fillRect(100, 100, 80, 4);

		// Branding
		ctx.fillStyle = 'rgba(255,255,255,0.4)';
		ctx.font = '900 24px Inter, sans-serif';
		ctx.letterSpacing = '8px';
		ctx.fillText('GINKOHUB.GITHUB.IO', 200, 115);

		// 4. Draw Quote Text
		ctx.textAlign = 'center';
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold italic 64px "Space Grotesk", sans-serif';
		
		const words = `"${quote.text}"`.split(' ');
		let lines = [];
		let currentLine = '';
		const maxWidth = 800;

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

		const lineHeight = 80;
		let startY = (1080 / 2) - ((lines.length * lineHeight) / 2);

		lines.forEach((line, i) => {
			ctx.fillText(line.trim(), 540, startY + (i * lineHeight));
		});

		// 5. Draw Author
		const authorY = startY + (lines.length * lineHeight) + 60;
		ctx.fillStyle = accentColor;
		ctx.font = 'black 32px Inter, sans-serif';
		ctx.letterSpacing = '2px';
		ctx.fillText(`— ${quote.author.toUpperCase()}`, 540, authorY);

		const dataUrl = canvas.toDataURL('image/png');
		isGenerating = false;
		
		if (download) {
			const link = document.createElement('a');
			link.download = `ginkohub-wisdom-${Date.now()}.png`;
			link.href = dataUrl;
			link.click();
		} else {
			previewUrl = dataUrl;
			showPreview = true;
		}
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
					class="text-[8px] font-black uppercase border border-slate-700 px-2 py-1 hover:bg-white hover:text-black transition-all text-slate-300"
				>
					Copy Text
				</button>
				<button 
					onclick={() => generateImage(false)}
					class="text-[8px] font-black uppercase border border-slate-700 px-2 py-1 hover:bg-white hover:text-black transition-all text-slate-300 disabled:opacity-50"
					disabled={isGenerating}
				>
					{isGenerating ? 'GEN...' : 'Save Image'}
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
				<span class="text-[7px] text-slate-300 font-bold uppercase tracking-widest px-2">
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
			<p class="text-[9px] font-black uppercase tracking-widest text-slate-400">— {quote.author}</p>
		</div>
	</div>

	<div class="space-y-6 pt-6 border-t border-slate-800">
		<h2 class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Connect</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
			{#each contacts as contact}
				<div class="flex flex-col group/item">
					<span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 group-hover/item:text-slate-200 transition-colors">{contact.label}</span>
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

<!-- Preview Modal -->
{#if showPreview}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
		onclick={() => showPreview = false}
		in:fade={{ duration: 250 }}
	>
		<div 
			class="relative w-full max-w-[500px] aspect-square shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden"
			onclick={(e) => e.stopPropagation()}
		>
			<img src={previewUrl} alt="Quote Preview" class="w-full h-full object-contain" />
		</div>
		
		<div class="mt-10 flex gap-4">
			<button 
				onclick={() => generateImage(true)}
				class="px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] bg-white text-black hover:invert transition-all active:scale-95"
			>
				Download PNG
			</button>
			<button 
				onclick={() => showPreview = false}
				class="px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] border border-white/20 text-white hover:bg-white/10 transition-all active:scale-95"
			>
				Close
			</button>
		</div>
		
		<p class="mt-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] animate-pulse">Design: Minimalist Digital Card</p>
	</div>
{/if}
