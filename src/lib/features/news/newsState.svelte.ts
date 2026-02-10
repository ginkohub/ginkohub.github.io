import { ghpFetch } from '$lib/fetcher';
import defaultFeedGroups from '$lib/data/tech-feeds.json';

interface Feed {
	name: string;
	url: string;
	custom?: boolean;
}

interface Article {
	title: string;
	link: string;
	date: string;
	snippet: string;
	image: string;
}

class NewsState {
	customFeeds = $state<Feed[]>([]);
	selectedFeed = $state<string>(defaultFeedGroups[0].feeds[0].url);
	articles = $state<Article[]>([]);
	loading = $state<boolean>(false);
	error = $state<string>('');

	constructor() {
		if (typeof window !== 'undefined') {
			this.loadPersistedState();
		}
	}

	get feedGroups() {
		return [
			...(this.customFeeds.length > 0 ? [{ name: 'Custom Feeds', feeds: this.customFeeds }] : []),
			...defaultFeedGroups
		];
	}

	get allFeeds(): Feed[] {
		return this.feedGroups.flatMap((g) => g.feeds);
	}

	loadPersistedState() {
		const savedFeeds = localStorage.getItem('ginkohub_custom_feeds');
		if (savedFeeds) this.customFeeds = JSON.parse(savedFeeds);

		const savedActiveFeed = localStorage.getItem('ginkohub_active_feed');
		if (savedActiveFeed) this.selectedFeed = savedActiveFeed;
	}

	addFeed(name: string, url: string) {
		try {
			new URL(url); // Validate URL
			const feed: Feed = { name, url, custom: true };
			this.customFeeds = [...this.customFeeds, feed];
			localStorage.setItem('ginkohub_custom_feeds', JSON.stringify(this.customFeeds));

			// Auto switch to new feed
			this.selectedFeed = url;
			localStorage.setItem('ginkohub_active_feed', this.selectedFeed);

			return { success: true, message: `Feed '${name}' added successfully.` };
		} catch (e) {
			return { success: false, message: 'Invalid URL format' };
		}
	}

	removeFeed(url: string) {
		this.customFeeds = this.customFeeds.filter((f) => f.url !== url);
		localStorage.setItem('ginkohub_custom_feeds', JSON.stringify(this.customFeeds));
		if (this.selectedFeed === url) {
			this.selectedFeed = defaultFeedGroups[0].feeds[0].url;
			localStorage.setItem('ginkohub_active_feed', this.selectedFeed);
		}
	}

	nextFeed() {
		const currentIndex = this.allFeeds.findIndex((f) => f.url === this.selectedFeed);
		const nextIndex = (currentIndex + 1) % this.allFeeds.length;
		this.selectedFeed = this.allFeeds[nextIndex].url;
	}

	prevFeed() {
		const currentIndex = this.allFeeds.findIndex((f) => f.url === this.selectedFeed);
		const prevIndex = (currentIndex - 1 + this.allFeeds.length) % this.allFeeds.length;
		this.selectedFeed = this.allFeeds[prevIndex].url;
	}

	setSelectedFeed(urlOrName: string) {
		// Try to find by URL first, then by name
		const feed = this.allFeeds.find(
			(f) => f.url === urlOrName || f.name.toLowerCase().includes(urlOrName.toLowerCase())
		);
		if (feed) {
			this.selectedFeed = feed.url;
			return { success: true, name: feed.name };
		}
		return { success: false };
	}

	async fetchFeed() {
		if (!this.selectedFeed) return;

		if (typeof window !== 'undefined') {
			localStorage.setItem('ginkohub_active_feed', this.selectedFeed);
		}

		this.loading = true;
		this.error = '';

		try {
			let res = await ghpFetch(this.selectedFeed, 'rss');

			if (!res.success || !res.data?.items) {
				console.log('Specialized RSS parser failed, attempting raw XML fallback...');
				const rawRes = await ghpFetch(this.selectedFeed, 'html');
				if (rawRes.success) {
					const xmlString =
						rawRes.data.contents || (typeof rawRes.data === 'string' ? rawRes.data : '');

					if (xmlString) {
						const parser = new DOMParser();
						const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

						const entries = Array.from(xmlDoc.querySelectorAll('entry, item'));
						if (entries.length > 0) {
							const feedHostname = new URL(this.selectedFeed).hostname;
							const fallbackImage = `https://www.google.com/s2/favicons?domain=${feedHostname}&sz=64`;

							this.articles = entries.slice(0, 10).map((entry) => {
								const title = entry.querySelector('title')?.textContent || 'Untitled';
								const link =
									entry.querySelector('link[rel="alternate"]')?.getAttribute('href') ||
									entry.querySelector('link')?.getAttribute('href') ||
									entry.querySelector('link')?.textContent ||
									'';
								const pubDate =
									entry.querySelector('published, updated, pubDate')?.textContent || '';
								const date = pubDate ? new Date(pubDate).toISOString().split('T')[0] : 'LATEST';
								const desc =
									entry.querySelector('summary, content, description')?.textContent || '';
								const snippet = desc
									? desc.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
									: 'Access protocol...';

								return {
									title: this.fixEncoding(title),
									link,
									date,
									snippet,
									image: fallbackImage
								};
							});
							this.loading = false;
							return;
						}
					}
				}
				throw new Error(res.error || 'Feed format unsupported');
			}

			const data = res.data;

			if (data && data.items && Array.isArray(data.items)) {
				const feedHostname = new URL(this.selectedFeed).hostname;
				const fallbackImage = `https://www.google.com/s2/favicons?domain=${feedHostname}&sz=64`;

				this.articles = data.items.slice(0, 10).map((item: any) => {
					const title = this.fixEncoding(item.title || 'Untitled Protocol');
					const link = item.link;
					const pubDate = item.published || item.created || item.pubDate;
					const date = pubDate ? new Date(pubDate).toISOString().split('T')[0] : 'LATEST';

					const desc = item.description || item.summary || item.content || '';
					const snippet = desc
						? desc.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
						: 'Access protocol for full content extraction...';

					let image = null;
					if (item.media && item.media.thumbnail && item.media.thumbnail.url) {
						image = item.media.thumbnail.url;
					} else if (item.enclosures && item.enclosures.length > 0) {
						const imgEnc = item.enclosures.find((e: any) => e.type && e.type.startsWith('image'));
						if (imgEnc) image = imgEnc.url;
					}

					if (!image && desc) {
						const imgMatch = desc.match(/<img[^>]+src="([^">]+)"/);
						if (imgMatch) image = imgMatch[1];
					}

					return {
						title,
						link,
						date,
						snippet,
						image: image || fallbackImage
					};
				});
			} else {
				throw new Error('Feed is empty or format unsupported');
			}
		} catch (e) {
			const err = e as Error;
			this.error = `Sync Error: ${err.message}`;
			console.error('RSS Feed error:', e);
		} finally {
			this.loading = false;
		}
	}

	fixEncoding(str: string) {
		if (!str) return str;
		if (!/[âÃ¤Ã¶Ã¼Ãâââ]/.test(str)) {
			return str;
		}
		try {
			return decodeURIComponent(
				Array.from(str, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
			);
		} catch {
			return str;
		}
	}
}

export const newsState = new NewsState();
