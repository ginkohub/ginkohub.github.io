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
					Object.keys(localStorage).forEach((k) => localStorage.removeItem(k));
					Object.keys(sessionStorage).forEach((k) => sessionStorage.removeItem(k));
					document.cookie.split(';').forEach((c) => {
						document.cookie = c
							.replace(/^ +/, '')
							.replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
					});
					alert('SESSION PURGED. REBOOTING...');
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
