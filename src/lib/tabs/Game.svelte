<script>
	const gameModules = import.meta.glob('../features/game/*.svelte');

	const games = Object.entries(gameModules).map(([path, moduleFunc]) => {
		const id = path.split('/').pop().replace('.svelte', '').toLowerCase();
		return {
			id,
			name: `${path.split('/').pop().replace('.svelte', '')}.sys`,
			load: moduleFunc
		};
	});

	let selectedGameId = $state(games[0]?.id || '');
	let ActiveGame = $state(null);

	$effect(() => {
		const game = games.find((g) => g.id === selectedGameId);
		if (game) {
			game.load().then((m) => (ActiveGame = m.default));
		}
	});
</script>

<div class="w-full space-y-10">
	<!-- Game Selector -->
	<div class="flex flex-wrap justify-center gap-4 border-b border-slate-800/50 pb-6">
		{#each games as game}
			<button
				onclick={() => (selectedGameId = game.id)}
				class="flex items-center gap-2 px-4 py-2 border transition-all duration-300 group
				{selectedGameId === game.id
					? 'bg-white text-black border-white'
					: 'border-slate-800 text-slate-500 hover:border-slate-600'}"
			>
				<span class="text-[9px] font-black uppercase tracking-widest">{game.name}</span>
			</button>
		{/each}
	</div>

	<!-- Active Game Container -->
	<div class="animate-in fade-in zoom-in-95 duration-500">
		{#if ActiveGame}
			<ActiveGame />
		{/if}
	</div>
</div>
