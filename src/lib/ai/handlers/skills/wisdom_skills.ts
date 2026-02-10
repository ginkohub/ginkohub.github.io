import { wisdomState } from '$lib/features/wisdom/wisdomState.svelte';
import type { ToolConfig } from '$lib/types';

export interface WisdomArgs {
	action: 'next' | 'prev' | 'set_style' | 'set_font' | 'set_align' | 'toggle_grayscale';
	data?: string;
}

export const config: ToolConfig = {
	name: 'wisdom_skills',
	description: 'Navigate and style poetic wisdom quotes.',
	parameters: {
		type: 'object',
		properties: {
			action: {
				type: 'string',
				enum: ['next', 'prev', 'set_style', 'set_font', 'set_align', 'toggle_grayscale'],
				description: 'Navigasi atau pengaturan style quote.'
			},
			data: {
				type: 'string',
				description: 'Style/Font/Align name atau "true"/"false" untuk grayscale.'
			}
		},
		required: ['action']
	}
};

export const handler =
	(state: any) =>
	async ({ action, data }: WisdomArgs): Promise<string> => {
		if (state.setTab) state.setTab('wisdom');

		switch (action) {
			case 'next':
				wisdomState.next();
				return 'Next quote triggered.';
			case 'prev':
				wisdomState.prev();
				return 'Previous quote triggered.';
			case 'set_style':
				if (data) wisdomState.setStyle(data);
				return `Style set to ${data}.`;
			case 'set_font':
				if (data) wisdomState.setFont(data);
				return `Font set to ${data}.`;
			case 'set_align':
				if (data) wisdomState.setAlign(data);
				return `Alignment set to ${data}.`;
			case 'toggle_grayscale':
				wisdomState.toggleGrayscale(data === 'true');
				return `Grayscale mode ${data === 'true' ? 'enabled' : 'disabled'}.`;
		}
		return 'Action ignored.';
	};
