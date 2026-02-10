export const config = {
	defaults: {
		bgOpacity: 25,
		glassBlur: 10,
		glassRound: 24
	},
	controls: [
		{ id: 'glassBlur', label: 'Blur Intensity', type: 'range', min: 0, max: 40, step: 1 },
		{ id: 'glassRound', label: 'Corner Rounding', type: 'range', min: 0, max: 100, step: 2 }
	]
};

export function drawGlass(ctx, width, height, settings = {}) {
	const blur = settings.glassBlur ?? config.defaults.glassBlur;
	const round = settings.glassRound ?? config.defaults.glassRound;
	let color = settings.baseColor ?? '#ffffff';

	// Ensure transparency if a hex color is picked
	if (color.startsWith('#')) {
		const r = parseInt(color.slice(1, 3), 16);
		const g = parseInt(color.slice(3, 5), 16);
		const b = parseInt(color.slice(5, 7), 16);
		ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
		ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
	} else {
		ctx.fillStyle = color;
		ctx.strokeStyle = color;
	}

	ctx.save();
	ctx.lineWidth = 2;

	ctx.beginPath();
	ctx.roundRect(100, 100, width - 200, height - 200, round);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
}
