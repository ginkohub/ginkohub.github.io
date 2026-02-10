import { toolState } from '$lib/features/tools/toolState.svelte';
import type { ToolConfig } from '$lib/types';

export interface ToolArgs {
	type: 'json' | 'base64' | 'url';
	data: string;
}

export const config: ToolConfig = {
	name: 'tool_skills',
	description: 'Interact with developer utilities (JSON, Base64, URL).',
	parameters: {
		type: 'object',
		properties: {
			type: {
				type: 'string',
				enum: ['json', 'base64', 'url'],
				description: 'The tool type.'
			},
			data: {
				type: 'string',
				description: 'The input data/string to process.'
			}
		},
		required: ['type', 'data']
	}
};

export const handler =
	(state: any) =>
	async ({ type, data }: ToolArgs): Promise<string> => {
		if (state.setTab) state.setTab('tools');

		switch (type) {
			case 'json':
				toolState.setJsonInput(data);
				return 'JSON input populated.';
			case 'base64':
				toolState.setBase64Input(data);
				return 'Base64 input populated.';
			case 'url':
				toolState.setUrlInput(data);
				return 'URL input populated.';
		}
		return 'Tool interaction completed.';
	};
