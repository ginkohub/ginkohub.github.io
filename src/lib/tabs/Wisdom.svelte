<script>
	import { fade } from 'svelte/transition';
	import { untrack } from 'svelte';
	import {
		generateQuoteImage,
		fonts,
		styles,
		aligns,
		styleConfigs
	} from '$lib/utils/quoteGenerator.js';
	import { wisdomState } from '../features/wisdom/wisdomState.svelte';

	let { data, accentColor, bgImage } = $props();

	let scrapedQuotes = $derived(data.quotes || []);
	let previewUrl = $state('');
	let showPreview = $state(false);
	let isGenerating = $state(false);
	let canShare = $state(false);
	let customBg = $state(null);
	let customColor = $state('#ffffff');

	// Modular Style Settings
	let styleSettings = $state({});
	let currentPreset = $state('poetic');
	let currentEditorTab = $state('looks'); // 'looks', 'style', 'layout'

	// Initialize style settings when style changes
	$effect(() => {
		const config = styleConfigs[wisdomState.selectedStyle];
		if (config && config.defaults) {
			untrack(() => {
				styleSettings = { ...config.defaults, ...styleSettings };
			});
		}
	});

	function resetSettings() {
		wisdomState.setStyle('glass');
		wisdomState.setFont('serif');
		wisdomState.setAlign('center');
		// ... (reset local vars)
		customBg = null;
		wisdomState.toggleGrayscale(true);
		styleSettings = styleConfigs['glass']?.defaults || {};
		currentPreset = '';
	}

	// Navigation logic linked to state
	$effect(() => {
		if (wisdomState.nextSignal > 0) {
			untrack(() => wisdomState.next());
		}
	});

	$effect(() => {
		if (wisdomState.prevSignal > 0) {
			untrack(() => wisdomState.prev());
		}
	});

	function applyPoeticMode() {
		wisdomState.setStyle('glass');
		wisdomState.setFont('serif');
		wisdomState.setAlign('center');
		wisdomState.toggleGrayscale(true);
		styleSettings = { glassBlur: 15 };
		currentPreset = 'poetic';
	}

	function cycleStyle() {
		const idx = styles.findIndex((s) => s.id === wisdomState.selectedStyle);
		wisdomState.setStyle(styles[(idx + 1) % styles.length].id);
	}

	function cycleFont() {
		const idx = fonts.findIndex((f) => f.id === wisdomState.selectedFont);
		wisdomState.setFont(fonts[(idx + 1) % fonts.length].id);
	}

	function cycleAlign() {
		const idx = aligns.findIndex((a) => a.id === wisdomState.selectedAlign);
		wisdomState.setAlign(aligns[(idx + 1) % aligns.length].id);
	}

	function copyQuote() {
		const text = `"${wisdomState.quote.text}" — ${wisdomState.quote.author}`;
		navigator.clipboard.writeText(text);
		const btn = document.getElementById('copy-btn');
		if (btn) {
			const originalText = btn.innerText;
			btn.innerText = 'COPIED!';
			setTimeout(() => (btn.innerText = originalText), 2000);
		}
	}

	function handleFileUpload(e) {
		const target = e.target;
		if (!target || !target.files) return;
		const file = target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				const result = event.target?.result;
				if (result) customBg = result;
			};
			reader.readAsDataURL(file);
		}
	}

	async function generateImage(download = false) {
		isGenerating = true;
		try {
			const dataUrl = await generateQuoteImage({
				quote: wisdomState.quote,
				accentColor,
				bgImage,
				customBg,
				selectedStyle: wisdomState.selectedStyle,
				selectedFont: wisdomState.selectedFont,
				selectedAlign: wisdomState.selectedAlign,
				selectedAuthorFont: 'sans', // Simplified for AI control
				selectedAuthorAlign: 'right',
				bgOpacity: 20,
				manualFontSize: 48,
				textOffsetX: 0,
				textOffsetY: 0,
				grayscaleMode: wisdomState.grayscaleMode,
				customColor: '#ffffff',
				customAuthorColor: '#ffffff',
				styleSettings: $state.snapshot(styleSettings)
			});

			if (download) {
				const link = document.createElement('a');
				link.download = `ginkohub-quote-${Date.now()}.png`;
				link.href = dataUrl;
				link.click();
			} else {
				previewUrl = dataUrl;
				showPreview = true;
			}
		} catch (err) {
			console.error('Image generation failed:', err);
		} finally {
			isGenerating = false;
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
					text: `"${wisdomState.quote.text}" — ${wisdomState.quote.author}`
				});
			}
		} catch (err) {
			console.error('Sharing failed', err);
		}
	}

	$effect(() => {
		// Watch wisdomState changes to regenerate preview if open
		wisdomState.selectedStyle;
		wisdomState.selectedFont;
		wisdomState.selectedAlign;
		wisdomState.quote;

		if (showPreview) generateImage(false);
		if (typeof navigator !== 'undefined') {
			canShare = !!navigator.share;
		}
	});
</script>

<div id="section-wisdom" class="relative group/quote text-right border-b border-slate-800/50">
	<!-- Navigation Header -->
	<div class="flex justify-end items-center gap-2 mb-2">
		<button
			onclick={() => wisdomState.prev()}
			class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
			style="border-color: {accentColor}; color: {accentColor};"
			title="View previous quote">← Prev</button
		>
		<span class="text-[7px] text-slate-300 font-bold uppercase tracking-widest px-2"
			>{wisdomState.currentQuoteIndex + 1} / {scrapedQuotes.length}</span
		>
		<button
			onclick={() => wisdomState.next()}
			class="text-[8px] font-black uppercase border-b transition-all px-1 active:bg-white active:text-black"
			style="border-color: {accentColor}; color: {accentColor};"
			title="View next quote">Next →</button
		>
	</div>

	<!-- Quote Display Area -->
	<div class="mb-4 relative">
		{#if showPreview && previewUrl}
			<!-- Live Canvas Preview -->
			<div
				class="relative w-full aspect-square bg-slate-900/20 border border-white/10 shadow-2xl overflow-hidden animate-in fade-in duration-500"
			>
				{#if isGenerating}
					<div
						class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20"
					>
						<div
							class="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"
						></div>
					</div>
				{/if}
				<img src={previewUrl} alt="Quote Preview" class="w-full h-full object-cover" />
			</div>
		{:else}
			<!-- Static HTML Display (Poetic Style) -->
			<div
				class="glass-quote rounded-xl flex flex-col items-stretch pt-4 pb-6 px-8 relative min-h-[80px] animate-in fade-in duration-500"
			>
				<span
					class="absolute top-1 left-3 text-3xl font-serif text-white/10 select-none pointer-events-none"
					>“</span
				>
				<span
					class="absolute bottom-1 right-3 text-3xl font-serif text-white/10 select-none pointer-events-none"
					>”</span
				>

				<p
					class="text-base md:text-lg font-serif italic leading-relaxed text-center tracking-wider relative z-10 text-slate-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
				>
					{wisdomState.quote.text}
				</p>
				<div class="flex flex-col items-end gap-1 mt-4 relative z-10">
					<div class="h-[1px] w-6 bg-white/10"></div>
					<p class="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
						— {wisdomState.quote.author}
					</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Action Footer -->
	<div
		class="flex gap-3 justify-end opacity-80 transition-opacity mb-4 border-b border-slate-800/50 pb-4"
	>
		{#if !showPreview}
			<button
				id="copy-btn"
				onclick={copyQuote}
				class="text-[8px] font-black uppercase border border-slate-700 px-3 py-2 hover:bg-white hover:text-black transition-all text-slate-300"
				>Copy Text</button
			>
		{/if}
		<button
			onclick={() => (showPreview = !showPreview)}
			class="text-[8px] font-black uppercase border border-slate-700 px-3 py-2 hover:bg-white hover:text-black transition-all text-slate-300 {showPreview
				? 'bg-white text-black'
				: ''}"
		>
			{showPreview ? 'Done' : 'Edit Style'}
		</button>
	</div>
</div>

<!-- Progressive Editor Controls -->
{#if showPreview}
	<div class="w-full space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 pb-12">
		<!-- Inspector Tabs -->
		<div class="flex border-b border-white/5">
			{#each ['looks', 'style', 'layout'] as tab}
				<button
					onclick={() => (currentEditorTab = tab)}
					class="flex-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] transition-all relative {currentEditorTab ===
					tab
						? 'text-white'
						: 'text-slate-600 hover:text-slate-400'}"
				>
					{tab}
					{#if currentEditorTab === tab}
						<div class="absolute bottom-0 left-0 w-full h-[1px] bg-white"></div>
					{/if}
				</button>
			{/each}
		</div>

		<div class="min-h-[180px]">
			{#if currentEditorTab === 'looks'}
				<!-- Tab 1: Presets & Styles -->
				<div class="space-y-6 animate-in fade-in duration-300">
					<div class="space-y-3">
						<h3 class="text-[7px] font-black uppercase tracking-[0.3em] text-slate-600">
							Quick Presets
						</h3>
						<div class="flex gap-2">
							<button
								onclick={applyPoeticMode}
								class="flex-1 py-3 text-[8px] font-black uppercase transition-all {currentPreset ===
								'poetic'
									? 'bg-white text-black'
									: 'border border-white/10 text-white/40'}">✨ Poetic</button
							>
							<button
								onclick={() => {
									wisdomState.setStyle('cyber');
									wisdomState.setFont('mono');
									wisdomState.toggleGrayscale(false);
									currentPreset = 'cyber';
								}}
								class="flex-1 py-3 text-[8px] font-black uppercase transition-all {currentPreset ===
								'cyber'
									? 'bg-white text-black'
									: 'border border-white/10 text-white/40'}">🧬 Cyber</button
							>
							<button
								onclick={() => {
									wisdomState.setStyle('impact');
									wisdomState.setFont('display');
									currentPreset = 'brutalist';
								}}
								class="flex-1 py-3 text-[8px] font-black uppercase transition-all {currentPreset ===
								'brutalist'
									? 'bg-white text-black'
									: 'border border-white/10 text-white/40'}">💥 Brutalist</button
							>
						</div>
					</div>
					<div class="space-y-3">
						<h3 class="text-[7px] font-black uppercase tracking-[0.3em] text-slate-600">
							Base Aesthetic
						</h3>
						<button
							onclick={cycleStyle}
							class="w-full py-4 border border-white/10 text-[10px] font-black uppercase flex justify-between px-4 hover:border-white transition-all"
						>
							<span class="opacity-40">Active Filter</span>
							<span>{styles.find((s) => s.id === wisdomState.selectedStyle)?.name}</span>
						</button>
					</div>
				</div>
			{:else if currentEditorTab === 'style'}
				<!-- Tab 2: Typography & Colors -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
					<!-- Quote Block -->
					<div class="space-y-3">
						<h3 class="text-[7px] font-black uppercase tracking-[0.3em] text-slate-600">
							Quote Config
						</h3>
						<div class="grid grid-cols-2 gap-2">
							<button
								onclick={cycleFont}
								class="py-3 border border-white/10 text-[8px] font-black uppercase flex justify-between px-3 hover:border-white"
							>
								<span class="opacity-40">Font</span>
								<span>{fonts.find((f) => f.id === wisdomState.selectedFont)?.name}</span>
							</button>
							<button
								onclick={cycleAlign}
								class="py-3 border border-white/10 text-[8px] font-black uppercase flex justify-between px-3 hover:border-white"
							>
								<span class="opacity-40">Align</span>
								<span>{aligns.find((a) => a.id === wisdomState.selectedAlign)?.name}</span>
							</button>
						</div>
						<div class="flex items-center justify-between border border-white/10 p-3">
							<span class="text-[7px] font-black uppercase text-slate-500">Color Spectrum</span>
							<input
								type="color"
								bind:value={customColor}
								class="w-6 h-6 bg-transparent border-none cursor-pointer"
							/>
						</div>
					</div>
				</div>
				<!-- ... other controls simplified/mapped ... -->
			{/if}
		</div>
		<!-- ... rest of template ... -->
	</div>
{/if}

<style>
	.glass-quote {
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.08);
		padding: 1.5rem;
		position: relative;
		overflow: hidden;
	}

	.glass-quote::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
	}
</style>
