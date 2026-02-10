export interface MinimalistSettings {
	baseColor?: string;
}

export function drawMinimalist(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	accentColor: string,
	settings: MinimalistSettings = {}
): void {
	const color = settings.baseColor ?? accentColor;
	ctx.strokeStyle = color;
	ctx.lineWidth = 40;
	ctx.strokeRect(0, 0, width, height);
}
