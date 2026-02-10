import { previewState } from '$lib/features/preview/previewState.svelte';
import type { ToolConfig } from '$lib/types';

export interface PreviewArgs {
	url: string;
}

export const config: ToolConfig = {
	name: 'preview_skills',
	description: 'Generate and display social media link previews.',
	parameters: {
		type: 'object',
		properties: {
			url: {
				type: 'string',
				description: 'The URL to preview.'
			}
		},
		required: ['url']
	}
};

export const handler =
	(state: any) =>
	async ({ url }: PreviewArgs): Promise<string> => {
		if (state.setTab) state.setTab('preview');
		previewState.inputUrl = url;
		await previewState.fetch();
		return `Previewing metadata for: ${url}`;
	};
