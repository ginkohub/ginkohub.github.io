import { aiMemory } from '$lib/ai/memory.svelte';
import type { ToolConfig } from '$lib/types';

export interface RememberArgs {
	key: string;
	value: string;
}

export const config: ToolConfig = {
	name: 'remember',
	description: 'Save important user information to long-term memory (e.g. name, preferences).',
	parameters: {
		type: 'object',
		properties: {
			key: {
				type: 'string',
				description: 'The type of info (e.g. "user_name", "favorite_color").'
			},
			value: { type: 'string', description: 'The information to remember.' }
		},
		required: ['key', 'value']
	}
};

export const handler =
	(state: any) =>
	async ({ key, value }: RememberArgs): Promise<string> => {
		aiMemory.set(key, value);
		return `Memory updated: I will remember that ${key} is ${value}.`;
	};
