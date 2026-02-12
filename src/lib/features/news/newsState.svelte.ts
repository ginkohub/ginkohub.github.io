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
	sourceName: string;
	sourceUrl: string;
}

class NewsState {
	customFeeds = $state<Feed[]>([]);
	selectedFeeds = $state<string[]>([]); // Changed to array for multi-select
	articles = $state<Article[]>([]);
	loading = $state<boolean>(false);
	error = $state<string>('');
	lastUpdated = $state<number>(0);

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

	get filteredArticles() {
		if (this.selectedFeeds.length === 0) return this.articles;
		return this.articles.filter((a) => this.selectedFeeds.includes(a.sourceUrl));
	}

	loadPersistedState() {
		const savedFeeds = localStorage.getItem('ginkohub_custom_feeds');
		if (savedFeeds) this.customFeeds = JSON.parse(savedFeeds);

		const savedSelectedFeeds = localStorage.getItem('ginkohub_selected_feeds');
		if (savedSelectedFeeds) {
			this.selectedFeeds = JSON.parse(savedSelectedFeeds);
		} else {
			// Default to first 5 feeds if nothing saved
			this.selectedFeeds = this.allFeeds.slice(0, 5).map((f) => f.url);
		}

		const savedArticles = localStorage.getItem('ginkohub_cached_articles');
		if (savedArticles) {
			try {
				this.articles = JSON.parse(savedArticles);
			} catch (e) {
				console.error('Failed to parse cached articles', e);
				this.articles = [];
			}
		}

		const savedLastUpdated = localStorage.getItem('ginkohub_news_last_updated');
		if (savedLastUpdated) this.lastUpdated = parseInt(savedLastUpdated);
	}

	saveArticles() {
		if (typeof window === 'undefined') return;
		// Keep only last 200 articles to save space
		const toSave = this.articles.slice(0, 200);
		localStorage.setItem('ginkohub_cached_articles', JSON.stringify(toSave));
		this.lastUpdated = Date.now();
		localStorage.setItem('ginkohub_news_last_updated', this.lastUpdated.toString());
	}

	saveSelectedFeeds() {
		if (typeof window === 'undefined') return;
		localStorage.setItem('ginkohub_selected_feeds', JSON.stringify(this.selectedFeeds));
	}

	toggleFeed(url: string) {
		if (this.selectedFeeds.includes(url)) {
			this.selectedFeeds = this.selectedFeeds.filter((u) => u !== url);
		} else {
			this.selectedFeeds = [...this.selectedFeeds, url];
			// Fetch if no articles for this feed in cache
			if (!this.articles.some((a) => a.sourceUrl === url)) {
				this.fetchFeed(url);
			}
		}
		this.saveSelectedFeeds();
	}

	selectAll(select: boolean = true) {
		if (select) {
			this.selectedFeeds = this.allFeeds.map((f) => f.url);
		} else {
			this.selectedFeeds = [];
		}
		this.saveSelectedFeeds();
	}

	addFeed(name: string, url: string) {
		try {
			new URL(url); // Validate URL
			const feed: Feed = { name, url, custom: true };
			this.customFeeds = [...this.customFeeds, feed];
			localStorage.setItem('ginkohub_custom_feeds', JSON.stringify(this.customFeeds));

			// Auto select the new feed
			if (!this.selectedFeeds.includes(url)) {
				this.selectedFeeds = [...this.selectedFeeds, url];
				this.saveSelectedFeeds();
			}
			this.fetchFeed(url);

			return { success: true, message: `Feed '${name}' added successfully.` };
		} catch (e) {
			return { success: false, message: 'Invalid URL format' };
		}
	}

	removeFeed(url: string) {
		this.customFeeds = this.customFeeds.filter((f) => f.url !== url);
		localStorage.setItem('ginkohub_custom_feeds', JSON.stringify(this.customFeeds));
		// Remove articles from this feed
		this.articles = this.articles.filter((a) => a.sourceUrl !== url);
		this.selectedFeeds = this.selectedFeeds.filter((u) => u !== url);
		this.saveSelectedFeeds();
		this.saveArticles();
	}

	// Legacy navigation methods - can be kept for UI convenience or removed
	nextFeed() {}
	prevFeed() {}

	setSelectedFeed(urlOrName: string) {
		const feed = this.allFeeds.find(
			(f) => f.url === urlOrName || f.name.toLowerCase().includes(urlOrName.toLowerCase())
		);
		if (feed) {
			if (!this.selectedFeeds.includes(feed.url)) {
				this.toggleFeed(feed.url);
			}
			return { success: true, name: feed.name };
		}
		return { success: false };
	}

	async refreshAll() {
		if (this.loading) return;
		this.loading = true;
		this.error = '';

		// We only refresh the selected feeds to be efficient
		const feedsToRefresh =
			this.selectedFeeds.length > 0
				? this.allFeeds.filter((f) => this.selectedFeeds.includes(f.url))
				: this.allFeeds;

		let newArticlesCount = 0;

		const batchSize = 3;
		for (let i = 0; i < feedsToRefresh.length; i += batchSize) {
			const batch = feedsToRefresh.slice(i, i + batchSize);
			await Promise.all(
				batch.map(async (feed) => {
					try {
						const fetched = await this.fetchFeedData(feed);
						if (fetched.length > 0) {
							this.mergeArticles(fetched);
							newArticlesCount += fetched.length;
						}
					} catch (e) {
						console.error(`Error fetching ${feed.name}:`, e);
					}
				})
			);
		}

		this.saveArticles();
		this.loading = false;
		return newArticlesCount;
	}

	private mergeArticles(newArticles: Article[]) {
		const existingLinks = new Set(this.articles.map((a) => a.link));
		const uniqueNew = newArticles.filter((a) => !existingLinks.has(a.link));

		if (uniqueNew.length > 0) {
			this.articles = [...uniqueNew, ...this.articles].sort((a, b) => {
				const dateA = a.date === 'LATEST' ? new Date().getTime() : new Date(a.date).getTime();
				const dateB = b.date === 'LATEST' ? new Date().getTime() : new Date(b.date).getTime();
				return dateB - dateA;
			});
		}
	}

	async fetchFeed(url: string) {
		const feed = this.allFeeds.find((f) => f.url === url);
		if (!feed) return;

		this.loading = true;
		try {
			const fetched = await this.fetchFeedData(feed);
			this.mergeArticles(fetched);
			this.saveArticles();
		} catch (e) {
			console.error(e);
		} finally {
			this.loading = false;
		}
	}

	private async fetchFeedData(feed: Feed): Promise<Article[]> {
		try {
			let res = await ghpFetch(feed.url, 'rss');
			let rawArticles: any[] = [];

			if (!res.success || !res.data?.items) {
				const rawRes = await ghpFetch(feed.url, 'html');
				if (rawRes.success) {
					const xmlString =
						rawRes.data.contents || (typeof rawRes.data === 'string' ? rawRes.data : '');

					if (xmlString) {
						const parser = new DOMParser();
						const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
						rawArticles = Array.from(xmlDoc.querySelectorAll('entry, item'));

						const feedHostname = new URL(feed.url).hostname;
						const fallbackImage = `https://www.google.com/s2/favicons?domain=${feedHostname}&sz=64`;

						return rawArticles.slice(0, 15).map((entry) => {
							const title = entry.querySelector('title')?.textContent || 'Untitled';
							const link =
								entry.querySelector('link[rel="alternate"]')?.getAttribute('href') ||
								entry.querySelector('link')?.getAttribute('href') ||
								entry.querySelector('link')?.textContent ||
								'';
							const pubDate = entry.querySelector('published, updated, pubDate')?.textContent || '';
							const date = pubDate ? new Date(pubDate).toISOString().split('T')[0] : 'LATEST';
							const desc = entry.querySelector('summary, content, description')?.textContent || '';
							const snippet = desc
								? desc.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
								: 'Access protocol...';

							return {
								title: this.fixEncoding(title),
								link,
								date,
								snippet,
								image: fallbackImage,
								sourceName: feed.name,
								sourceUrl: feed.url
							};
						});
					}
				}
				return [];
			}

			const data = res.data;
			if (data && data.items && Array.isArray(data.items)) {
				const feedHostname = new URL(feed.url).hostname;
				const fallbackImage = `https://www.google.com/s2/favicons?domain=${feedHostname}&sz=64`;

				return data.items.slice(0, 15).map((item: any) => {
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
						image: image || fallbackImage,
						sourceName: feed.name,
						sourceUrl: feed.url
					};
				});
			}
			return [];
		} catch (e) {
			console.error(`RSS Fetch Error [${feed.name}]:`, e);
			return [];
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
