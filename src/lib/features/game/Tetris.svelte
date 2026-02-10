<script>
	import { onMount, onDestroy, untrack } from 'svelte';

	/** @type {HTMLCanvasElement} */
	let canvas;
	/** @type {CanvasRenderingContext2D | null} */
	let ctx;
	let score = $state(0);
	let highScore = $state(0);
	let gameOver = $state(false);
	let gameStarted = $state(false);
	let showSettings = $state(false);

	let cols = $state(10);
	const ROWS = 20;
	let blockSize = $state(20);

	/** @type {number[][]} */
	let grid = $state(Array.from({ length: ROWS }, () => Array(10).fill(0)));
	/** @type {any} */
	let currentPiece = $state(null);
	let dropCounter = 0;
	let dropInterval = 1000;
	let lastTime = 0;
	/** @type {number} */
	let animationFrame;

	const PIECES = [
		[[1, 1, 1, 1]], // I
		[
			[1, 1],
			[1, 1]
		], // O
		[
			[0, 1, 0],
			[1, 1, 1]
		], // T
		[
			[1, 0, 0],
			[1, 1, 1]
		], // L
		[
			[0, 0, 1],
			[1, 1, 1]
		], // J
		[
			[0, 1, 1],
			[1, 1, 0]
		], // S
		[
			[1, 1, 0],
			[0, 1, 1]
		] // Z
	];

	function createPiece() {
		const shape = PIECES[Math.floor(Math.random() * PIECES.length)];
		return {
			pos: { x: Math.floor(cols / 2) - Math.floor(shape[0].length / 2), y: 0 },
			shape: shape
		};
	}

	function collide(arena, piece) {
		const [s, p] = [piece.shape, piece.pos];
		for (let y = 0; y < s.length; ++y) {
			for (let x = 0; x < s[y].length; ++x) {
				if (s[y][x] !== 0) {
					const boardY = y + p.y;
					const boardX = x + p.x;
					// Wall, Floor, or Occupied Cell check
					if (
						boardX < 0 ||
						boardX >= cols ||
						boardY >= ROWS ||
						(arena[boardY] && arena[boardY][boardX] !== 0)
					) {
						return true;
					}
				}
			}
		}
		return false;
	}

	function merge(arena, piece) {
		piece.shape.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value !== 0) {
					const boardY = y + piece.pos.y;
					const boardX = x + piece.pos.x;
					if (arena[boardY]) {
						arena[boardY][boardX] = 1;
					}
				}
			});
		});
	}

	function rotate(matrix) {
		return matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());
	}

	function playerRotate() {
		const pos = currentPiece.pos.x;
		let offset = 1;
		currentPiece.shape = rotate(currentPiece.shape);
		while (collide(grid, currentPiece)) {
			currentPiece.pos.x += offset;
			offset = -(offset + (offset > 0 ? 1 : -1));
			if (offset > currentPiece.shape[0].length) {
				currentPiece.shape = rotate(rotate(rotate(currentPiece.shape)));
				currentPiece.pos.x = pos;
				return;
			}
		}
	}

	function playerDrop() {
		currentPiece.pos.y++;
		if (collide(grid, currentPiece)) {
			currentPiece.pos.y--;
			merge(grid, currentPiece);
			playerReset();
			arenaSweep();
		}
		dropCounter = 0;
	}

	function playerMove(dir) {
		currentPiece.pos.x += dir;
		if (collide(grid, currentPiece)) {
			currentPiece.pos.x -= dir;
		}
	}

	function playerReset() {
		currentPiece = createPiece();
		if (collide(grid, currentPiece)) {
			endGame();
		}
	}

	function arenaSweep() {
		let rowCount = 1;
		outer: for (let y = grid.length - 1; y >= 0; --y) {
			for (let x = 0; x < grid[y].length; ++x) {
				if (grid[y][x] === 0) {
					continue outer;
				}
			}
			const row = grid.splice(y, 1)[0].fill(0);
			grid.unshift(row);
			++y;
			score += rowCount * 10;
			rowCount *= 2;
			if (dropInterval > 100) dropInterval -= 10;
		}
	}

	function initGame() {
		grid = Array.from({ length: ROWS }, () => Array(cols).fill(0));
		score = 0;
		dropInterval = 1000;
		gameOver = false;
		gameStarted = true;
		currentPiece = createPiece();
		lastTime = performance.now();
		animate();
	}

	function animate(time = performance.now()) {
		if (!gameStarted) return;
		const deltaTime = time - lastTime;
		lastTime = time;

		dropCounter += deltaTime;
		if (dropCounter > dropInterval) {
			playerDrop();
		}

		draw();
		animationFrame = requestAnimationFrame(animate);
	}

	function draw() {
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const accent =
			getComputedStyle(document.documentElement).getPropertyValue('--accent-color') || '#10b981';

		// Draw arena
		grid.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value !== 0) {
					ctx.fillStyle = 'rgba(255,255,255,0.8)';
					ctx.fillRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, blockSize - 2);
				}
			});
		});

		// Draw piece
		if (currentPiece) {
			ctx.fillStyle = accent;
			currentPiece.shape.forEach((row, y) => {
				row.forEach((value, x) => {
					if (value !== 0) {
						ctx.fillRect(
							(x + currentPiece.pos.x) * blockSize + 1,
							(y + currentPiece.pos.y) * blockSize + 1,
							blockSize - 2,
							blockSize - 2
						);
					}
				});
			});
		}
	}

	function endGame() {
		gameStarted = false;
		gameOver = true;
		cancelAnimationFrame(animationFrame);
		if (score > highScore) highScore = score;
	}

	/** @param {KeyboardEvent} e */
	function handleKey(e) {
		if (!gameStarted || showSettings) return;
		if (e.key === 'ArrowLeft') playerMove(-1);
		if (e.key === 'ArrowRight') playerMove(1);
		if (e.key === 'ArrowDown') playerDrop();
		if (e.key === 'ArrowUp') playerRotate();
	}

	function updateCanvas() {
		if (!canvas) return;
		canvas.width = cols * blockSize;
		canvas.height = ROWS * blockSize;
		// Only reset grid if game is NOT running
		if (!gameStarted) {
			grid = Array.from({ length: ROWS }, () => Array(cols).fill(0));
		}
		draw();
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		updateCanvas();
		window.addEventListener('keydown', handleKey);
	});

	onDestroy(() => {
		cancelAnimationFrame(animationFrame);
		window.removeEventListener('keydown', handleKey);
	});

	$effect(() => {
		blockSize;
		cols;
		untrack(() => updateCanvas());
	});
</script>

<div class="flex flex-col items-center space-y-6 w-full">
	<div class="flex justify-between w-full max-w-[240px] mb-2">
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
				<span class="text-xl font-bold font-space text-slate-300">{highScore}</span>
			</div>
		</div>
	</div>

	<div class="relative group border border-slate-800 bg-slate-900/50">
		<canvas bind:this={canvas} class="block shadow-2xl"></canvas>

		{#if showSettings}
			<div
				class="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6 z-20"
			>
				<h3 class="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6">
					Matrix Config
				</h3>

				<div class="w-full space-y-4 mb-8">
					<div class="space-y-1">
						<div class="flex justify-between text-[7px] font-bold uppercase text-slate-500">
							<span>Block Size</span>
							<span class="text-white">{blockSize}px</span>
						</div>
						<input
							type="range"
							min="15"
							max="35"
							step="1"
							bind:value={blockSize}
							class="w-full accent-white"
						/>
					</div>

					<div class="space-y-1">
						<div class="flex justify-between text-[7px] font-bold uppercase text-slate-500">
							<span>Columns</span>
							<span class="text-white">{cols}</span>
						</div>
						<input
							type="range"
							min="8"
							max="16"
							step="1"
							bind:value={cols}
							class="w-full accent-white"
							disabled={gameStarted}
						/>
						{#if gameStarted}
							<p class="text-[6px] text-rose-500 uppercase">End game to change width</p>
						{/if}
					</div>
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
				class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
			>
				{#if gameOver}
					<span class="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-2"
						>Matrix Overflow</span
					>
					<span class="text-2xl font-bold text-white mb-6 font-space">STACK FULL</span>
				{:else}
					<span class="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] mb-2"
						>Protocol: Tetris</span
					>
					<span class="text-2xl font-bold text-white mb-6 font-space">READY?</span>
				{/if}

				<button
					onclick={initGame}
					class="px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
					style="background-color: var(--accent-color); color: #000;"
					title={gameOver ? 'Restart the game' : 'Start the game'}
				>
					{gameOver ? 'Clear Buffer' : 'Initialize'}
				</button>
			</div>
		{/if}
	</div>

	<!-- Mobile Controls -->
	<div class="grid grid-cols-3 gap-2 w-full max-w-[240px] md:hidden pt-4">
		<button
			onclick={() => playerRotate()}
			class="p-4 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800 col-span-3"
			title="Rotate piece">ROTATE</button
		>
		<button
			onclick={() => playerMove(-1)}
			class="p-4 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800"
			title="Move left">←</button
		>
		<button
			onclick={() => playerDrop()}
			class="p-4 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800"
			title="Move down">↓</button
		>
		<button
			onclick={() => playerMove(1)}
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
