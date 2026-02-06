<script>
	import { onMount, onDestroy } from 'svelte';

	let canvas;
	let ctx;
	let score = $state(0);
	let highScore = $state(0);
	let gameOver = $state(false);
	let gameStarted = $state(false);

	const COLS = 10;
	const ROWS = 20;
	const BLOCK_SIZE = 20;

	let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
	let currentPiece = $state(null);
	let dropCounter = 0;
	let dropInterval = 1000;
	let lastTime = 0;
	let animationFrame;

	const PIECES = [
		[[1, 1, 1, 1]], // I
		[[1, 1], [1, 1]], // O
		[[0, 1, 0], [1, 1, 1]], // T
		[[1, 0, 0], [1, 1, 1]], // L
		[[0, 0, 1], [1, 1, 1]], // J
		[[0, 1, 1], [1, 1, 0]], // S
		[[1, 1, 0], [0, 1, 1]]  // Z
	];

	function createPiece() {
		const shape = PIECES[Math.floor(Math.random() * PIECES.length)];
		return {
			pos: { x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 },
			shape: shape
		};
	}

	function collide(grid, piece) {
		const [s, p] = [piece.shape, piece.pos];
		for (let y = 0; y < s.length; ++y) {
			for (let x = 0; x < s[y].length; ++x) {
				if (s[y][x] !== 0 &&
					(grid[y + p.y] && grid[y + p.y][x + p.x]) !== 0) {
					return true;
				}
			}
		}
		return false;
	}

	function merge(grid, piece) {
		piece.shape.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value !== 0) {
					grid[y + piece.pos.y][x + piece.pos.x] = 1;
				}
			});
		});
	}

	function rotate(matrix) {
		return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
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
		outer: for (let y = grid.length - 1; y > 0; --y) {
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
			// Speed up
			if (dropInterval > 100) dropInterval -= 10;
		}
	}

	function initGame() {
		grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
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
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color') || '#10b981';

		// Draw background grid
		ctx.strokeStyle = 'rgba(255,255,255,0.05)';
		ctx.lineWidth = 0.5;
		for(let x=0; x<=COLS; x++) {
			ctx.beginPath();
			ctx.moveTo(x * BLOCK_SIZE, 0);
			ctx.lineTo(x * BLOCK_SIZE, ROWS * BLOCK_SIZE);
			ctx.stroke();
		}
		for(let y=0; y<=ROWS; y++) {
			ctx.beginPath();
			ctx.moveTo(0, y * BLOCK_SIZE);
			ctx.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE);
			ctx.stroke();
		}

		// Draw arena
		grid.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value !== 0) {
					ctx.fillStyle = 'rgba(255,255,255,0.8)';
					ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
				}
			});
		});

		// Draw piece
		if (currentPiece) {
			ctx.fillStyle = accent;
			currentPiece.shape.forEach((row, y) => {
				row.forEach((value, x) => {
					if (value !== 0) {
						ctx.fillRect((x + currentPiece.pos.x) * BLOCK_SIZE + 1, (y + currentPiece.pos.y) * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
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

	function handleKey(e) {
		if (!gameStarted) return;
		if (e.key === 'ArrowLeft') playerMove(-1);
		if (e.key === 'ArrowRight') playerMove(1);
		if (e.key === 'ArrowDown') playerDrop();
		if (e.key === 'ArrowUp') playerRotate();
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		canvas.width = COLS * BLOCK_SIZE;
		canvas.height = ROWS * BLOCK_SIZE;
		window.addEventListener('keydown', handleKey);
		draw();
	});

	onDestroy(() => {
		cancelAnimationFrame(animationFrame);
		window.removeEventListener('keydown', handleKey);
	});
</script>

<div class="flex flex-col items-center space-y-6 w-full">
	<div class="flex justify-between w-full max-w-[200px] mb-2">
		<div class="flex flex-col">
			<span class="text-[8px] font-bold uppercase tracking-widest text-slate-500">Score</span>
			<span class="text-xl font-bold font-space text-white">{score}</span>
		</div>
		<div class="flex flex-col items-end">
			<span class="text-[8px] font-bold uppercase tracking-widest text-slate-500">Best</span>
			<span class="text-xl font-bold font-space text-slate-300">{highScore}</span>
		</div>
	</div>

	<div class="relative group border border-slate-800 bg-slate-900/50">
		<canvas bind:this={canvas} class="block shadow-2xl"></canvas>

		{#if !gameStarted}
			<div class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
				{#if gameOver}
					<span class="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-2">Matrix Overflow</span>
					<span class="text-2xl font-bold text-white mb-6 font-space">STACK FULL</span>
				{:else}
					<span class="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] mb-2">Protocol: Tertlis</span>
					<span class="text-2xl font-bold text-white mb-6 font-space">READY?</span>
				{/if}
				
				<button 
					onclick={initGame}
					class="px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
					style="background-color: var(--accent-color); color: #000;"
				>
					{gameOver ? 'Clear Buffer' : 'Initialize'}
				</button>
			</div>
		{/if}
	</div>

	<!-- Mobile Controls -->
	<div class="grid grid-cols-3 gap-2 w-full max-w-[240px] md:hidden pt-4">
		<button onclick={() => playerRotate()} class="p-4 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800 col-span-3">ROTATE</button>
		<button onclick={() => playerMove(-1)} class="p-4 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800">←</button>
		<button onclick={() => playerDrop()} class="p-4 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800">↓</button>
		<button onclick={() => playerMove(1)} class="p-4 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800">→</button>
	</div>
</div>
