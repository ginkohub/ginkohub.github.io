<script>
	import { onMount, onDestroy } from 'svelte';

	/** @type {HTMLCanvasElement} */
	let canvas;
	/** @type {CanvasRenderingContext2D | null} */
	let ctx;
	let score = $state(0);
	let highScore = $state(0);
	let gameOver = $state(false);
	let gameStarted = $state(false);

	let player = { x: 0, y: 0, size: 20 };
	/** @type {any[]} */
	let obstacles = [];
	/** @type {number} */
	let animationFrame;
	let lastTime = 0;
	let spawnTimer = 0;
	let difficulty = 1;

	function initGame() {
		if (!canvas || !canvas.parentElement) return;
		const size = Math.min(canvas.parentElement.clientWidth, 400);
		canvas.width = size;
		canvas.height = size;
		player = { x: size / 2 - 10, y: size - 40, size: 20 };
		obstacles = [];
		score = 0;
		difficulty = 1;
		spawnTimer = 0;
		gameOver = false;
		gameStarted = true;
		lastTime = performance.now();
		animate();
	}

	function spawnObstacle() {
		if (!canvas) return;
		const size = Math.random() * 30 + 10;
		obstacles.push({
			x: Math.random() * (canvas.width - size),
			y: -size,
			size: size,
			speed: (Math.random() * 2 + 2) * difficulty
		});
	}

	function animate(time = performance.now()) {
		if (!gameStarted || !ctx || !canvas) return;

		const dt = time - lastTime;
		lastTime = time;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Update difficulty
		difficulty += 0.0001 * dt;

		// Spawn
		spawnTimer += dt;
		if (spawnTimer > 400 / difficulty) {
			spawnObstacle();
			spawnTimer = 0;
		}

		// Draw Player
		ctx.fillStyle = '#fff';
		ctx.fillRect(player.x, player.y, player.size, player.size);

		// Update & Draw Obstacles
		ctx.fillStyle =
			getComputedStyle(document.documentElement).getPropertyValue('--accent-color') || '#10b981';
		for (let i = obstacles.length - 1; i >= 0; i--) {
			const o = obstacles[i];
			o.y += o.speed;

			// Collision
			if (
				player.x < o.x + o.size &&
				player.x + player.size > o.x &&
				player.y < o.y + o.size &&
				player.y + player.size > o.y
			) {
				endGame();
				return;
			}

			ctx.fillRect(o.x, o.y, o.size, o.size);

			if (o.y > canvas.height) {
				obstacles.splice(i, 1);
				score++;
			}
		}

		animationFrame = requestAnimationFrame(animate);
	}

	function endGame() {
		gameStarted = false;
		gameOver = true;
		cancelAnimationFrame(animationFrame);
		if (score > highScore) highScore = score;
	}

	/** @param {any} e */
	function handleMove(e) {
		if (!gameStarted || !canvas) return;
		const rect = canvas.getBoundingClientRect();
		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		const targetX = clientX - rect.left - player.size / 2;
		player.x = Math.max(0, Math.min(canvas.width - player.size, targetX));
	}

	/** @param {KeyboardEvent} e */
	function handleKey(e) {
		if (!gameStarted || !canvas) return;
		const step = 20;
		if (e.key === 'ArrowLeft') player.x = Math.max(0, player.x - step);
		if (e.key === 'ArrowRight') player.x = Math.min(canvas.width - player.size, player.x + step);
	}

	onMount(() => {
		if (!canvas || !canvas.parentElement) return;
		ctx = canvas.getContext('2d');
		const size = Math.min(canvas.parentElement.clientWidth, 400);
		canvas.width = size;
		canvas.height = size;
		window.addEventListener('keydown', handleKey);
	});

	onDestroy(() => {
		cancelAnimationFrame(animationFrame);
		window.removeEventListener('keydown', handleKey);
	});
</script>

<div class="flex flex-col items-center space-y-6 w-full">
	<div class="flex justify-between w-full max-w-[400px] mb-2">
		<div class="flex flex-col">
			<span class="text-[8px] font-bold uppercase tracking-widest text-slate-500">Survived</span>
			<span class="text-xl font-bold font-space text-white">{score}</span>
		</div>
		<div class="flex flex-col items-end">
			<span class="text-[8px] font-bold uppercase tracking-widest text-slate-500">Record</span>
			<span class="text-xl font-bold font-space text-slate-300">{highScore}</span>
		</div>
	</div>

	<div
		class="relative group border border-slate-800 bg-slate-900/50 touch-none"
		onmousemove={handleMove}
		ontouchmove={handleMove}
		role="presentation"
	>
		<canvas bind:this={canvas} class="block cursor-none shadow-2xl"></canvas>

		{#if !gameStarted}
			<div
				class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all"
			>
				{#if gameOver}
					<span class="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-2"
						>Structural Collapse</span
					>
					<span class="text-2xl font-bold text-white mb-6 font-space">EVADED {score}</span>
				{:else}
					<span class="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em] mb-2"
						>Protocol: Evasion</span
					>
					<span class="text-2xl font-bold text-white mb-6 font-space">READY?</span>
				{/if}

				<button
					onclick={initGame}
					class="px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
					style="background-color: var(--accent-color); color: #000;"
					title={gameOver ? 'Restart the game' : 'Start the game'}
				>
					{gameOver ? 'Repair & Retry' : 'Launch'}
				</button>

				<p class="mt-8 text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
					Slide or use arrows to dodge
				</p>
			</div>
		{/if}
	</div>
</div>
