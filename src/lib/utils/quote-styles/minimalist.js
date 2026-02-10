export function drawMinimalist(ctx, width, height, accentColor, settings = {}) {
	const color = settings.baseColor ?? accentColor;
	ctx.strokeStyle = color;
	ctx.lineWidth = 40;
	ctx.strokeRect(0, 0, width, height);
}
