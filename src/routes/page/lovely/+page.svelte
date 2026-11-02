<script lang="ts">
	import { onMount } from 'svelte';
	import { cues, sceneByLine } from './cues';
	import { createStorm, type Storm } from './scene';

	type Word = {
		id: number;
		text: string;
		left: string;
		top: string;
		size: string;
		color: string;
		opacity: number;
		current: boolean;
	};

	let playing = $state(false);
	let started = $state(false);
	let showLyrics = $state(false);
	let scene = $state('night');
	let words = $state<Word[]>([]);
	let seekPct = $state(0);
	let cur = $state('0:00');
	let dur = $state('0:00');
	let audioFailed = $state(false);

	let canvas: HTMLCanvasElement;
	let audio: HTMLAudioElement;
	let storm: Storm;

	let lite = false;
	let hd = $state(false);
	let seeking = false;
	let activeCue = -1;
	let activeWord = -1;
	let nextId = 0;

	$effect(() => {
		document.body.classList.toggle('playing', playing);
		document.body.dataset.scene = scene;
	});

	onMount(() => {
		lite = matchMedia('(pointer: coarse)').matches || innerWidth < 800;
		storm = createStorm(canvas, audio, syncLyrics);
		const saved = localStorage.getItem('lovely_hd');
		hd = saved === null ? !lite : saved === '1';
		storm.setHD(hd);
		return () => {
			document.body.classList.remove('playing');
			storm.destroy();
		};
	});

	function toggleHD() {
		hd = !hd;
		storm?.setHD(hd);
		localStorage.setItem('lovely_hd', hd ? '1' : '0');
	}

	function fmt(t: number) {
		const m = Math.floor(t / 60) | 0,
			s = Math.floor(t % 60);
		return `${m}:${s < 10 ? '0' : ''}${s}`;
	}
	function syncLyrics(t: number) {
		const cueIndex = cues.findIndex((c) => t >= c.start && t < c.end);
		if (cueIndex !== activeCue) {
			activeCue = cueIndex;
			activeWord = -1;
			if (cueIndex <= 0) words = [];
			scene = cueIndex in sceneByLine ? sceneByLine[cueIndex] : 'night';
			showLyrics = cueIndex >= 0;
		}
		if (cueIndex < 0) return;

		const text = cues[cueIndex].words;
		let newActive = -1;
		for (let w = 0; w < text.length; w++) {
			if (t >= text[w].start) newActive = w;
			else break;
		}

		for (let w = activeWord + 1; w <= newActive && w < text.length; w++) {
			const size = (lite ? 1.15 : 1.7) + Math.random() * (lite ? 1.1 : 3.4);
			const at = place(text[w].word, size);
			words = [
				...words,
				{
					id: nextId++,
					text: text[w].word,
					left: at.left,
					top: at.top,
					size: `${size}rem`,
					color: `hsl(${(190 + Math.random() * 170) | 0} 75% 82%)`,
					opacity: 0,
					current: false
				}
			];
		}

		if (newActive !== activeWord) {
			activeWord = newActive;
			const n = words.length;
			words = words.map((w, idx) => {
				const recency = n - 1 - idx;
				const opacity = recency < 3 ? 1 - recency * 0.05 : 0.05 + (idx / Math.max(1, n - 1)) * 0.6;
				return { ...w, opacity, current: idx === n - 1 };
			});
			if (n) words[n - 1].opacity = 1;
		}

		if (words.length > (lite ? 5 : 7)) words = words.slice(words.length - (lite ? 5 : 7));
	}
	function place(text: string, size: number) {
		const fs = size * parseFloat(getComputedStyle(document.documentElement).fontSize);
		const left = Math.max(16, innerWidth * 0.04);
		const top = Math.max(72, innerHeight * 0.1);
		const right = innerWidth - left - text.length * fs * 0.62;
		const bottom = innerHeight - top - fs * 1.4;
		return {
			left: `${left + Math.random() * Math.max(0, right - left)}px`,
			top: `${top + Math.random() * Math.max(0, bottom - top)}px`
		};
	}

	function setPlaying(on: boolean) {
		playing = on;
		if (on) return;
		audio.pause();
		storm?.stop();
		activeCue = -1;
		activeWord = -1;
		showLyrics = false;
		words = [];
		started = false;
	}

	function togglePlayback() {
		if (!audio || !storm) return;
		if (audio.paused || audio.ended) {
			started = true;
			setPlaying(true);
			audio.muted = false;
			if (audio.ended) audio.currentTime = 0;
			storm.start();
			audio.play().catch(() => {});
		} else {
			setPlaying(false);
		}
	}
</script>

<svelte:head>
	<title>lovely — Billie Eilish &amp; Khalid</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<canvas class="storm" bind:this={canvas} aria-hidden="true"></canvas>
<div class="vignette" aria-hidden="true"></div>

<p class="lyric" class:show={showLyrics} aria-live="polite">
	{#each words as w (w.id)}
		<span
			class="word"
			class:current={w.current}
			style:left={w.left}
			style:top={w.top}
			style:font-size={w.size}
			style:color={w.color}
			style:opacity={w.opacity}>{w.text}</span
		>
	{/each}
</p>

<aside class="info">
	<b>lovely</b>
	<span>Billie Eilish &amp; Khalid</span>
</aside>

<div class="start-screen" class:hidden={started}>
	<button class="start-btn" onclick={togglePlayback} aria-label="Play lovely">
		<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="5,3 19,12 5,21" /></svg>
	</button>
</div>

<button
	class="corner-toggle"
	class:playing
	onclick={togglePlayback}
	disabled={audioFailed}
	aria-label={playing ? 'Pause music and animation' : 'Play music and animation'}
>
	{#if audioFailed}
		<span class="no-audio">no audio</span>
	{:else}
		<svg class="icon-pause" viewBox="0 0 24 24" aria-hidden="true">
			<rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
		</svg>
		<svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true">
			<polygon points="5,3 19,12 5,21" />
		</svg>
	{/if}
</button>

<button
	class="hd-toggle"
	class:on={hd}
	onclick={toggleHD}
	aria-pressed={hd}
	aria-label={hd ? 'Switch to lower quality' : 'Switch to HD'}>HD</button
>

<div class="bars" aria-hidden="true"><i></i><i></i></div>

<div class="seek">
	<span>{cur}</span>
	<input
		type="range"
		min="0"
		max="100"
		step="any"
		value={seekPct}
		aria-label="Seek"
		oninput={(e) => {
			seeking = true;
			seekPct = Number(e.currentTarget.value);
			if (audio.duration) audio.currentTime = (seekPct / 100) * audio.duration;
		}}
		onchange={() => (seeking = false)}
	/>
	<span>{dur}</span>
</div>

<audio
	bind:this={audio}
	src="/media/lovely.mp3"
	loop
	preload="metadata"
	onloadedmetadata={() => {
		dur = fmt(audio.duration);
	}}
	ontimeupdate={() => {
		if (!audio.duration) return;
		cur = fmt(audio.currentTime);
		if (!seeking) seekPct = (audio.currentTime / audio.duration) * 100;
	}}
	onended={() => {
		setPlaying(false);
		audio.currentTime = 0;
		seeking = false;
		seekPct = 0;
		cur = fmt(0);
	}}
	onerror={() => {
		audioFailed = true;
		setPlaying(false);
	}}
></audio>

<style>
	:global(html),
	:global(body) {
		height: 100%;
	}

	:global(body) {
		overflow: hidden;
		background: #010104;
		color: #e8e6f2;
		font-family: 'Caveat', cursive;
		-webkit-font-smoothing: antialiased;
		touch-action: none;
		--dim: #8b8ba7;
		--glow: #8ea8ff;
	}

	.storm {
		position: fixed;
		inset: 0;
		z-index: 0;
		display: block;
		width: 100%;
		height: 100%;
		background: #000;
		touch-action: none;
	}

	.vignette {
		position: fixed;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		background: radial-gradient(circle at 50% 50%, transparent 35vmin, rgba(0, 0, 0, 0.5) 75vmax);
	}

	.info {
		position: fixed;
		right: 26px;
		bottom: calc(5.5vh + 18px);
		z-index: 5;
		text-align: right;
		display: grid;
		gap: 4px;
		line-height: 1;
		color: var(--dim);
		animation: fade-up 2.6s 0.4s both;
	}

	.info b {
		font-weight: 400;
		font-size: 18px;
		letter-spacing: 0.06em;
		color: rgba(232, 230, 242, 0.75);
	}

	.info span {
		font-family: 'Inter', system-ui, sans-serif;
		font-size: 9px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			transform: translateY(18px);
			filter: blur(6px);
		}
		to {
			opacity: 1;
			transform: none;
			filter: blur(0);
		}
	}

	.lyric {
		position: fixed;
		inset: 0;
		z-index: 2;
		letter-spacing: 0.02em;
		color: rgba(232, 230, 242, 0.85);
		text-shadow:
			0 0 30px rgba(160, 140, 255, 0.4),
			0 2px 20px rgba(0, 0, 0, 0.6);
		opacity: 0;
		transition: opacity 1s ease;
		pointer-events: none;
	}

	.lyric.show {
		opacity: 1;
	}

	.word {
		position: absolute;
		opacity: 0;
		transform: scale(0.9) rotate(2deg);
		will-change: opacity, transform;
		text-shadow: 0 0 14px rgba(0, 0, 0, 0.85);
		animation: leaf-drift 5s ease-in-out infinite;
	}

	.word.current {
		color: #fff;
		animation: none;
		text-shadow:
			0 0 40px rgba(190, 170, 255, 0.9),
			0 0 80px rgba(140, 110, 240, 0.5);
	}

	@keyframes leaf-drift {
		0%,
		100% {
			transform: translate(0, 0) rotate(2deg);
		}
		50% {
			transform: translate(10px, 18px) rotate(-3deg);
		}
	}

	:global(body:not(.playing)) .lyric,
	:global(body:not(.playing)) .info,
	:global(body:not(.playing)) .bars,
	:global(body:not(.playing)) .vignette {
		opacity: 0;
		pointer-events: none;
	}

	:global(body:not(.playing)) .storm {
		opacity: 0;
	}

	:global(body.playing) .lyric,
	:global(body.playing) .info,
	:global(body.playing) .bars,
	:global(body.playing) .corner-toggle {
		opacity: 1;
		pointer-events: auto;
		transition: opacity 1.8s ease;
	}

	:global(body.playing) .storm {
		transition: opacity 1.8s ease;
	}

	.start-screen {
		position: fixed;
		inset: 0;
		z-index: 20;
		display: grid;
		place-items: center;
		background: #000;
		transition:
			opacity 0.8s ease,
			visibility 0.8s ease;
	}

	.start-screen.hidden {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
	}

	.start-btn {
		width: clamp(80px, 18vw, 120px);
		height: clamp(80px, 18vw, 120px);
		border-radius: 50%;
		border: 1px solid rgba(142, 168, 255, 0.35);
		background: transparent;
		color: #e8e6f2;
		cursor: pointer;
		display: grid;
		place-items: center;
		transition:
			border-color 0.3s,
			box-shadow 0.3s,
			transform 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.start-btn:hover,
	.start-btn:focus-visible {
		border-color: rgba(142, 168, 255, 0.8);
		box-shadow: 0 0 60px rgba(142, 168, 255, 0.25);
		transform: scale(1.05);
		outline: none;
	}

	.start-btn svg {
		width: 42%;
		height: 42%;
		fill: currentColor;
	}

	.corner-toggle {
		position: fixed;
		top: 24px;
		left: 24px;
		z-index: 15;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 1px solid rgba(142, 168, 255, 0.25);
		background: rgba(5, 6, 13, 0.85);
		color: var(--dim);
		cursor: pointer;
		display: grid;
		place-items: center;
		transition:
			color 0.3s,
			border-color 0.3s,
			box-shadow 0.3s,
			opacity 0.3s;
		-webkit-tap-highlight-color: transparent;
	}

	.corner-toggle:hover,
	.corner-toggle:focus-visible {
		color: #e8e6f2;
		border-color: rgba(142, 168, 255, 0.7);
		box-shadow: 0 0 28px rgba(142, 168, 255, 0.25);
		outline: none;
	}

	.corner-toggle svg {
		width: 22px;
		height: 22px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.corner-toggle .icon-pause {
		display: none;
	}

	.corner-toggle.playing .icon-play {
		display: none;
	}

	.corner-toggle.playing .icon-pause {
		display: block;
	}

	.no-audio {
		font-size: 9px;
		letter-spacing: 0.2em;
	}

	.hd-toggle {
		position: fixed;
		top: 86px;
		left: 24px;
		z-index: 15;
		width: 48px;
		height: 24px;
		border-radius: 12px;
		border: 1px solid rgba(142, 168, 255, 0.25);
		background: rgba(5, 6, 13, 0.85);
		color: var(--dim);
		font-family: 'Inter', system-ui, sans-serif;
		font-size: 9px;
		font-weight: 500;
		letter-spacing: 0.16em;
		cursor: pointer;
		transition:
			color 0.3s,
			border-color 0.3s,
			box-shadow 0.3s;
		-webkit-tap-highlight-color: transparent;
	}

	.hd-toggle.on {
		color: #e8e6f2;
		border-color: rgba(142, 168, 255, 0.7);
		box-shadow: 0 0 22px rgba(142, 168, 255, 0.25);
	}

	.hd-toggle:focus-visible {
		outline: none;
		border-color: rgba(142, 168, 255, 0.8);
	}

	.bars i {
		position: fixed;
		left: 0;
		right: 0;
		height: 5.5vh;
		z-index: 9;
		background: #000;
		animation: bar-in 1.8s ease-out both;
	}

	.bars i:first-child {
		top: 0;
		transform-origin: top;
	}

	.bars i:last-child {
		bottom: 0;
		transform-origin: bottom;
	}

	@keyframes bar-in {
		from {
			transform: scaleY(0);
		}
		to {
			transform: scaleY(1);
		}
	}

	.seek {
		position: fixed;
		left: 50%;
		bottom: 86px;
		transform: translateX(-50%);
		z-index: 15;
		width: clamp(220px, 55vw, 560px);
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--dim);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.6s ease;
	}

	:global(body.playing) .seek {
		opacity: 1;
		pointer-events: auto;
	}

	.seek input {
		flex: 1;
		height: 5px;
		appearance: none;
		background: rgba(255, 255, 255, 0.1);
		border: none;
		border-radius: 3px;
		outline: none;
		cursor: pointer;
	}

	.seek input::-webkit-slider-thumb {
		appearance: none;
		width: 13px;
		height: 13px;
		background: var(--glow);
		border-radius: 50%;
		cursor: pointer;
	}

	.seek input::-moz-range-thumb {
		width: 13px;
		height: 13px;
		background: var(--glow);
		border: none;
		border-radius: 50%;
		cursor: pointer;
	}

	.seek input::-webkit-slider-runnable-track,
	.seek input::-moz-range-track {
		background: none;
	}

	@media (max-width: 640px) {
		.corner-toggle {
			top: 16px;
			left: 16px;
			width: 44px;
			height: 44px;
		}

		.hd-toggle {
			top: 68px;
			left: 16px;
			width: 44px;
		}

		.start-btn {
			width: 88px;
			height: 88px;
		}

		.info {
			right: 16px;
			top: calc(5.5vh + 12px);
			bottom: auto;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(*) {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
