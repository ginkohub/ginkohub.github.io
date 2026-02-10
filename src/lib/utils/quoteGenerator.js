import { drawGlass, config as glassConfig } from './quote-styles/glass.js';
import { drawCyber, config as cyberConfig } from './quote-styles/cyber.js';
import { drawHologram, config as hologramConfig } from './quote-styles/hologram.js';
import { drawMinimalist } from './quote-styles/minimalist.js';

export const styleConfigs = {
	glass: {
		defaults: { ...glassConfig.defaults, baseColor: 'rgba(255,255,255,0.2)' },
		controls: [{ id: 'baseColor', label: 'Glass Tint', type: 'color' }, ...glassConfig.controls]
	},
	cyber: cyberConfig,
	hologram: {
		defaults: { ...hologramConfig.defaults, baseColor: 'rgba(0, 255, 255, 0.1)' },
		controls: [
			{ id: 'baseColor', label: 'Hologram Tint', type: 'color' },
			...hologramConfig.controls
		]
	},
	minimalist: {
		defaults: { baseColor: '#ffffff' },
		controls: [{ id: 'baseColor', label: 'Border Color', type: 'color' }]
	},
	impact: { defaults: {}, controls: [] },
	poetic: { defaults: {}, controls: [] }
};

export const fonts = [
	{ id: 'sans', name: 'Inter', css: 'Inter' },
	{ id: 'display', name: 'Grotesk', css: '"Space Grotesk"' },
	{ id: 'serif', name: 'Serif', css: 'serif' },
	{ id: 'mono', name: 'Mono', css: 'monospace' }
];

export const styles = [
	{ id: 'minimalist', name: 'Minimal' },
	{ id: 'impact', name: 'Impact' },
	{ id: 'poetic', name: 'Poetic' },
	{ id: 'cyber', name: 'Cyber' },
	{ id: 'glass', name: 'Glass' },
	{ id: 'hologram', name: 'Hologram' }
];

export const aligns = [
	{ id: 'left', name: 'LEFT', icon: '⫷' },
	{ id: 'center', name: 'CENTER', icon: '〓' },
	{ id: 'right', name: 'RIGHT', icon: '⫸' }
];

/**
 * Generates a PNG data URL for a quote.
 */
export async function generateQuoteImage({
	quote,
	accentColor,
	bgImage,
	customBg,
	selectedStyle,
	selectedFont,
	selectedAlign,
	selectedAuthorFont,
	selectedAuthorAlign,
	bgOpacity,
	manualFontSize,
	textOffsetX,
	textOffsetY,
	grayscaleMode,
	customColor,
	customAuthorColor,
	styleSettings = {}
}) {
	const font = fonts.find((f) => f.id === selectedFont) || fonts[0];
	const authorFont = fonts.find((f) => f.id === (selectedAuthorFont || selectedFont)) || font;
	try {
		await document.fonts.load(`bold italic 64px ${font.css}`);
		if (selectedAuthorFont) await document.fonts.load(`bold 32px ${authorFont.css}`);
	} catch (e) {
		console.warn('Font load failed, using fallback');
	}

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Could not get canvas context');

	canvas.width = 1080;
	canvas.height = 1080;

	const currentBg = customBg || bgImage;

	// 1. Draw Background Layer
	if (selectedStyle === 'impact') {
		ctx.fillStyle = accentColor;
		ctx.fillRect(0, 0, 1080, 1080);
	} else {
		if (currentBg) {
			try {
				const img = new Image();
				if (!customBg) img.crossOrigin = 'anonymous';
				img.src = currentBg;
				await new Promise((resolve, reject) => {
					img.onload = resolve;
					img.onerror = reject;
				});

				const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
				const x = canvas.width / 2 - (img.width / 2) * scale;
				const y = canvas.height / 2 - (img.height / 2) * scale;

				ctx.save();
				const filterGray = grayscaleMode ? 'grayscale(100%)' : 'grayscale(0%)';
				ctx.filter = `${filterGray} brightness(${bgOpacity}%)`;

				// Handle dynamic blur from style settings if applicable
				const blur = styleSettings.glassBlur ?? 10;
				if (selectedStyle === 'glass')
					ctx.filter = `${filterGray} brightness(${bgOpacity + 15}%) blur(${blur}px)`;

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

	// 2. Draw Style Overlays (Modular)
	if (selectedStyle === 'glass') {
		drawGlass(ctx, canvas.width, canvas.height, styleSettings);
	} else if (selectedStyle === 'hologram') {
		drawHologram(ctx, canvas.width, canvas.height, styleSettings);
	} else if (selectedStyle === 'cyber') {
		drawCyber(ctx, canvas.width, canvas.height, accentColor, styleSettings);
	} else if (selectedStyle === 'minimalist') {
		drawMinimalist(ctx, canvas.width, canvas.height, accentColor, styleSettings);
	} else if (selectedStyle !== 'impact') {
		// Default Gradient Overlay for other styles
		const grad = ctx.createLinearGradient(0, 0, 0, 1080);
		grad.addColorStop(0, 'rgba(0,0,0,0.7)');
		grad.addColorStop(0.5, 'transparent');
		grad.addColorStop(1, 'rgba(0,0,0,0.9)');
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, 1080, 1080);
	}

	// 3. Branding
	ctx.textAlign = 'right';
	ctx.fillStyle = selectedStyle === 'impact' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)';
	ctx.font = '900 18px Inter, sans-serif';
	ctx.letterSpacing = '4px';
	ctx.fillText('GINKOHUB.GITHUB.IO', 1040, 1040);

	// 4. Quote Text
	ctx.textAlign = selectedAlign;

	// Apply custom text color if chosen, otherwise fallback to style defaults
	let textFill = '#ffffff';
	if (selectedStyle === 'impact') {
		textFill = '#000000';
	} else if (customColor && customColor !== '#ffffff') {
		textFill = customColor;
	}

	ctx.fillStyle = textFill;

	const fontConfig = `${selectedStyle === 'poetic' ? 'italic' : 'bold italic'}`;
	const fullText = `"${quote.text}"`;
	const maxWidth = 800;

	function getLines(fs) {
		ctx.font = `${fontConfig} ${fs}px ${font.css}, sans-serif`;
		const words = fullText.split(' ');
		let lines = [];
		let currentLine = '';
		words.forEach((word) => {
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

	const lines = getLines(manualFontSize);
	const lineHeight = manualFontSize * 1.3;

	let drawX = 540 + textOffsetX;
	if (selectedAlign === 'left') drawX = 140 + textOffsetX;
	if (selectedAlign === 'right') drawX = 940 + textOffsetX;

	let startY = 1080 / 2 - (lines.length * lineHeight) / 2 + textOffsetY;

	lines.forEach((line, i) => {
		if (selectedStyle === 'hologram') {
			ctx.fillStyle = 'rgba(255, 0, 255, 0.5)';
			ctx.fillText(line.trim(), drawX - 3, startY + i * lineHeight);
			ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
			ctx.fillText(line.trim(), drawX + 3, startY + i * lineHeight);
			ctx.fillStyle = '#ffffff';
		}
		ctx.fillText(line.trim(), drawX, startY + i * lineHeight);
	});

	// 5. Author
	ctx.textAlign = selectedAuthorAlign || selectedAlign;
	const authorY = Math.min(startY + lines.length * lineHeight + 80, 940);
	let authorX = drawX; // Default to same as quote

	// Recalculate X if author alignment differs
	if (selectedAuthorAlign === 'left') authorX = 140 + textOffsetX;
	else if (selectedAuthorAlign === 'center') authorX = 540 + textOffsetX;
	else if (selectedAuthorAlign === 'right') authorX = 940 + textOffsetX;

	if (selectedStyle === 'hologram') {
		ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
	} else if (selectedStyle === 'impact') {
		ctx.fillStyle = 'rgba(0,0,0,0.6)';
	} else if (customAuthorColor && customAuthorColor !== '#ffffff') {
		// Use explicit custom author color
		ctx.fillStyle = customAuthorColor;
		ctx.globalAlpha = 0.6; // Subtle dimming for author hierarchy
	} else {
		// Default to accent color for author if no custom color is picked
		ctx.fillStyle = accentColor;
	}
	ctx.font = `bold 32px ${authorFont.css}, sans-serif`;
	ctx.fillText(`— ${quote.author}`, authorX, authorY);
	ctx.globalAlpha = 1.0; // Reset alpha

	return canvas.toDataURL('image/png');
}
