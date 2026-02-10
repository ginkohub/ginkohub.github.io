import assetsData from '$lib/data/assets.json';
import type { Accent, Assets, FireworksSystem } from '$lib/types';

const assets = assetsData as Assets;

/**
 * Global Application State (Svelte 5)
 * Centralizes theme, persona, and system-wide logic.
 */
class AppState {
	// Identity & Persona
	persona = $state<string>('Internet Surfer');
	isGlitching = $state<boolean>(false);
	personas = assets.personas;

	// Theme & Accents
	accents = assets.accents;
	currentAccent = $state<Accent>(assets.accents[0]);

	// Backgrounds
	backgrounds = assets.backgrounds;
	selectedBg = $state<string>('');

	// System Status
	activeTabLabel = $state<string>('about');
	isOverloaded = $state<boolean>(false);
	showOverloadModal = $state<boolean>(false);
	showAura = $state<boolean>(false);

	// Interaction Metrics
	comboCount = $state<number>(0);
	showCombo = $state<boolean>(false);
	comboScale = $state<number>(1);
	isShaking = $state<boolean>(false);
	comboTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor() {}

	init() {
		this.shufflePersona();
		this.selectedBg = this.getBackgroundByTime();

		// Load persisted accent if exists
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('ginkohub_custom_accent');
			if (saved) {
				try {
					this.setAccent(JSON.parse(saved));
					return;
				} catch (e) {
					console.error('Failed to parse saved accent', e);
				}
			}
		}
		this.shuffleAccent();
	}

	getBackgroundByTime(): string {
		const hour = new Date().getHours();
		let set = this.backgrounds.day;
		if (hour >= 5 && hour < 10) set = this.backgrounds.morning;
		else if (hour >= 10 && hour < 17) set = this.backgrounds.day;
		else if (hour >= 17 && hour < 21) set = this.backgrounds.evening;
		else set = this.backgrounds.night;
		return set[Math.floor(Math.random() * set.length)];
	}

	setAccent(accent: Accent) {
		this.currentAccent = accent;
		if (typeof document !== 'undefined') {
			document.documentElement.style.setProperty('--accent-color', accent.hex);
			localStorage.setItem('ginkohub_custom_accent', JSON.stringify(accent));
		}
	}

	shuffleAccent() {
		let newAccent: Accent;
		do {
			newAccent = this.accents[Math.floor(Math.random() * this.accents.length)];
		} while (newAccent.name === this.currentAccent.name);
		this.setAccent(newAccent);
	}

	shufflePersona() {
		let newPersona: string;
		do {
			newPersona = this.personas[Math.floor(Math.random() * this.personas.length)];
		} while (newPersona === this.persona);
		this.setPersona(newPersona);
	}

	setPersona(newPersona: string) {
		this.isGlitching = true;
		setTimeout(() => {
			this.persona = newPersona;
			if (typeof document !== 'undefined') {
				document.title = `GinkoHub • ${newPersona}`;
			}
		}, 50);
		setTimeout(() => (this.isGlitching = false), 300);
	}

	triggerAura() {
		this.showAura = false;
		setTimeout(() => (this.showAura = true), 10);
		setTimeout(() => (this.showAura = false), 2500);
	}

	addStrike(fireworksSystem?: FireworksSystem) {
		this.triggerAura();
		this.shufflePersona();
		this.shuffleAccent();

		this.comboCount++;
		if (this.comboCount % 10 === 0 && fireworksSystem) {
			const intensity = Math.pow(2, this.comboCount / 10);
			fireworksSystem.trigger(intensity);
		}

		this.showCombo = true;
		this.comboScale = 1 + Math.min(this.comboCount * 0.02, 0.3);
		this.isShaking = true;
		setTimeout(() => (this.isShaking = false), 80);

		if (this.comboCount === 50) {
			this.isOverloaded = true;
			this.showOverloadModal = true;
		}

		// Reset Timer
		if (this.comboTimeout) clearTimeout(this.comboTimeout);
		this.comboTimeout = setTimeout(() => {
			this.resetCombo();
		}, 2000);
	}

	resetCombo() {
		if (!this.isOverloaded) this.comboCount = 0;
		this.showCombo = false;
		this.comboScale = 1;
	}
}

export const appState = new AppState();
