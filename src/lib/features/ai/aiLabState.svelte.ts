class AiLabState {
	models = $state<any[]>([]);
	sortBy = $state<string>('likes');

	setSort(mode: string) {
		this.sortBy = mode;
	}
}

export const aiLabState = new AiLabState();
