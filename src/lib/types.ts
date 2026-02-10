export interface AiContext {
	activeTab: string;
	accent: string;
	persona: string;
	time: string;
	timezone: string;
	overloaded: boolean;
	news: { feed: string; headlines: string[] } | null;
	github: { mode: string; language: string; items: string[] } | null;
	words: { query: string; results: string[] } | null;
	humor: { joke: string; meme: string } | null;
	about: { stats: string; contacts: string[] } | null;
	game: { playing: string } | null;
	ai: { topModels: string[] } | null;
	preview: { url: string; title: string | undefined } | null;
}

export interface Quote {
	text: string;
	author: string;
}

export interface Accent {
	name: string;
	hex: string;
}

export interface Backgrounds {
	morning: string[];
	day: string[];
	evening: string[];
	night: string[];
}

export interface Assets {
	personas: string[];
	accents: Accent[];
	backgrounds: Backgrounds;
}

export interface AppStateData {
	persona: string;
	isGlitching: boolean;
	currentAccent: Accent;
	selectedBg: string;
	activeTabLabel: string;
	isOverloaded: boolean;
	showOverloadModal: boolean;
	showAura: boolean;
	comboCount: number;
	showCombo: boolean;
	comboScale: number;
	isShaking: boolean;
}

export interface FireworksSystem {
	trigger: (intensity: number) => void;
}

export interface ToolConfig {
	name: string;
	description: string;
	parameters: {
		type: 'object';
		properties: Record<string, any>;
		required?: string[];
	};
}

export interface ToolModule {
	config: ToolConfig;
	handler: (state: any) => (args: any) => Promise<string>;
}
