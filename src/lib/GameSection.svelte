<script>
	import SnakeGame from './SnakeGame.svelte';
	import FallingBlocks from './FallingBlocks.svelte';
	import Tetris from './Tetris.svelte';
	
	let selectedGame = $state('snake');
	
	const games = [
		{ id: 'snake', name: 'Snake.exe', icon: '🐍' },
		{ id: 'evasion', name: 'Evasion.sys', icon: '🛡️' },
		{ id: 'tetris', name: 'Tetris.sys', icon: '🧱' }
	];
</script>

<div class="w-full space-y-10">
	<!-- Game Selector -->
	<div class="flex flex-wrap justify-center gap-4 border-b border-slate-800/50 pb-6">
		{#each games as game}
			<button 
				onclick={() => selectedGame = game.id}
				class="flex items-center gap-2 px-4 py-2 border transition-all duration-300 group
				{selectedGame === game.id 
					? 'bg-white text-black border-white' 
					: 'border-slate-800 text-slate-500 hover:border-slate-600'}"
			>
				<span class="text-xs group-hover:scale-110 transition-transform">{game.icon}</span>
				<span class="text-[9px] font-black uppercase tracking-widest">{game.name}</span>
			</button>
		{/each}
	</div>

	<!-- Active Game Container -->
	<div class="animate-in fade-in zoom-in-95 duration-500">
		{#if selectedGame === 'snake'}
			<SnakeGame />
		{:else if selectedGame === 'evasion'}
			<FallingBlocks />
		{:else if selectedGame === 'tetris'}
			<Tetris />
		{/if}
	</div>
</div>