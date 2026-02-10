import { appState } from './appState.svelte';
import { newsState } from '$lib/features/news/newsState.svelte';
import { toolState } from '$lib/features/tools/toolState.svelte';
import { previewState } from '$lib/features/preview/previewState.svelte';
import { humorState } from '$lib/features/humor/humorState.svelte';
import { aboutState } from '$lib/features/about/aboutState.svelte';
import { gameState } from '$lib/features/game/gameState.svelte';
import { aiLabState } from '$lib/features/ai/aiLabState.svelte';
import { githubState } from '$lib/features/about/githubState.svelte';
import { wordState } from '$lib/features/words/wordState.svelte';
import type { AiContext } from '$lib/types';

class ContextManager {
	aiContext = $derived<AiContext>({
		activeTab: appState.activeTabLabel,
		accent: appState.currentAccent.name,
		persona: appState.persona,
		time: new Date().toLocaleTimeString(),
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		overloaded: appState.isOverloaded,
		news:
			appState.activeTabLabel === 'news'
				? {
						feed: newsState.selectedFeed,
						headlines: newsState.articles.slice(0, 5).map((a: any) => a.title)
					}
				: null,
		github:
			appState.activeTabLabel === 'github'
				? {
						mode: githubState.mode,
						language: githubState.selectedLang,
						items:
							githubState.mode === 'repositories'
								? githubState.repos.slice(0, 5).map((r: any) => `${r.author}/${r.name}`)
								: githubState.developers.slice(0, 5).map((d: any) => d.username)
					}
				: null,
		words:
			appState.activeTabLabel === 'words'
				? {
						query: wordState.searchTerm,
						results: wordState.results.slice(0, 10)
					}
				: null,
		humor:
			appState.activeTabLabel === 'humor'
				? {
						joke: humorState.joke?.setup
							? `${humorState.joke.setup} | ${humorState.joke.punchline}`
							: 'None',
						meme: humorState.meme?.title || 'None'
					}
				: null,
		about:
			appState.activeTabLabel === 'about'
				? {
						stats: `Repos: ${aboutState.githubStats.repos}, Followers: ${aboutState.githubStats.followers}, Stars: ${aboutState.githubStats.stars}`,
						contacts: []
					}
				: null,
		game: appState.activeTabLabel === 'game' ? { playing: gameState.selectedGameId } : null,
		ai:
			appState.activeTabLabel === 'ai'
				? { topModels: aiLabState.models.slice(0, 3).map((m: any) => m.name) }
				: null,
		preview:
			appState.activeTabLabel === 'preview'
				? { url: previewState.inputUrl, title: previewState.metadata?.title }
				: null
	});
}

export const contextManager = new ContextManager();
