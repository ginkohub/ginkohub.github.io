import type { ToolConfig, Accent } from '$lib/types';

export interface SystemArgs {
	action:
		| 'purge_session'
		| 'shuffle_identity'
		| 'trigger_fireworks'
		| 'change_theme'
		| 'list_themes';
	data?: string;
}

export const config: ToolConfig = {
	name: 'system_skills',
	description: 'Control system-level features, UI effects, themes, and session management.',
	parameters: {
		type: 'object',
		properties: {
			action: {
				type: 'string',
				enum: [
					'purge_session',
					'shuffle_identity',
					'trigger_fireworks',
					'change_theme',
					'list_themes'
				],
				description: 'System action to perform.'
			},
			data: {
				type: 'string',
				description: 'Additional data (e.g., theme color name like "emerald", "rose", "sky", etc.).'
			}
		},
		required: ['action']
	}
};

export const handler =
	(state: any) =>
	async ({ action, data }: SystemArgs): Promise<string> => {
		switch (action) {
			case 'list_themes':
				if (state.accents) {
					const names = (state.accents as Accent[]).map((a) => a.name).join(', ');
					return `Available Themes: ${names}`;
				}
				return 'Theme system not available.';

			case 'change_theme':
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
				break;

			case 'purge_session':
				if (typeof window !== 'undefined') {
					Object.keys(localStorage).forEach((k) => {
						if (k.includes('puter')) localStorage.removeItem(k);
					});
					Object.keys(sessionStorage).forEach((k) => {
						if (k.includes('puter')) sessionStorage.removeItem(k);
					});
					document.cookie.split(';').forEach((c) => {
						document.cookie = c
							.replace(/^ +/, '')
							.replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
					});
					if (window.indexedDB.databases) {
						window.indexedDB.databases().then((dbs) => {
							dbs.forEach((db) => {
								if (db.name && db.name.toLowerCase().includes('puter'))
									window.indexedDB.deleteDatabase(db.name);
							});
						});
					}
					setTimeout(() => window.location.reload(), 1500);
					return 'SYSTEM PURGE INITIATED. REBOOTING...';
				}
				break;

			case 'shuffle_identity':
				if (typeof window !== 'undefined') {
					const logo = document.querySelector('button[title*="Aura"]') as HTMLButtonElement;
					if (logo) logo.click();
					return 'Identity shuffled. Aura triggered.';
				}
				break;

			case 'trigger_fireworks':
				if (state.fireworks && data) {
					const intensity = Math.min(Math.max(parseInt(data) || 10, 1), 50);
					state.fireworks.trigger(intensity);
					return `Fireworks triggered with intensity: ${intensity}`;
				}
				break;
		}
		return 'System action completed.';
	};
