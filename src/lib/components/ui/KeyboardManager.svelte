<script>
	import { onMount, onDestroy } from 'svelte';
	import { appState } from '$lib/state/appState.svelte';

	let commandBuffer = '';

	function handleGlobalKeydown(e) {
		if (e.key.length === 1) {
			commandBuffer += e.key.toLowerCase();
			if (commandBuffer.length > 20) commandBuffer = commandBuffer.slice(-20);

			if (commandBuffer.endsWith('matrix')) {
				appState.setAccent({ name: 'matrix', hex: '#00ff41' });
				appState.isOverloaded = true;
				commandBuffer = '';
			} else if (commandBuffer.endsWith('reset')) {
				appState.isOverloaded = false;
				appState.comboCount = 0;
				commandBuffer = '';
				appState.shuffleAccent();
			} else if (commandBuffer.endsWith('rumi')) {
				appState.activeTabLabel = 'about';
				commandBuffer = '';
			} else if (commandBuffer.endsWith('purge')) {
				if (typeof window !== 'undefined') {
					// 1. Storage
					Object.keys(localStorage).forEach((k) => {
						if (k.includes('puter')) localStorage.removeItem(k);
					});
					Object.keys(sessionStorage).forEach((k) => {
						if (k.includes('puter')) sessionStorage.removeItem(k);
					});

					// 2. Cookies
					document.cookie.split(';').forEach((c) => {
						document.cookie = c
							.replace(/^ +/, '')
							.replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
					});

					// 3. IndexedDB
					if (window.indexedDB.databases) {
						window.indexedDB.databases().then((dbs) => {
							dbs.forEach((db) => {
								if (db.name.toLowerCase().includes('puter')) {
									window.indexedDB.deleteDatabase(db.name);
								}
							});
						});
					}

					alert('NEURAL FINGERPRINT PURGED. REBOOTING...');
					setTimeout(() => window.location.reload(), 500);
				}
				commandBuffer = '';
			}
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleGlobalKeydown);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleGlobalKeydown);
		}
	});
</script>
