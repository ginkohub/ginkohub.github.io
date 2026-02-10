<script>
	import { onMount, onDestroy } from 'svelte';

	/** @type {HTMLCanvasElement} */
	let canvas;
	/** @type {CanvasRenderingContext2D | null} */
	let ctx;
	let playerScore = $state(0);
	let aiScore = $state(0);
	let gameStarted = $state(false);
	/** @type {number} */
	let animationFrame;

	// Game objects
	let ball = { x: 0, y: 0, size: 8, dx: 0, dy: 0, speed: 4 };
	let player = { x: 10, y: 0, w: 8, h: 60 };
	let ai = { x: 0, y: 0, w: 8, h: 60 };

	// Canvas dimensions
	let width = 0;
	let height = 0;

	// Controls
	let upPressed = false;
	let downPressed = false;

	function initGame() {
		resetBall();
		playerScore = 0;
		aiScore = 0;
		gameStarted = true;

		// Set initial paddle positions
		player.y = height / 2 - player.h / 2;
		ai.y = height / 2 - ai.h / 2;
		ai.x = width - ai.w - 10;

		cancelAnimationFrame(animationFrame);
		gameLoop();
	}

	function resetBall() {
		ball.x = width / 2;
		ball.y = height / 2;
		ball.speed = 4;

		// Randomize start direction
		const dirX = Math.random() > 0.5 ? 1 : -1;
		const dirY = (Math.random() * 2 - 1) * 0.5; // flatter angle

		// Normalize and scale
		const len = Math.sqrt(dirX * dirX + dirY * dirY);
		ball.dx = (dirX / len) * ball.speed;
		ball.dy = (dirY / len) * ball.speed;
	}

	function update() {
		// Player Movement
		if (upPressed) player.y -= 6;
		if (downPressed) player.y += 6;

		// Boundary checks (Player)
		if (player.y < 0) player.y = 0;
		if (player.y > height - player.h) player.y = height - player.h;

		// AI Movement (Simple tracking)
		const aiCenter = ai.y + ai.h / 2;
		if (aiCenter < ball.y - 10)
			ai.y += 4.5; // slightly slower than player
		else if (aiCenter > ball.y + 10) ai.y -= 4.5;

		// Boundary checks (AI)
		if (ai.y < 0) ai.y = 0;
		if (ai.y > height - ai.h) ai.y = height - ai.h;

		// Ball Movement
		ball.x += ball.dx;
		ball.y += ball.dy;

		// Ball Collision: Top/Bottom
		if (ball.y < 0 || ball.y > height) {
			ball.dy *= -1;
		}

		// Ball Collision: Paddles
		if (
			ball.x < player.x + player.w &&
			ball.x > player.x &&
			ball.y > player.y &&
			ball.y < player.y + player.h
		) {
			// Hit player
			ball.dx *= -1.1; // speed up
			ball.x = player.x + player.w; // unstuck
			// Add english based on where it hit the paddle
			const hitPoint = ball.y - (player.y + player.h / 2);
			ball.dy = hitPoint * 0.2;
		}

		if (ball.x > ai.x && ball.x < ai.x + ai.w && ball.y > ai.y && ball.y < ai.y + ai.h) {
			// Hit AI
			ball.dx *= -1.1;
			ball.x = ai.x - ball.size; // unstuck
			const hitPoint = ball.y - (ai.y + ai.h / 2);
			ball.dy = hitPoint * 0.2;
		}

		// Scoring
		if (ball.x < 0) {
			aiScore++;
			resetBall();
		} else if (ball.x > width) {
			playerScore++;
			resetBall();
		}
	}

	function draw() {
		if (!ctx) return;

		// Clear with trail effect? No, clean for now.
		ctx.clearRect(0, 0, width, height);

		// Center Line
		ctx.strokeStyle = '#333';
		ctx.lineWidth = 2;
		ctx.setLineDash([5, 5]);
		ctx.beginPath();
		ctx.moveTo(width / 2, 0);
		ctx.lineTo(width / 2, height);
		ctx.stroke();
		ctx.setLineDash([]);

		const accent =
			getComputedStyle(document.documentElement).getPropertyValue('--accent-color') || '#fff';
		ctx.fillStyle = '#fff';

		// Draw Paddles
		ctx.fillRect(player.x, player.y, player.w, player.h);
		ctx.fillRect(ai.x, ai.y, ai.w, ai.h);

		// Draw Ball (Accent Color)
		ctx.fillStyle = accent;
		ctx.fillRect(ball.x - ball.size / 2, ball.y - ball.size / 2, ball.size, ball.size);
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
		if (e.code === 'ArrowUp') upPressed = e.type === 'keydown';
		if (e.code === 'ArrowDown') downPressed = e.type === 'keydown';
	}

	function resize() {
		if (canvas && canvas.parentElement) {
			const size = Math.min(canvas.parentElement.clientWidth, 600);
			width = size;
			height = size * 0.6; // 5:3 Aspect Ratio
			canvas.width = width;
			canvas.height = height;

			// Recalculate AI X pos
			ai.x = width - ai.w - 10;

			if (!gameStarted) {
				// Initial draw if not playing
				player.y = height / 2 - player.h / 2;
				ai.y = height / 2 - ai.h / 2;
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
			<span class="text-[8px] font-bold uppercase tracking-widest text-slate-500">Player</span>
			<span class="text-xl font-bold font-space text-white">{playerScore}</span>
		</div>
		<div class="flex flex-col items-end">
			<span class="text-[8px] font-bold uppercase tracking-widest text-slate-500">CPU</span>
			<span class="text-xl font-bold font-space text-slate-300">{aiScore}</span>
		</div>
	</div>

	<div class="relative group border border-slate-800 bg-slate-900/50 w-full max-w-[600px]">
		<canvas bind:this={canvas} class="block w-full h-auto shadow-2xl"></canvas>

		{#if !gameStarted}
			<div
				class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all"
			>
				<span class="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-2"
					>Protocol: Pong</span
				>
				<span class="text-2xl font-bold text-white mb-6 font-space">READY?</span>

				<button
					onclick={initGame}
					class="px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
					style="background-color: var(--accent-color); color: #000;"
					title="Start the game"
				>
					Initialize
				</button>
			</div>
		{/if}
	</div>

	<!-- Mobile Controls -->
	<div class="flex w-full max-w-[600px] gap-2 md:hidden pt-4 h-32">
		<button
			ontouchstart={(e) => {
				e.preventDefault();
				upPressed = true;
			}}
			ontouchend={(e) => {
				e.preventDefault();
				upPressed = false;
			}}
			onmousedown={() => (upPressed = true)}
			onmouseup={() => (upPressed = false)}
			class="flex-1 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800 flex items-center justify-center"
			title="Move paddle up"
		>
			UP
		</button>
		<button
			ontouchstart={(e) => {
				e.preventDefault();
				downPressed = true;
			}}
			ontouchend={(e) => {
				e.preventDefault();
				downPressed = false;
			}}
			onmousedown={() => (downPressed = true)}
			onmouseup={() => (downPressed = false)}
			class="flex-1 bg-slate-900 border border-slate-800 text-white text-xl active:bg-slate-800 flex items-center justify-center"
			title="Move paddle down"
		>
			DOWN
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
