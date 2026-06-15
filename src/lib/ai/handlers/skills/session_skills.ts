import type { ToolConfig } from '$lib/types';

export interface SessionArgs {
	action: 'purge_session';
}

export const config: ToolConfig = {
	name: 'session_skills',
	description: 'Manage AI sessions and perform system-level resets.',
	parameters: {
		type: 'object',
		properties: {
			action: {
				type: 'string',
				enum: ['purge_session'],
				description: 'Perform a full system purge and reboot.'
			}
		},
		required: ['action']
	}
};

export const handler =
	(_state: any) =>
	async ({ action }: SessionArgs): Promise<string> => {
		if (action === 'purge_session') {
			if (typeof window !== 'undefined') {
				localStorage.clear();
				sessionStorage.clear();
				document.cookie.split(';').forEach((c) => {
					document.cookie = c
						.replace(/^ +/, '')
						.replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
				});
				setTimeout(() => window.location.reload(), 1500);
				return 'SYSTEM PURGE INITIATED. REBOOTING...';
			}
		}

		return 'Session action completed.';
	};
