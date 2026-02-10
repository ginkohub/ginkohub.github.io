class GithubState {
	mode = $state<'repositories' | 'developers'>('repositories');
	selectedLang = $state<string>('all');
	refreshSignal = $state<number>(0);

	// Observed Data
	repos = $state<any[]>([]);
	developers = $state<any[]>([]);

	setMode(mode: 'repositories' | 'developers') {
		if (['repositories', 'developers'].includes(mode)) {
			this.mode = mode;
			this.refreshSignal++;
		}
	}

	setLanguage(lang: string) {
		this.selectedLang = lang;
		this.refreshSignal++;
	}
}

export const githubState = new GithubState();
