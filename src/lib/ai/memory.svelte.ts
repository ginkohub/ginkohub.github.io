class AiMemory {
	data = $state<Record<string, any>>({});

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('ginkohub_ai_memory');
			if (saved) this.data = JSON.parse(saved);
		}
	}

	set(key: string, value: any) {
		this.data[key] = value;
		if (typeof window !== 'undefined') {
			localStorage.setItem('ginkohub_ai_memory', JSON.stringify(this.data));
		}
	}

	get(key: string) {
		return this.data[key];
	}

	getAll() {
		return Object.entries(this.data)
			.map(([k, v]) => `${k}: ${v}`)
			.join(' | ');
	}
}

export const aiMemory = new AiMemory();
