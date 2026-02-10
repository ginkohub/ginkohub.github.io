<script>
	import { gameState } from '../features/game/gameState.svelte';
	const gameModules = import.meta.glob('../features/game/*.svelte');

	const games = Object.entries(gameModules).map(([path, moduleFunc]) => {
		const id = path.split('/').pop().replace('.svelte', '').toLowerCase();
		return {
			id,
			name: `${path.split('/').pop().replace('.svelte', '')}.sys`,
			load: moduleFunc
		};
	});

	let ActiveGame = $state(null);

	$effect(() => {
		const game = games.find((g) => g.id === gameState.selectedGameId);
		if (game) {
			game.load().then((m) => (ActiveGame = m.default));
		}
	});
</script>

<div class="w-full space-y-10" id="section-arcade-container">
	<!-- Game Selector -->
	<div class="flex flex-wrap justify-center gap-4 border-b border-white/5 pb-6">
		{#each games as game}
			<button
				onclick={() => (gameState.selectedGameId = game.id)}
				class="flex items-center gap-2 px-4 py-2 border transition-all duration-300 group backdrop-blur-sm
				{gameState.selectedGameId === game.id
					? 'bg-white text-black border-white'
					: 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'}"
				title="Play {game.name}"
			>
				<span class="text-[9px] font-black uppercase tracking-widest">{game.name}</span>
			</button>
		{/each}
	</div>

	<!-- Active Game Container -->
	<div class="animate-in fade-in zoom-in-95 duration-500" id="section-game-viewport">
		{#if ActiveGame}
			<ActiveGame />
		{/if}
	</div>
</div>
