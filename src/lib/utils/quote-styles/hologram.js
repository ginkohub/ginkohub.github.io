export const config = {
	defaults: {
		scanlineGap: 4,
		glitchLines: 20
	},
	controls: [
		{ id: 'scanlineGap', label: 'Scanline Gap', type: 'range', min: 2, max: 20, step: 2 },
		{ id: 'glitchLines', label: 'Glitch Intensity', type: 'range', min: 0, max: 100, step: 5 }
	]
};

export function drawHologram(ctx, width, height, settings = {}) {
	const gap = settings.scanlineGap ?? config.defaults.scanlineGap;
	const glitches = settings.glitchLines ?? config.defaults.glitchLines;
	const color = settings.baseColor ?? 'rgba(0, 255, 255, 0.1)';

	// Tint background
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, width, height);

	// Scanlines
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;
	for (let i = 0; i < height; i += gap) {
		ctx.beginPath();
		ctx.moveTo(0, i);
		ctx.lineTo(width, i);
		ctx.stroke();
	}

	// Glitch lines
	ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
	for (let i = 0; i < glitches; i++) {
		const x = Math.random() * width;
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, height);
		ctx.stroke();
	}
}
