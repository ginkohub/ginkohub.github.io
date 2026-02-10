/**
 * Utility script to test all RSS feeds in tech-feeds.json
 * Run with: bun scripts/test-feeds.ts
 */

import feeds from '../src/lib/data/tech-feeds.json';

const API_BASE = 'https://ghp-tools.vercel.app/api/v1/tools/rss?url=';

async function testFeeds() {
	console.log('--- Starting RSS Feed Validation ---\n');

	let total = 0;
	let success = 0;
	const failed: Array<{ name: string; url: string; error: string }> = [];

	for (const group of feeds) {
		console.log(`\nGroup: ${group.name}`);
		for (const feed of group.feeds) {
			total++;
			process.stdout.write(`Testing [${feed.name}]... `);

			try {
				const response = await fetch(`${API_BASE}${encodeURIComponent(feed.url)}`);
				const data = (await response.json()) as any;

				if (response.ok && data.items) {
					console.log('OK');
					success++;
				} else {
					const rawRes = await fetch(
						`https://ghp-tools.vercel.app/api/v1/fetch?url=${encodeURIComponent(feed.url)}`
					);
					if (rawRes.ok) {
						console.log('API PARSE FAILED (Fallback required)');
						success++;
					} else {
						console.log('FAILED');
						failed.push({ name: feed.name, url: feed.url, error: data.error || 'Network Error' });
					}
				}
			} catch (e: any) {
				console.log('ERROR');
				failed.push({ name: feed.name, url: feed.url, error: e.message });
			}
		}
	}

	console.log('\n' + '='.repeat(40));
	console.log(`SUMMARY: ${success}/${total} Feeds Operational`);
	if (failed.length > 0) {
		console.log('\nFAILED FEEDS:');
		failed.forEach((f) => console.log(`   - ${f.name}: ${f.url} (${f.error})`));
	}
	console.log('='.repeat(40));
}

testFeeds();
