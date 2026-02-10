import { wordState } from '$lib/features/words/wordState.svelte';
import type { ToolConfig } from '$lib/types';

export interface WordArgs {
	query: string;
}

export const config: ToolConfig = {
	name: 'word_skills',
	description: 'Search for words and use dictionary features.',
	parameters: {
		type: 'object',
		properties: {
			query: {
				type: 'string',
				description: 'The word or prefix to search for.'
			}
		},
		required: ['query']
	}
};

export const handler =
	(state: any) =>
	async ({ query }: WordArgs): Promise<string> => {
		if (state.setTab) state.setTab('words');
		wordState.setSearchTerm(query);
		return `Searching for words matching "${query}"...`;
	};
