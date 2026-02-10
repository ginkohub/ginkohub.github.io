export interface CyberSettings {
	borderWidth?: number;
	showCorners?: boolean;
	frameColor?: string;
}

export const config = {
	defaults: {
		borderWidth: 4,
		showCorners: true,
		frameColor: '#10b981'
	},
	controls: [
		{ id: 'borderWidth', label: 'Line Weight', type: 'range', min: 1, max: 20, step: 1 },
		{ id: 'frameColor', label: 'Frame Color', type: 'color' },
		{ id: 'showCorners', label: 'Frame Accents', type: 'toggle' }
	]
};

export function drawCyber(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	accentColor: string,
	settings: CyberSettings = {}
): void {
	const weight = settings.borderWidth ?? config.defaults.borderWidth;
	const corners = settings.showCorners ?? config.defaults.showCorners;
	const color = settings.frameColor ?? accentColor;

	ctx.strokeStyle = color;
	ctx.lineWidth = weight;
	ctx.strokeRect(60, 60, width - 120, height - 120);

	if (corners) {
		ctx.fillStyle = color;
		// Top Left
		ctx.fillRect(40, 40, 100, 10);
		ctx.fillRect(40, 40, 10, 100);
		// Top Right
		ctx.fillRect(width - 140, 40, 100, 10);
		ctx.fillRect(width - 50, 40, 10, 100);
		// Bottom Left
		ctx.fillRect(40, height - 50, 100, 10);
		ctx.fillRect(40, height - 140, 10, 100);
		// Bottom Right
		ctx.fillRect(width - 140, height - 50, 100, 10);
		ctx.fillRect(width - 50, height - 140, 10, 100);
	}
}
