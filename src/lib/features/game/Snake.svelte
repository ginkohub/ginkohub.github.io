<script>
	import { onMount, onDestroy } from 'svelte';

	let grid = $state(20); // adjustable grid density
	/** @type {HTMLCanvasElement} */
	let canvas;
	/** @type {CanvasRenderingContext2D | null} */
	let ctx;
	let score = $state(0);
	let highHistory = $state(0);
	let gameOver = $state(false);
	let gameStarted = $state(false);
	let showSettings = $state(false);

	let snake = [{ x: 10, y: 10 }];
	let food = { x: 5, y: 5 };
	let dx = 0;
	let dy = 0;
	let nextDx = 1;
	let nextDy = 0;
	let speed = 100;
	/** @type {any} */
	let interval;

	function initGame() {
		const startPos = Math.floor(grid / 2);
		snake = [{ x: startPos, y: startPos }];
		generateFood();
		nextDx = 1;
		nextDy = 0;
		dx = 1;
		dy = 0;
		score = 0;
		gameOver = false;
		gameStarted = true;
		speed = 100;
		if (interval) clearInterval(interval);
		interval = setInterval(gameLoop, speed);
	}

	function generateFood() {
		food = {
			x: Math.floor(Math.random() * grid),
			y: Math.floor(Math.random() * grid)
		};
		if (snake.some((s) => s.x === food.x && s.y === food.y)) {
			generateFood();
		}
	}

	function gameLoop() {
		dx = nextDx;
		dy = nextDy;

		const head = { x: snake[0].x + dx, y: snake[0].y + dy };

		if (head.x < 0 || head.x >= grid || head.y < 0 || head.y >= grid) {
			endGame();
			return;
		}

		if (snake.some((s, i) => i !== 0 && s.x === head.x && s.y === head.y)) {
			endGame();
			return;
		}

		snake.unshift(head);

		if (head.x === food.x && head.y === food.y) {
			score += 10;
			generateFood();
			if (speed > 50) {
				speed -= 1;
				clearInterval(interval);
				interval = setInterval(gameLoop, speed);
			}
		} else {
			snake.pop();
		}

		draw();
	}

	function draw() {
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const cellSize = canvas.width / grid;

		// Draw Food
		ctx.fillStyle =
			getComputedStyle(document.documentElement).getPropertyValue('--accent-color') || '#10b981';
		ctx.fillRect(food.x * cellSize + 1, food.y * cellSize + 1, cellSize - 2, cellSize - 2);

		// Draw Snake
		snake.forEach((s, i) => {
			ctx.fillStyle = i === 0 ? '#fff' : 'rgba(255, 255, 255, 0.6)';
			ctx.fillRect(s.x * cellSize + 1, s.y * cellSize + 1, cellSize - 2, cellSize - 2);
		});
	}

	function endGame() {
		gameStarted = false;
		gameOver = true;
		clearInterval(interval);
		if (score > highHistory) highHistory = score;
	}

	/** @param {KeyboardEvent} e */
	function handleKey(e) {
		if (!gameStarted && e.code === 'Space' && !showSettings) {
			initGame();
			return;
		}

		switch (e.key) {
			case 'ArrowUp':
				if (dy === 0) {
					nextDx = 0;
					nextDy = -1;
				}
				break;
			case 'ArrowDown':
				if (dy === 0) {
					nextDx = 0;
					nextDy = 1;
				}
				break;
			case 'ArrowLeft':
				if (dx === 0) {
					nextDx = -1;
					nextDy = 0;
				}
				break;
			case 'ArrowRight':
				if (dx === 0) {
					nextDx = 1;
					nextDy = 0;
				}
				break;
		}
	}

	function setDir(x, y) {
		if (!gameStarted && !gameOver) {
			initGame();
			return;
		}
		if (x !== 0 && dx === 0) {
			nextDx = x;
			nextDy = 0;
		}
		if (y !== 0 && dy === 0) {
			nextDx = 0;
			nextDy = y;
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		const size = Math.min(canvas.parentElement.clientWidth, 400);
		canvas.width = size;
		canvas.height = size;
		draw();
		window.addEventListener('keydown', handleKey);
	});

	onDestroy(() => {
		clearInterval(interval);
		window.removeEventListener('keydown', handleKey);
	});

	$effect(() => {
		grid; // react to grid change
		if (canvas) draw();
	});
</script>

<div class="flex flex-col items-center space-y-6 w-full">
	<div class="flex justify-between w-full max-w-[400px] mb-2">
		<div class="flex flex-col">
			<span class="text-[8px] font-bold uppercase tracking-widest text-slate-500">Score</span>
			<span class="text-xl font-bold font-space text-white">{score}</span>
		</div>
		<div class="flex items-center gap-4">
			<button
				onclick={() => (showSettings = !showSettings)}
				class="text-[8px] font-black uppercase border border-slate-800 px-2 py-1 hover:bg-white hover:text-black transition-all"
				title="Open configuration settings"
			>
				Config
			</button>
			<div class="flex flex-col items-end">
				<span class="text-[8px] font-bold uppercase tracking-widest text-slate-500">Best</span>
				<span class="text-xl font-bold font-space text-slate-300">{highHistory}</span>
			</div>
		</div>
	</div>

	<div class="relative group border border-slate-800 bg-slate-900/50">
		<canvas bind:this={canvas} class="block shadow-2xl"></canvas>

		{#if showSettings}
			<div
				class="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-8 z-20"
			>
				<h3 class="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8">
					Grid Configuration
				</h3>

				<div class="w-full space-y-2 mb-10">
					<div class="flex justify-between text-[8px] font-bold uppercase text-slate-500">
						<span>Grid Density</span>
						<span class="text-white">{grid}x{grid}</span>
					</div>
					<input
						type="range"
						min="10"
						max="40"
						step="2"
						bind:value={grid}
						class="w-full accent-white"
					/>
					<p class="text-[7px] text-slate-600 uppercase mt-2">Higher density = Smaller blocks</p>
				</div>

				<button
					onclick={() => (showSettings = false)}
					class="w-full py-3 text-[10px] font-black uppercase tracking-widest bg-white text-black active:scale-95 transition-all"
					title="Save settings and close"
				>
					Save & Close
				</button>
			</div>
		{/if}

		{#if !gameStarted && !showSettings}
			<div
				class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all"
			>
				{#if gameOver}
					<span class="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-2"
						>System Failure</span
					>
					<span class="text-2xl font-bold text-white mb-6 font-space">GAME OVER</span>
				{:else}
					<span class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2"
						>Protocol: Snake</span
					>
					<span class="text-2xl font-bold text-white mb-6 font-space">READY?</span>
				{/if}

				<button
					onclick={initGame}
					class="px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
					style="background-color: var(--accent-color); color: #000;"
					title={gameOver ? 'Restart the game' : 'Start the game'}
				>
					{gameOver ? 'Reboot' : 'Initialize'}
				</button>
			</div>
		{/if}
	</div>

	<!-- Mobile Controls -->
	<div class="grid grid-cols-3 gap-2 w-full max-w-[200px] md:hidden pt-4">
		<div></div>
		<button
			onclick={() => setDir(0, -1)}
			class="p-4 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800"
			title="Move up">↑</button
		>
		<div></div>
		<button
			onclick={() => setDir(-1, 0)}
			class="p-4 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800"
			title="Move left">←</button
		>
		<button
			onclick={() => setDir(0, 1)}
			class="p-4 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800"
			title="Move down">↓</button
		>
		<button
			onclick={() => setDir(1, 0)}
			class="p-4 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800"
			title="Move right">→</button
		>
	</div>
</div>

<style>
	canvas {
		image-rendering: pixelated;
	}
</style>
