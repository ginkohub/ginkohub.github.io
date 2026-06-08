import { wisdomState } from '$lib/features/wisdom/wisdomState.svelte';
import type { ToolConfig } from '$lib/types';

export interface WisdomArgs {
	action:
		| 'next'
		| 'prev'
		| 'set_style'
		| 'set_font'
		| 'set_align'
		| 'toggle_grayscale'
		| 'search';
	data?: string;
}

export const config: ToolConfig = {
	name: 'wisdom_skills',
	description: 'Navigate, search, and style poetic wisdom quotes.',
	parameters: {
		type: 'object',
		properties: {
			action: {
				type: 'string',
				enum: ['next', 'prev', 'set_style', 'set_font', 'set_align', 'toggle_grayscale', 'search'],
				description: 'Navigasi, pencarian, atau pengaturan style quote.'
			},
			data: {
				type: 'string',
				description: 'Style/Font/Align name, search query, atau "true"/"false" untuk grayscale.'
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
			case 'search':
				if (data) wisdomState.setSearchQuery(data);
				return `Searching wisdom for: ${data}. Found ${wisdomState.filteredQuotes.length} matches.`;
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
