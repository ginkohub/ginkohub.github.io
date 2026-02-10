import { tick } from 'svelte';
import type { ToolConfig } from '$lib/types';

export interface NavigationArgs {
	target: string;
	section?: string;
	action?: 'go_to' | 'go_home';
}

export const config: ToolConfig = {
	name: 'navigation_skills',
	description: 'Navigate between different tabs and sections of the website.',
	parameters: {
		type: 'object',
		properties: {
			target: {
				type: 'string',
				enum: [
					'about',
					'wisdom',
					'github',
					'tools',
					'news',
					'ai',
					'humor',
					'words',
					'preview',
					'game'
				],
				description: 'The tab name to navigate to.'
			},
			section: {
				type: 'string',
				description: 'Specific section within the tab (optional).'
			},
			action: {
				type: 'string',
				enum: ['go_to', 'go_home'],
				description: 'Type of movement.'
			}
		},
		required: ['target']
	}
};

export const handler =
	(state: any) =>
	async ({ target, section, action }: NavigationArgs): Promise<string> => {
		let finalTarget = action === 'go_home' ? 'about' : target;
		let finalSection = section?.toLowerCase();

		// AUTO-CORRECTION: Map sections to their correct tabs if AI gets confused
		if (finalSection && ['connect', 'comment', 'stats', 'github'].includes(finalSection)) {
			finalTarget = 'about';
			if (finalSection === 'stats') finalSection = 'github';
		}

		if (state.setTab) {
			state.setTab(finalTarget);

			if (finalSection) {
				await tick();
				const el = document.getElementById(`section-${finalSection}`);
				if (el) el.scrollIntoView({ behavior: 'smooth' });
			}

			return `Navigated to ${finalTarget}${finalSection ? ' (' + finalSection + ')' : ''}.`;
		}

		return 'Navigation failed: setTab not available.';
	};
