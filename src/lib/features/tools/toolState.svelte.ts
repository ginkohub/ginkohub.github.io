class ToolState {
	jsonInput = $state<string>('');
	base64Input = $state<string>('');
	urlInput = $state<string>('');

	setJsonInput(value: string) {
		this.jsonInput = value;
	}
	setBase64Input(value: string) {
		this.base64Input = value;
	}
	setUrlInput(value: string) {
		this.urlInput = value;
	}
}

export const toolState = new ToolState();
