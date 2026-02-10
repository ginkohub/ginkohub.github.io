import { githubState } from '$lib/features/about/githubState.svelte';
import type { ToolConfig } from '$lib/types';

export interface GithubArgs {
	action: 'set_mode' | 'set_lang' | 'refresh';
	data?: string;
}

export const config: ToolConfig = {
	name: 'github_skills',
	description: 'Control GitHub trending features (repos, developers, languages).',
	parameters: {
		type: 'object',
		properties: {
			action: {
				type: 'string',
				enum: ['set_mode', 'set_lang', 'refresh'],
				description: 'The action to perform.'
			},
			data: {
				type: 'string',
				description: 'Mode (repositories/developers) or Language name.'
			}
		},
		required: ['action']
	}
};

export const handler =
	(state: any) =>
	async ({ action, data }: GithubArgs): Promise<string> => {
		if (state.setTab) state.setTab('github');

		switch (action) {
			case 'set_mode': {
				const mode = data?.toLowerCase();
				if (mode === 'repositories' || mode === 'developers') {
					githubState.setMode(mode);
					return `GitHub trending mode switched to: ${mode}.`;
				}
				return 'Invalid mode. Use "repositories" or "developers".';
			}
			case 'set_lang':
				githubState.setLanguage(data?.toLowerCase() || 'all');
				return `GitHub trending language filtered to: ${data}.`;
			case 'refresh':
				githubState.setLanguage(githubState.selectedLang);
				return 'Reloading GitHub trends...';
		}
		return 'Action ignored.';
	};
