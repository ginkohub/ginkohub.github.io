class GameState {
	selectedGameId = $state<string>('');

	selectGame(id: string) {
		this.selectedGameId = id.toLowerCase();
	}
}

export const gameState = new GameState();
