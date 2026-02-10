import { ghpFetch } from '$lib/fetcher';

interface Metadata {
	title?: string;
	description?: string;
	image?: string;
	site_name?: string;
}

class PreviewState {
	inputUrl = $state<string>('');
	metadata = $state<Metadata | null>(null);
	loading = $state<boolean>(false);
	error = $state<string>('');
	visiblePreviews = $state<string[]>(['WhatsApp']);

	get isLoading() {
		return this.loading;
	}

	togglePreview(name: string) {
		const index = this.visiblePreviews.findIndex((p) => p.toLowerCase() === name.toLowerCase());
		if (index !== -1) {
			this.visiblePreviews = this.visiblePreviews.filter((_, i) => i !== index);
		} else {
			this.visiblePreviews = [...this.visiblePreviews, name];
		}
	}

	async fetch() {
		if (!this.inputUrl) return;

		// Add https if missing
		if (!this.inputUrl.startsWith('http')) {
			this.inputUrl = 'https://' + this.inputUrl;
		}

		this.loading = true;
		this.error = '';
		this.metadata = null;

		try {
			const result = await ghpFetch(this.inputUrl, 'html');
			if (result.success) {
				const data = result.data;
				this.metadata = {
					title: data.title || 'No Title Detected',
					description: data.description || 'No description found for this protocol.',
					image: data.image || '',
					site_name: data.site_name || new URL(this.inputUrl).hostname
				};
			} else {
				this.error = result.error || 'Failed to fetch metadata';
			}
		} catch (e) {
			this.error = (e as Error).message;
		} finally {
			this.loading = false;
		}
	}
}

export const previewState = new PreviewState();
