type Leaf = { x: number; y: number; r: number; p: number; o: number; b: number };
type Branch = {
	d: number;
	len: number;
	w: number;
	a: number;
	p: number;
	f: number;
	kids: Branch[];
	leaves: Leaf[];
};

export type Storm = {
	start: () => void;
	stop: () => void;
	setHD: (on: boolean) => void;
	destroy: () => void;
};

const BARK = ['#4a1020', '#73223a', '#a04e6b', '#cf86a0'];
const LIT = ['#e0b4ca', '#efc6da', '#f7d6e8', '#ffe4f2'];

export function createStorm(
	canvas: HTMLCanvasElement,
	audio: HTMLAudioElement,
	onTime: (t: number) => void
): Storm {
	const g = canvas.getContext('2d', { alpha: false })!;
	const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const coarse = matchMedia('(pointer: coarse)').matches || window.innerWidth < 800;
	let low = coarse;
	let hd = !low;
	let D = low ? 7 : 9;

	let running = false;
	let level = 0;
	let audioCtx: AudioContext | undefined;
	let analyser: AnalyserNode | undefined;
	let freq = new Uint8Array(0);

	let W = 0,
		H = 0,
		L = 0,
		dpr = 1;
	let hazeGrad: CanvasGradient;
	let moonGlow: CanvasGradient;
	let bgBack: HTMLCanvasElement;
	let bgFront: HTMLCanvasElement;

	let bark: string[] = [];
	let lit: string[] = [];

	function buildPalette() {
		bark = [];
		lit = [];
		for (let d = 0; d <= D; d++) {
			bark.push(`hsl(350 25% ${7 + d * 1.1}%)`);
			lit.push(`hsl(340 30% ${40 + d * 2.2}%)`);
		}
	}

	function layer(paint: (c: CanvasRenderingContext2D) => void) {
		const s = document.createElement('canvas');
		s.width = canvas.width;
		s.height = canvas.height;
		const c = s.getContext('2d')!;
		c.setTransform(dpr, 0, 0, dpr, 0, 0);
		paint(c);
		return s;
	}

	function buildStatic() {
		bgBack = layer((c) => {
			const sky = c.createLinearGradient(0, 0, 0, H);
			sky.addColorStop(0, '#070b11');
			sky.addColorStop(0.55, '#17222e');
			sky.addColorStop(0.85, '#293847');
			c.fillStyle = sky;
			c.fillRect(0, 0, W, H);
		});

		bgFront = layer((c) => {
			ridge(c, 0.78, 0.025, '#131b20', 1);
			ridge(c, 0.84, 0.02, '#0e1712', 3);
			c.fillStyle = '#050906';
			c.beginPath();
			c.moveTo(0, H * 0.9);
			c.quadraticCurveTo(W * 0.5, H * 0.8, W, H * 0.9);
			c.lineTo(W, H);
			c.lineTo(0, H);
			c.fill();
		});
	}

	function size() {
		dpr = Math.min(devicePixelRatio || 1, hd ? 1.2 : 1);
		W = window.innerWidth;
		H = window.innerHeight;
		canvas.width = W * dpr;
		canvas.height = H * dpr;
		g.setTransform(dpr, 0, 0, dpr, 0, 0);
		L = Math.min(H * 0.13, W * 0.2);

		hazeGrad = g.createLinearGradient(0, H * 0.55, 0, H * 0.86);
		hazeGrad.addColorStop(0, 'rgba(60,75,90,0)');
		hazeGrad.addColorStop(1, 'rgba(60,75,90,.15)');

		const mx = W * 0.86,
			my = H * 0.12,
			mr = coarse ? 24 : 45;
		moonGlow = g.createRadialGradient(mx, my, mr * 3.6, mx, my, mr * 7.2);
		moonGlow.addColorStop(0, 'rgba(200,210,255,.09)');
		moonGlow.addColorStop(1, 'rgba(200,210,255,0)');

		buildStatic();
	}

	let clouds: { x: number; z: number; y: number; r: number }[] = [];
	let cloudSprites: HTMLCanvasElement[] = [];

	function makeClouds() {
		clouds = Array.from({ length: low ? 2 : 9 }, () => {
			const z = Math.random();
			return { x: Math.random() * 1500, z, y: 0.03 + z * 0.3, r: 0.14 + Math.random() * 0.14 };
		});
	}

	function buildCloudSprites() {
		cloudSprites = clouds.map((c) => {
			const r = c.r * W;
			const s = document.createElement('canvas');
			s.width = Math.max(2, Math.round(r * 4.4 * 0.5));
			s.height = Math.max(2, Math.round(r * 1.3 * 0.5));
			const sg = s.getContext('2d')!;
			sg.translate(s.width / 2, s.height / 2);
			sg.scale(0.5, 0.5);
			sg.scale(2.2, 0.65);
			const gr = sg.createRadialGradient(0, 0, 0, 0, 0, r);
			const col = `${10 + c.z * 50},${18 + c.z * 55},${26 + c.z * 60}`;
			gr.addColorStop(0, `rgba(${col},${0.7 - c.z * 0.25})`);
			gr.addColorStop(1, `rgba(${col},0)`);
			sg.fillStyle = gr;
			sg.fillRect(-r, -r, r * 2, r * 2);
			return s;
		});
	}
	let seed = 11;
	const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

	function mk(d: number, len: number, w: number): Branch {
		const n: Branch = { d, len, w, a: 0, p: R() * 6.28, f: R() * 3, kids: [], leaves: [] };
		if (d < D) {
			const k = d < 1 ? 1 : d < 3 ? 2 : R() < 0.75 ? 2 : 3;
			for (let i = 0; i < k; i++) {
				const c = mk(d + 1, len * (d < 2 ? 0.85 : 0.74 + R() * 0.1), w * 0.68);
				c.a =
					k === 1
						? (R() - 0.5) * 0.08
						: (i / (k - 1) - 0.5) * (0.85 + R() * 0.4) + (R() - 0.5) * 0.2;
				n.kids.push(c);
			}
		}
		if (d >= D - 2)
			for (let i = 0; i < (low ? 2 : 3); i++)
				n.leaves.push({
					x: (R() - 0.5) * 26,
					y: (R() - 0.5) * 26,
					r: 3 + R() * 3,
					p: R() * 6.28,
					o: R() * 3.14,
					b: (R() * 4) | 0
				});
		return n;
	}
	let tree: Branch;

	const moon = new Image();
	moon.src = '/media/moon.svg';

	function windAt(t: number) {
		const gust = Math.max(0, Math.sin(t * 0.8 + Math.sin(t * 0.31) * 2.2));
		let w = 0.4 + 0.6 * Math.pow(gust, 1.5) + 0.08 * Math.sin(t * 5.3) * Math.sin(t * 3.1);
		w = Math.max(0.15, Math.min(1, w));
		return calm ? w * 0.35 : w;
	}

	let wd: number[] = [];
	const LV: number[] = [];
	let paths: Path2D[] = [];
	let boltFlash = 0;

	function draw(n: Branch, x: number, y: number, ang: number, pw: number, t: number) {
		const w = wd[n.d];
		ang += n.a + w * (0.025 + n.d * 0.016) + Math.sin(t * (2 + n.f) + n.p) * w * 0.011 * n.d;
		const l = n.len * L,
			x2 = x + Math.sin(ang) * l,
			y2 = y - Math.cos(ang) * l;
		const wi = Math.max(0.7, pw * L),
			wo = Math.max(0.7, n.w * L),
			cx = Math.cos(ang) / 2,
			cy = Math.sin(ang) / 2;
		const p = paths[n.d];
		p.moveTo(x - cx * wi, y - cy * wi);
		p.lineTo(x + cx * wi, y + cy * wi);
		p.lineTo(x2 + cx * wo, y2 + cy * wo);
		p.lineTo(x2 - cx * wo, y2 - cy * wo);
		p.closePath();
		p.moveTo(x2 + wo / 2, y2);
		p.arc(x2, y2, wo / 2, 0, 6.28);
		for (const f of n.leaves)
			LV.push(
				x2 + (f.x * L) / 90,
				y2 + (f.y * L) / 90,
				f.o + w * 0.6 + Math.sin(t * 9 + f.p) * (0.4 + w * 0.8),
				f.r,
				f.b
			);
		for (const c of n.kids) draw(c, x2, y2, ang, n.w, t);
	}

	const hillY = (u: number) => H * (0.9 - 0.2 * u * (1 - u));

	function ridge(c: CanvasRenderingContext2D, base: number, amp: number, col: string, ph: number) {
		c.fillStyle = col;
		c.beginPath();
		c.moveTo(0, H);
		for (let x = 0; x <= W + 20; x += 20)
			c.lineTo(
				x,
				H * base -
					H * amp * (Math.sin(x * 0.004 + ph) + 0.5 * Math.sin(x * 0.011 + ph * 2)) -
					Math.sin(x * 0.07 + ph) * H * 0.004
			);
		c.lineTo(W, H);
		c.fill();
	}

	let blades: { u: number; l: number; p: number }[] = [];
	let rain: { x: number; y: number; s: number; vx: number; vy: number }[] = [];

	const P: {
		x: number;
		y: number;
		vx: number;
		vy: number;
		r: number;
		a: number;
		va: number;
		p: number;
		b: number;
	}[] = [];

	function configure() {
		D = low ? 7 : 9;
		buildPalette();
		wd = new Array(D + 1).fill(0);
		seed = 11;
		tree = mk(0, 1, 0.22);
		makeClouds();
		blades = Array.from({ length: low ? 24 : 140 }, () => ({
			u: Math.random(),
			l: 8 + Math.random() * 20,
			p: Math.random() * 6
		}));
		rain = Array.from({ length: low ? 55 : 320 }, () => ({
			x: Math.random() * 2000,
			y: Math.random() * 1200,
			s: Math.random(),
			vx: 0,
			vy: 0
		}));
		P.length = 0;
	}

	function spawn(w: number) {
		if (!LV.length || P.length > (low ? 30 : 160)) return;
		const i = (((Math.random() * LV.length) / 5) | 0) * 5;
		P.push({
			x: LV[i],
			y: LV[i + 1],
			vx: w * 3,
			vy: -Math.random(),
			r: 2 + Math.random() * 2.5,
			a: Math.random() * 6,
			va: (Math.random() - 0.5) * 0.5,
			p: Math.random() * 6,
			b: LV[i + 4]
		});
	}
	type Bolt = { m: number[][]; br: number[][][]; t: number; again: boolean };
	let nextBolt = 3;
	let bolt: Bolt | null = null;

	function makeBolt(t: number): Bolt {
		const seg = (x: number, y: number, n: number, dx: number, dy: number, j: number) => {
			const p = [[x, y]];
			for (let i = 0; i < n; i++) {
				x += dx + (Math.random() - 0.5) * j;
				y += dy;
				p.push([x, y]);
			}
			return p;
		};
		const m = seg(W * (0.15 + 0.7 * Math.random()), 0, 10, 0, H * 0.08, W * 0.07),
			br: number[][][] = [];
		for (const i of [3, 5, 7])
			if (Math.random() < 0.7)
				br.push(seg(m[i][0], m[i][1], 4, (Math.random() - 0.5) * W * 0.05, H * 0.05, W * 0.04));
		return { m, br, t, again: false };
	}

	const trace = (p: number[][]) => {
		g.moveTo(p[0][0], p[0][1]);
		for (let i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]);
	};

	function initAnalyser() {
		if (!hd) return;
		if (audioCtx) {
			if (audioCtx.state === 'suspended') audioCtx.resume();
			return;
		}
		const AC = window.AudioContext || (window as any).webkitAudioContext;
		if (!AC) return;
		audioCtx = new AC();
		const src = audioCtx.createMediaElementSource(audio);
		analyser = audioCtx.createAnalyser();
		analyser.fftSize = 256;
		freq = new Uint8Array(analyser.frequencyBinCount);
		src.connect(analyser);
		analyser.connect(audioCtx.destination);
		if (audioCtx.state === 'suspended') audioCtx.resume();
	}

	let minGap = hd ? 0 : 1000 / 30;
	let lastTime = performance.now();
	let lastDraw = lastTime;
	let elapsed = 0;
	let raf = 0;
	let scheduled = false;
	let resizeTimer: ReturnType<typeof setTimeout> | undefined;

	function schedule() {
		if (scheduled) return;
		scheduled = true;
		raf = requestAnimationFrame(loop);
	}

	function onResize() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			size();
			buildCloudSprites();
		}, 150);
	}

	function loop(now: number) {
		scheduled = false;
		const dt = Math.min((now - lastTime) / 1000, 0.05);
		lastTime = now;
		elapsed += dt;

		if (analyser) {
			analyser.getByteFrequencyData(freq);
			let sum = 0;
			for (let i = 0; i < 24; i++) sum += freq[i];
			level += (sum / (24 * 255) - level) * 0.2;
		}

		if (running) {
			onTime(audio.currentTime);
			if (minGap && now - lastDraw < minGap) {
				schedule();
				return;
			}
			const k = Math.min((now - lastDraw) / 16.67, 3);
			lastDraw = now;

			const w = windAt(elapsed);
			const t = elapsed;
			for (let d = 0; d <= D; d++) wd[d] = windAt(t - d * 0.07);

			g.drawImage(bgBack, 0, 0, W, H);

			for (let i = 0; i < clouds.length; i++) {
				const c = clouds[i];
				c.x += (0.15 + w * 1.4) * (0.4 + c.z) * k;
				const r = c.r * W;
				if (c.x > W + r * 2) c.x = -r * 2;
				const sp = cloudSprites[i];
				for (let j = 0; j <= 1; j++) {
					g.drawImage(sp, c.x + j * r * 0.7 - r * 2.55, c.y * H - r * 0.65, r * 4.4, r * 1.3);
				}
			}

			g.fillStyle = hazeGrad;
			g.fillRect(0, H * 0.55, W, H * 0.31);

			if (!calm && t > nextBolt) {
				bolt = makeBolt(t);
				boltFlash = 1;
				nextBolt = t + 5 + Math.random() * 8;
			}
			if (bolt) {
				if (!bolt.again && t - bolt.t > 0.13) {
					boltFlash = 0.8;
					bolt.again = true;
				}
				if (t - bolt.t > 0.35) bolt = null;
			}
			boltFlash = Math.max(0, boltFlash - 0.06 * k);
			if (boltFlash) {
				g.fillStyle = `rgba(215,230,255,${boltFlash * 0.25})`;
				g.fillRect(0, 0, W, H);
			}
			if (bolt) {
				g.lineJoin = 'round';
				g.lineCap = 'round';
				g.beginPath();
				trace(bolt.m);
				bolt.br.forEach(trace);
				g.strokeStyle = 'rgba(200,225,255,.2)';
				g.lineWidth = 7;
				g.stroke();
				g.strokeStyle = '#fff';
				g.lineWidth = 2;
				g.stroke();
			}

			g.drawImage(bgFront, 0, 0, W, H);

			const NB = 16;
			const gw: number[] = new Array(NB + 2);
			for (let i = 0; i <= NB; i++) gw[i] = windAt(t - (i / NB) * 1.2);
			gw[NB + 1] = gw[NB];
			const leanAt = (u: number) => {
				const f = u * NB,
					i = f | 0;
				return gw[i] + (gw[i + 1] - gw[i]) * (f - i);
			};

			for (let pass = 0; pass < 2; pass++) {
				g.strokeStyle = pass ? '#15241a' : '#0c1710';
				g.lineWidth = 1.5;
				g.lineCap = 'round';
				g.beginPath();
				for (let i = pass; i < blades.length; i += 2) {
					const b = blades[i],
						bx = b.u * W,
						by = hillY(b.u) + 2,
						wl = leanAt(b.u);
					const lean = wl * b.l * 1.0 + Math.sin(t * 5 + b.p) * wl * 2;
					g.moveTo(bx, by);
					g.quadraticCurveTo(bx + lean * 0.3, by - b.l * 0.6, bx + lean, by - b.l * 0.95);
				}
				g.stroke();
			}

			if (boltFlash) {
				const gg = g.createLinearGradient(0, H * 0.72, 0, H);
				gg.addColorStop(0, 'rgba(200,215,235,0)');
				gg.addColorStop(0.5, `rgba(200,215,235,${boltFlash * 0.22})`);
				gg.addColorStop(1, `rgba(200,215,235,${boltFlash * 0.1})`);
				g.fillStyle = gg;
				g.fillRect(0, H * 0.72, W, H * 0.28);
			}

			g.save();
			const mx = W * 0.86,
				my = H * 0.12,
				mr = coarse ? 24 : 45;
			if (moon.complete && moon.naturalWidth) {
				g.fillStyle = moonGlow;
				g.beginPath();
				g.arc(mx, my, mr * 7.2, 0, 6.28);
				g.fill();
				g.drawImage(moon, mx - mr * 6, my - mr * 6, mr * 12, mr * 12);
				if (level) {
					g.globalCompositeOperation = 'lighter';
					g.globalAlpha = level * 0.6;
					g.drawImage(moon, mx - mr * 6, my - mr * 6, mr * 12, mr * 12);
				}
			}
			g.restore();

			const treeL = L;
			L *= 0.6;
			g.fillStyle = 'rgba(0,0,0,.35)';
			g.beginPath();
			g.ellipse(W * 0.5, hillY(0.5) + 4, L * 1.4, L * 0.12, 0, 0, 6.28);
			g.fill();
			LV.length = 0;
			paths = Array.from({ length: D + 1 }, () => new Path2D());
			draw(tree, W * 0.5, hillY(0.5), 0, 0.34, t);
			const trunk = boltFlash > 0.3 ? lit : bark;
			for (let d = 0; d <= D; d++) {
				g.fillStyle = trunk[d];
				g.fill(paths[d]);
			}
			const pal = boltFlash > 0.3 ? LIT : BARK;
			for (let b = 0; b < 4; b++) {
				g.fillStyle = pal[b];
				g.beginPath();
				for (let i = 0; i < LV.length; i += 5) {
					if (LV[i + 4] !== b) continue;
					const rx = ((LV[i + 3] * L) / 90) * 1.5,
						r = LV[i + 2];
					g.moveTo(LV[i] + rx * Math.cos(r), LV[i + 1] + rx * Math.sin(r));
					g.ellipse(LV[i], LV[i + 1], rx, rx * 0.5, r, 0, 6.28);
				}
				g.fill();
			}
			L = treeL;

			if (Math.random() < w * w * k) spawn(w);
			if (Math.random() < w * w * w * k) spawn(w);
			for (let i = P.length - 1; i >= 0; i--) {
				const p = P[i];
				p.vx += (w * 9 - p.vx) * 0.04 * k;
				p.vy = Math.min(3, p.vy + (0.05 + Math.sin(t * 6 + p.p) * 0.06) * k);
				p.x += p.vx * k;
				p.y += p.vy * k;
				p.a += p.va * k;
				if (p.y > H || p.x > W + 20) {
					P.splice(i, 1);
					continue;
				}
				g.fillStyle = pal[p.b];
				g.beginPath();
				g.ellipse(p.x, p.y, p.r * 1.6, p.r * 0.8, p.a, 0, 6.28);
				g.fill();
			}

			for (const d of rain) {
				const near = d.s > 0.5;
				d.vx = w * (near ? 16 : 10);
				d.vy = (near ? 26 : 16) + d.s * 10;
				d.x += d.vx * k;
				d.y += d.vy * k;
				if (d.y > H) {
					d.y = -20;
					d.x = Math.random() * W * 1.4 - W * 0.2;
				}
				if (d.x > W + 40) d.x -= W * 1.3;
			}
			for (let pass = 0; pass < 2; pass++) {
				g.strokeStyle = pass ? 'rgba(150,170,185,.12)' : 'rgba(150,170,185,.07)';
				g.lineWidth = pass ? 1.2 : 0.8;
				g.beginPath();
				for (const d of rain) {
					if (d.s > 0.5 !== !!pass) continue;
					g.moveTo(d.x, d.y);
					g.lineTo(d.x - d.vx * 0.9, d.y - d.vy * 0.9);
				}
				g.stroke();
			}
		} else {
			g.fillStyle = '#000';
			g.fillRect(0, 0, W, H);
		}

		if (running) schedule();
	}

	configure();
	size();
	buildCloudSprites();
	addEventListener('resize', onResize);
	schedule();

	return {
		start() {
			if (running) return;
			running = true;
			initAnalyser();
			lastTime = performance.now();
			lastDraw = lastTime;
			schedule();
		},
		stop() {
			running = false;
		},
		setHD(on: boolean) {
			if (hd === on) return;
			hd = on;
			low = !on;
			minGap = hd ? 0 : 1000 / 30;
			if (hd) initAnalyser();
			configure();
			size();
			buildCloudSprites();
			if (running) schedule();
		},
		destroy() {
			running = false;
			clearTimeout(resizeTimer);
			cancelAnimationFrame(raf);
			scheduled = true;
			removeEventListener('resize', onResize);
			audioCtx?.close();
		}
	};
}
