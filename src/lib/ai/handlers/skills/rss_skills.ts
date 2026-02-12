import { newsState } from '$lib/features/news/newsState.svelte';
import { ghpFetch } from '$lib/fetcher';
import type { ToolConfig } from '$lib/types';

export interface RssArgs {
	action:
		| 'switch_feed'
		| 'fetch_headlines'
		| 'refresh'
		| 'add_feed'
		| 'list_feeds'
		| 'delete_feed'
		| 'mark_all_read'
		| 'filter_unread'
		| 'filter_all';
	source?: string;
	name?: string;
}

export const config: ToolConfig = {
	name: 'rss_skills',
	description: 'Manage news sources, filter articles, and fetch latest headlines.',
	parameters: {
		type: 'object',
		properties: {
			action: {
				type: 'string',
				enum: [
					'switch_feed',
					'fetch_headlines',
					'refresh',
					'add_feed',
					'list_feeds',
					'delete_feed',
					'mark_all_read',
					'filter_unread',
					'filter_all'
				],
				description: 'The action to perform on the News system.'
			},
			source: {
				type: 'string',
				description: 'The name of the news source or the URL to add/fetch/delete.'
			},
			name: {
				type: 'string',
				description: 'The custom name for the source when using add_feed (e.g., "My Tech News").'
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
				const activeCount = newsState.selectedFeeds.length;
				return `Available Sources: ${feeds}. currently active: ${activeCount || 'All'}`;
			}

			if (action === 'switch_feed') {
				if (!source) return 'Error: source name required to toggle source.';
				const result = newsState.setSelectedFeed(source);
				if (result.success) return `Toggled news source: ${result.name}`;
				return `News source "${source}" not found in system directory.`;
			}

			if (action === 'add_feed') {
				if (!source || !source.startsWith('http'))
					return 'Error: Valid RSS URL required to add source.';
				const feedName = name || 'Neural Source';
				newsState.addFeed(feedName, source);
				return `Source '${feedName}' connected to neural stream.`;
			}

			if (action === 'delete_feed') {
				if (!source) return 'Error: source required to delete.';
				const feed = newsState.allFeeds.find(
					(f) => f.url === source || f.name.toLowerCase().includes(source.toLowerCase())
				);
				if (!feed) return `Error: Could not find source matching "${source}" to delete.`;
				if (!feed.custom) return 'Error: System sources cannot be deleted, only custom ones.';

				const feedName = feed.name;
				newsState.removeFeed(feed.url);
				return `Source '${feedName}' has been disconnected from your stream.`;
			}

			if (action === 'refresh') {
				newsState.refreshAll();
				return 'Refreshing news stream from active sources...';
			}

			if (action === 'mark_all_read') {
				newsState.markAllAsRead();
				return 'All articles marked as read.';
			}

			if (action === 'filter_unread') {
				newsState.setFilterMode('new');
				return 'Filtering to show only NEW articles.';
			}

			if (action === 'filter_all') {
				newsState.setFilterMode('all');
				return 'Showing all articles.';
			}

			if (action === 'fetch_headlines') {
				// Use the first selected feed if no source provided
				const targetUrl =
					source ||
					(newsState.selectedFeeds.length > 0
						? newsState.selectedFeeds[0]
						: newsState.allFeeds[0].url);
				const res = await ghpFetch(targetUrl, 'rss');
				if (!res.success) return `RSS Fetch failed: ${res.error}`;

				const items = res.data.items
					?.slice(0, 5)
					.map((i: any) => i.title)
					.join(' | ');
				return `Latest Headlines from ${source || 'primary source'}: ${items}`;
			}
		} catch (e: any) {
			return `News Skill Error: ${e.message}`;
		}
		return 'Action ignored.';
	};
