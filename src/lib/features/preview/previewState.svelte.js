export const previewState = $state({
	inputUrl: 'https://ginkohub.github.io',
	isLoading: false,
	metadata: {
		title: 'GinkoHub • Cyber Flâneur | Poetic Digital Portfolio',
		description: "Explore GinkoHub: A minimalist collection of digital experiments, Rumi's poetic wisdom, and interactive arcade games.",
		image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=630&q=80',
		url: 'ginkohub.github.io'
	}
});

export async function fetchMetadata() {
	if (!previewState.inputUrl) return;
	previewState.isLoading = true;
	
	try {
		const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(previewState.inputUrl)}`);
		const result = await response.json();
		
		if (result.status === 'success') {
			const data = result.data;
			previewState.metadata = {
				title: data.title || 'No title found',
				description: data.description || 'No description found',
				image: data.image?.url || data.logo?.url || '',
				url: new URL(previewState.inputUrl).hostname
			};
		}
	} catch (e) {
		console.error("Failed to fetch metadata", e);
	} finally {
		previewState.isLoading = false;
	}
}
