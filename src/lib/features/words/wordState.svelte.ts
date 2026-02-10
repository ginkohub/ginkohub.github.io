class WordState {
	searchTerm = $state<string>('');
	results = $state<string[]>([]);
	loading = $state<boolean>(false);

	setSearchTerm(term: string) {
		this.searchTerm = term;
	}
}

export const wordState = new WordState();
