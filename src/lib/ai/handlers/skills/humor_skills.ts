import { humorState } from '$lib/features/humor/humorState.svelte';
import type { ToolConfig } from '$lib/types';

export interface HumorArgs {
	action: 'refresh';
	channel?: 'memes' | 'dankmemes' | 'wholesomememes' | 'ProgrammingHumor' | 'softwaregore';
}

export const config: ToolConfig = {
	name: 'humor_skills',
	description: 'Refresh memes and jokes from different sources.',
	parameters: {
		type: 'object',
		properties: {
			action: {
				type: 'string',
				enum: ['refresh'],
				description: 'Refresh the content.'
			},
			channel: {
				type: 'string',
				enum: ['memes', 'dankmemes', 'wholesomememes', 'ProgrammingHumor', 'softwaregore'],
				description: 'The Reddit channel source.'
			}
		},
		required: ['action']
	}
};

export const handler =
	(state: any) =>
	async ({ action, channel }: HumorArgs): Promise<string> => {
		if (state.setTab) state.setTab('humor');
		const validChannel = channel || 'memes';
		humorState.fetchMeme(validChannel);
		return `Humor stream refreshed (Source: r/${validChannel})`;
	};
