<script>
	import { onMount, onDestroy } from 'svelte';

	/** @type {HTMLCanvasElement} */
	let canvas;
	/** @type {CanvasRenderingContext2D | null} */
	let ctx;
	let score = $state(0);
	let lives = $state(3);
	let gameStarted = $state(false);
	let gameOver = $state(false);
	/** @type {number} */
	let animationFrame;

	// Game objects
	let ball = { x: 0, y: 0, r: 4, dx: 3, dy: -3, speed: 4 };
	let paddle = { x: 0, y: 0, w: 60, h: 8, dx: 0, speed: 6 };
	/** @type {any[]} */
	let bricks = $state([]);
	let brickRowCount = 5;
	let brickColumnCount = 7;
	let brickWidth = 0;
	let brickHeight = 15;
	let brickPadding = 6;
	let brickOffsetTop = 30;
	let brickOffsetLeft = 20;

	// Canvas dimensions
	let width = 0;
	let height = 0;

	// Controls
	let rightPressed = false;
	let leftPressed = false;

	function initGame() {
		score = 0;
		lives = 3;
		gameOver = false;
		gameStarted = true;
		resetBallPaddle();
		createBricks();
		cancelAnimationFrame(animationFrame);
		gameLoop();
	}

	function createBricks() {
		bricks = [];
		// Calculate dynamic brick width based on canvas
		brickWidth =
			(width - brickOffsetLeft * 2 - brickPadding * (brickColumnCount - 1)) / brickColumnCount;

		for (let c = 0; c < brickColumnCount; c++) {
			bricks[c] = [];
			for (let r = 0; r < brickRowCount; r++) {
				bricks[c][r] = { x: 0, y: 0, status: 1 };
			}
		}
	}

	function resetBallPaddle() {
		paddle.x = (width - paddle.w) / 2;
		paddle.y = height - 20;
		ball.x = width / 2;
		ball.y = height - 30;
		ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
		ball.dy = -3;
	}

	function collisionDetection() {
		for (let c = 0; c < brickColumnCount; c++) {
			for (let r = 0; r < brickRowCount; r++) {
				let b = bricks[c][r];
				if (b.status === 1) {
					if (
						ball.x > b.x &&
						ball.x < b.x + brickWidth &&
						ball.y > b.y &&
						ball.y < b.y + brickHeight
					) {
						ball.dy = -ball.dy;
						b.status = 0;
						score += 10;

						// Check win
						if (score === brickRowCount * brickColumnCount * 10) {
							// Reset bricks
							createBricks();
							ball.speed += 1;
						}
					}
				}
			}
		}
	}

	function update() {
		// Move Paddle
		if (rightPressed && paddle.x < width - paddle.w) {
			paddle.x += paddle.speed;
		} else if (leftPressed && paddle.x > 0) {
			paddle.x -= paddle.speed;
		}

		// Move Ball
		ball.x += ball.dx;
		ball.y += ball.dy;

		// Wall Collision
		if (ball.x + ball.dx > width - ball.r || ball.x + ball.dx < ball.r) {
			ball.dx = -ball.dx;
		}
		if (ball.y + ball.dy < ball.r) {
			ball.dy = -ball.dy;
		} else if (ball.y + ball.dy > height - ball.r) {
			// Check paddle hit
			if (ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
				// Paddle hit logic
				ball.dy = -ball.dy;
				// Speed up slightly
				ball.dx = ball.dx > 0 ? ball.dx + 0.1 : ball.dx - 0.1;
				ball.dy = ball.dy > 0 ? ball.dy + 0.1 : ball.dy - 0.1;
			} else {
				// Loss of life
				lives--;
				if (!lives) {
					gameOver = true;
					gameStarted = false;
				} else {
					resetBallPaddle();
				}
			}
		}

		collisionDetection();
	}

	function draw() {
		if (!ctx) return;

		ctx.clearRect(0, 0, width, height);

		const accent =
			getComputedStyle(document.documentElement).getPropertyValue('--accent-color') || '#fff';

		// Draw Bricks
		for (let c = 0; c < brickColumnCount; c++) {
			for (let r = 0; r < brickRowCount; r++) {
				if (bricks[c][r].status === 1) {
					let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
					let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
					bricks[c][r].x = brickX;
					bricks[c][r].y = brickY;

					ctx.fillStyle = r % 2 === 0 ? '#fff' : accent;
					ctx.globalAlpha = 0.8;
					ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
					ctx.globalAlpha = 1.0;
				}
			}
		}

		// Draw Paddle
		ctx.fillStyle = '#fff';
		ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

		// Draw Ball
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
		ctx.fillStyle = accent;
		ctx.fill();
		ctx.closePath();
	}

	function gameLoop() {
		if (!gameStarted) return;
		update();
		draw();
		animationFrame = requestAnimationFrame(gameLoop);
	}

	/** @param {KeyboardEvent} e */
	function handleKey(e) {
		if (e.repeat) return;
		if (e.code === 'ArrowRight') rightPressed = e.type === 'keydown';
		if (e.code === 'ArrowLeft') leftPressed = e.type === 'keydown';
	}

	function resize() {
		if (canvas && canvas.parentElement) {
			const size = Math.min(canvas.parentElement.clientWidth, 600);
			width = size;
			height = size * 0.75; // 4:3 Aspect
			canvas.width = width;
			canvas.height = height;

			// Recalculate paddle Y
			paddle.y = height - 20;

			// Re-layout bricks if size changed
			if (!gameStarted && bricks.length === 0) {
				createBricks();
			} else if (bricks.length > 0) {
				// Update brick dimensions only
				brickWidth =
					(width - brickOffsetLeft * 2 - brickPadding * (brickColumnCount - 1)) / brickColumnCount;
			}

			if (!gameStarted) {
				resetBallPaddle();
				draw();
			}
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('keydown', handleKey);
		window.addEventListener('keyup', handleKey);
		createBricks();
		resetBallPaddle();
		draw();
	});

	onDestroy(() => {
		window.removeEventListener('resize', resize);
		window.removeEventListener('keydown', handleKey);
		window.removeEventListener('keyup', handleKey);
		cancelAnimationFrame(animationFrame);
	});
</script>

<div class="flex flex-col items-center space-y-6 w-full">
	<div class="flex justify-between w-full max-w-[600px] mb-2 px-4">
		<div class="flex flex-col">
			<span class="text-[8px] font-bold uppercase tracking-widest text-slate-500">Score</span>
			<span class="text-xl font-bold font-space text-white">{score}</span>
		</div>
		<div class="flex flex-col items-end">
			<span class="text-[8px] font-bold uppercase tracking-widest text-slate-500">Lives</span>
			<div class="flex gap-1">
				{#each Array(lives) as _, i}
					<div class="w-3 h-3 bg-white rounded-full"></div>
				{/each}
			</div>
		</div>
	</div>

	<div class="relative group border border-slate-800 bg-slate-900/50 w-full max-w-[600px]">
		<canvas bind:this={canvas} class="block w-full h-auto shadow-2xl"></canvas>

		{#if !gameStarted}
			<div
				class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all"
			>
				{#if gameOver}
					<span class="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-2"
						>Sector Lost</span
					>
					<span class="text-2xl font-bold text-white mb-6 font-space">GAME OVER</span>
				{:else}
					<span class="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2"
						>Protocol: Breakout</span
					>
					<span class="text-2xl font-bold text-white mb-6 font-space">READY?</span>
				{/if}

				<button
					onclick={initGame}
					class="px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
					style="background-color: var(--accent-color); color: #000;"
					title={gameOver ? 'Restart the game' : 'Start the game'}
				>
					{gameOver ? 'Retry' : 'Initialize'}
				</button>
			</div>
		{/if}
	</div>

	<!-- Mobile Controls -->
	<div class="flex w-full max-w-[600px] gap-2 md:hidden pt-4 h-32">
		<button
			ontouchstart={(e) => {
				e.preventDefault();
				leftPressed = true;
			}}
			ontouchend={(e) => {
				e.preventDefault();
				leftPressed = false;
			}}
			onmousedown={() => (leftPressed = true)}
			onmouseup={() => (leftPressed = false)}
			class="flex-1 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800 flex items-center justify-center"
			title="Move paddle left"
		>
			LEFT
		</button>
		<button
			ontouchstart={(e) => {
				e.preventDefault();
				rightPressed = true;
			}}
			ontouchend={(e) => {
				e.preventDefault();
				rightPressed = false;
			}}
			onmousedown={() => (rightPressed = true)}
			onmouseup={() => (rightPressed = false)}
			class="flex-1 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800 flex items-center justify-center"
			title="Move paddle right"
		>
			RIGHT
		</button>
	</div>

	<p class="text-[8px] text-slate-600 uppercase tracking-widest hidden md:block">
		Use Arrow Keys to Move
	</p>
</div>

<style>
	canvas {
		image-rendering: pixelated;
	}
</style>
