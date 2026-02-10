/**
 * Puter Session Utilities & Watchdog
 */

/**
 * Clears Puter-related local data WITHOUT reloading the page.
 */
export function softPurgePuterSession() {
	if (typeof window === 'undefined') return;

	console.warn('Puter Service: Soft purging local session data...');

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

	// 3. Clear Puter internal auth if possible
	if (window.puter && window.puter.auth) {
		try {
			window.puter.auth.signOut();
		} catch (e) {}
	}
}

/**
 * Performs a "Nuclear Reset" on all Puter-related local data and reloads the page.
 * Useful for stuck sessions, 401 errors, or quota limits.
 */
export function purgePuterSession() {
	if (typeof window === 'undefined') return;

	console.warn('Puter Service: Purging session and clearing fingerprint...');

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

	// 3. Force reload to start fresh
	window.location.reload();
}

/**
 * Monitors the Puter.js SDK for authentication errors.
 */
export function initWatchdog() {
	if (typeof window === 'undefined') return;

	const checkPuter = async () => {
		// Wait for SDK to load
		let retries = 0;
		while (!window.puter && retries < 20) {
			await new Promise((r) => setTimeout(r, 100));
			retries++;
		}

		if (window.puter) {
			try {
				await window.puter.auth.getUser();
				sessionStorage.removeItem('puter_recovery_attempted');
			} catch (e) {
				console.error('[Puter Watchdog Error]:', e);
				const err = String(e).toLowerCase();

				if (err.includes('401') || err.includes('unauthorized') || err.includes('invalid')) {
					// Prevent infinite loop
					if (sessionStorage.getItem('puter_recovery_attempted')) return;

					sessionStorage.setItem('puter_recovery_attempted', 'true');
					purgePuterSession();
				}
			}
		}
	};

	checkPuter();
}
