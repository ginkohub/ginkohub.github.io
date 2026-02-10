<script>
	import { onMount } from 'svelte';

	let { accentColor = '#0ea5e9' } = $props();

	let canvas = $state(null);
	let ctx;
	let particles = [];
	let rockets = [];
	let isActive = false;

	export function trigger(count = 1) {
		if (!ctx) return;

		// Launch rockets immediately (simultaneous volley)
		for (let i = 0; i < count; i++) {
			rockets.push({
				x: Math.random() * window.innerWidth,
				y: window.innerHeight,
				targetY: Math.random() * (window.innerHeight * 0.5),
				speed: 8 + Math.random() * 5,
				color: [accentColor, '#fff', '#00ffff', '#ff00ff'][Math.floor(Math.random() * 4)]
			});
		}
		if (!isActive) {
			isActive = true;
			animate();
		}
	}

	class Particle {
		constructor(x, y, color) {
			this.x = x;
			this.y = y;
			this.color = color;
			this.angle = Math.random() * Math.PI * 2;
			this.speed = Math.random() * 6 + 3; // More explosive power
			this.friction = 0.95;
			this.gravity = 0.06; // Slightly floatier
			this.vx = Math.cos(this.angle) * this.speed;
			this.vy = Math.sin(this.angle) * this.speed;
			this.alpha = 1;
			this.decay = Math.random() * 0.015 + 0.005;
			this.size = Math.random() * 2.5 + 1; // Slightly larger start
		}
		update() {
			this.vx *= this.friction;
			this.vy *= this.friction;
			this.vy += this.gravity;
			this.x += this.vx;
			this.y += this.vy;
			this.alpha -= this.decay;
			this.size = Math.max(0, this.size - 0.03); // Shrink over time
		}
		draw() {
			ctx.fillStyle = this.color;
			ctx.globalAlpha = this.alpha;
			ctx.fillRect(this.x, this.y, this.size, this.size);
		}
	}

	function explode(x, y, color) {
		const particleCount = 100; // Increased for fuller burst
		// Add some complementary colors to the explosion
		const colors = [color, '#ffffff', accentColor];

		for (let i = 0; i < particleCount; i++) {
			const pColor = colors[Math.floor(Math.random() * colors.length)];
			particles.push(new Particle(x, y, pColor));
		}
	}

	function animate() {
		if (!ctx) return;

		if (rockets.length === 0 && particles.length === 0) {
			ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
			isActive = false;
			return;
		}

		// Trail effect - Erase existing pixels instead of drawing black
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
		ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
		ctx.globalCompositeOperation = 'lighter';

		// Update Rockets
		for (let i = rockets.length - 1; i >= 0; i--) {
			const r = rockets[i];
			r.y -= r.speed;
			ctx.fillStyle = r.color;
			ctx.globalAlpha = 1;
			ctx.fillRect(r.x, r.y, 2, 6);
			if (r.y <= r.targetY) {
				explode(r.x, r.y, r.color);
				rockets.splice(i, 1);
			}
		}

		// Update Particles
		for (let i = particles.length - 1; i >= 0; i--) {
			const p = particles[i];
			p.update();
			p.draw();
			if (p.alpha <= 0) particles.splice(i, 1);
		}

		requestAnimationFrame(animate);
	}

	function handleResize() {
		if (canvas) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
	}

	onMount(() => {
		if (canvas) {
			ctx = canvas.getContext('2d');
			handleResize();
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<canvas bind:this={canvas} class="fixed inset-0 pointer-events-none z-[9999]"></canvas>
