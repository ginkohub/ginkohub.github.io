import { newsState } from '$lib/features/news/newsState.svelte';
import { ghpFetch } from '$lib/fetcher';
import type { ToolConfig } from '$lib/types';

export interface RssArgs {
	action:
		| 'switch_feed'
		| 'fetch_headlines'
		| 'refresh'
		| 'next_feed'
		| 'prev_feed'
		| 'add_feed'
		| 'list_feeds'
		| 'delete_feed';
	source?: string;
	name?: string;
}

export const config: ToolConfig = {
	name: 'rss_skills',
	description: 'Manage RSS feeds, switch news sources, navigate feeds, and fetch latest headlines.',
	parameters: {
		type: 'object',
		properties: {
			action: {
				type: 'string',
				enum: [
					'switch_feed',
					'fetch_headlines',
					'refresh',
					'next_feed',
					'prev_feed',
					'add_feed',
					'list_feeds',
					'delete_feed'
				],
				description: 'The action to perform on the RSS/News system.'
			},
			source: {
				type: 'string',
				description: 'The name of the RSS source or the URL to add/fetch/delete.'
			},
			name: {
				type: 'string',
				description: 'The custom name for the feed when using add_feed (e.g., "My Tech News").'
			}
		},
		required: ['action']
	}
};

export const handler =
	(state: any) =>
	async ({ action, source, name }: RssArgs): Promise<string> => {
		// Skip tab switching for simple listing
		if (state.setTab && action !== 'list_feeds') state.setTab('news');

		try {
			if (action === 'list_feeds') {
				const feeds = newsState.allFeeds.map((f) => f.name).join(', ');
				return `Available RSS Sources: ${feeds}`;
			}

			if (action === 'switch_feed') {
				if (!source) return 'Error: source name required to switch feed.';
				const result = newsState.setSelectedFeed(source);
				if (result.success) return `Switched news stream to: ${result.name}`;
				return `RSS source "${source}" not found in system directory.`;
			}

			if (action === 'next_feed') {
				newsState.nextFeed();
				return `Switched to NEXT feed source.`;
			}

			if (action === 'prev_feed') {
				newsState.prevFeed();
				return `Switched to PREVIOUS feed source.`;
			}

			if (action === 'add_feed') {
				if (!source || !source.startsWith('http'))
					return 'Error: Valid RSS URL required to add feed.';
				const feedName = name || 'Neural Feed';
				newsState.addFeed(feedName, source);
				return `Feed '${feedName}' connected to neural stream.`;
			}

			if (action === 'delete_feed') {
				if (!source) return 'Error: source required to delete feed.';
				const feed = newsState.allFeeds.find(
					(f) => f.url === source || f.name.toLowerCase().includes(source.toLowerCase())
				);
				if (!feed) return `Error: Could not find feed matching "${source}" to delete.`;
				if (!feed.custom) return 'Error: System feeds cannot be deleted, only custom ones.';

				const feedName = feed.name;
				newsState.removeFeed(feed.url);
				return `Feed '${feedName}' has been disconnected from your stream.`;
			}

			if (action === 'refresh') {
				newsState.fetchFeed();
				return 'Refreshing news stream...';
			}

			if (action === 'fetch_headlines') {
				const targetUrl = source || newsState.selectedFeed;
				const res = await ghpFetch(targetUrl, 'rss');
				if (!res.success) return `RSS Fetch failed: ${res.error}`;

				const items = res.data.items
					?.slice(0, 5)
					.map((i: any) => i.title)
					.join(' | ');
				return `Latest Headlines: ${items}`;
			}
		} catch (e: any) {
			return `RSS Skill Error: ${e.message}`;
		}
		return 'Action ignored.';
	};
