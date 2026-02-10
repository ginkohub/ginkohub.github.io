import { gameState } from '$lib/features/game/gameState.svelte';
import type { ToolConfig } from '$lib/types';

export interface GameArgs {
	action: 'play' | 'select';
	game_id: string;
}

export const config: ToolConfig = {
	name: 'game_skills',
	description: 'Select and control arcade games.',
	parameters: {
		type: 'object',
		properties: {
			action: {
				type: 'string',
				enum: ['play', 'select'],
				description: 'Game interaction.'
			},
			game_id: {
				type: 'string',
				description: 'ID of the game (snake, evasion, tetris, pong, breakout).'
			}
		},
		required: ['action', 'game_id']
	}
};

export const handler =
	(state: any) =>
	async ({ action, game_id }: GameArgs): Promise<string> => {
		if (state.setTab) state.setTab('game');
		gameState.selectGame(game_id || 'snake');
		return `Now playing: ${game_id.toUpperCase()}`;
	};
