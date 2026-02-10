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
				// 1. Wipe Storage
				Object.keys(localStorage).forEach((k) => {
					if (k.includes('puter')) localStorage.removeItem(k);
				});
				Object.keys(sessionStorage).forEach((k) => {
					if (k.includes('puter')) sessionStorage.removeItem(k);
				});

				// 2. Wipe Cookies
				document.cookie.split(';').forEach((c) => {
					document.cookie = c
						.replace(/^ +/, '')
						.replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
				});

				// 3. Clear IndexedDB
				if (window.indexedDB.databases) {
					window.indexedDB.databases().then((dbs) => {
						dbs.forEach((db) => {
							if (db.name && db.name.toLowerCase().includes('puter'))
								window.indexedDB.deleteDatabase(db.name);
						});
					});
				}

				// 4. Reboot
				setTimeout(() => window.location.reload(), 1500);
				return 'SYSTEM PURGE INITIATED. REBOOTING...';
			}
		}

		return 'Session action completed.';
	};
