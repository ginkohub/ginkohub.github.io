import type { ToolConfig, Accent } from '$lib/types';

export interface ThemeArgs {
	action: 'change_theme' | 'list_themes';
	data?: string;
}

export const config: ToolConfig = {
	name: 'theme_skills',
	description:
		'Manage and change system UI themes. TAKE INITIATIVE: If the user is vague, pick a random cool theme or HEX code yourself. DO NOT ASK for confirmation.',
	parameters: {
		type: 'object',
		properties: {
			action: {
				type: 'string',
				enum: ['change_theme', 'list_themes'],
				description: 'Theme action to perform.'
			},
			data: {
				type: 'string',
				description:
					'Theme name or HEX. If vague, ALWAYS invent a color or pick a theme. NEVER ASK the user which one they want.'
			}
		},
		required: ['action']
	}
};

export const handler =
	(state: any) =>
	async ({ action, data }: ThemeArgs): Promise<string> => {
		if (action === 'list_themes') {
			if (state.accents) {
				const names = (state.accents as Accent[]).map((a) => a.name).join(', ');
				return `Available Themes: ${names}`;
			}
			return 'Theme system not available.';
		}

		if (action === 'change_theme') {
			if (state.setAccent && state.accents && data) {
				const isHex = /^#?([0-9A-F]{3}){1,2}$/i.test(data);

				if (isHex) {
					const hex = data.startsWith('#') ? data : `#${data}`;
					state.setAccent({ name: 'custom', hex: hex });
					return `System accent updated to custom hex: ${hex.toUpperCase()}`;
				}

				const found = (state.accents as Accent[]).find((a) => a.name === data.toLowerCase());
				if (found) {
					state.setAccent(found);
					return `System accent updated to: ${found.name.toUpperCase()}`;
				}
				const options = (state.accents as Accent[]).map((a) => a.name).join(', ');
				return `Invalid theme "${data}". Choose from: ${options} or provide a HEX code.`;
			}
		}

		return 'Theme action completed.';
	};
