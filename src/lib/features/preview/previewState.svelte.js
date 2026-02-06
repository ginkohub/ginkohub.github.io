import { microlinkFetch } from '$lib/fetcher.js';

class PreviewState {
	inputUrl = $state('https://ginkohub.github.io');
	isLoading = $state(false);
	error = $state('');
	metadata = $state({
		title: 'GinkoHub • Cyber Flâneur | Poetic Digital Portfolio',
		description:
			"Explore GinkoHub: A minimalist collection of digital experiments, Rumi's poetic wisdom, and interactive arcade games.",
		image:
			'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=630&q=80',
		url: 'ginkohub.github.io'
	});

	async fetch() {
		if (!this.inputUrl) return;
		this.isLoading = true;
		this.error = '';

		console.log('Fetching metadata for:', this.inputUrl);

		const result = await microlinkFetch(this.inputUrl);

		if (result.success) {
			const data = result.data;
			this.metadata = {
				title: data.title || 'No title found',
				description: data.description || 'No description found',
				image: data.image?.url || data.logo?.url || '',
				url: new URL(this.inputUrl).hostname
			};
			console.log('Metadata updated:', this.metadata);
		} else {
			this.error = result.error;
		}
		this.isLoading = false;
	}
}

export const previewState = new PreviewState();
