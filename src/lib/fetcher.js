/**
 * Centralized data fetcher using GHP Tools to bypass CORS
 * and provide specialized parsing for RSS and GitHub Trends.
 * API: https://ghp-tools.vercel.app/docs-json
 */
export async function ghpFetch(url, type = 'html') {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), 8000);

	try {
		let endpoint = 'https://ghp-tools.vercel.app/api/v1/fetch';
		const params = new URLSearchParams();
		params.append('url', url);

		if (type === 'rss') {
			endpoint = 'https://ghp-tools.vercel.app/api/v1/tools/rss';
		} else if (type === 'meta') {
			params.append('format', 'meta');
		} else {
			params.append('format', 'json');
		}

		const response = await fetch(`${endpoint}?${params.toString()}`, {
			signal: controller.signal
		});
		clearTimeout(id);

		if (!response.ok) {
			return {
				success: false,
				error: `HTTP Error ${response.status}`,
				status: 'error'
			};
		}

		let data;
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			data = await response.json();
		} else {
			data = await response.text();
		}

		return {
			success: true,
			data
		};
	} catch (e) {
		clearTimeout(id);
		if (e.name === 'AbortError') {
			return {
				success: false,
				error: 'Request timed out (8s limit)',
				details: 'Server took too long to respond'
			};
		}
		return {
			success: false,
			error: 'Network error or invalid target',
			details: e.message
		};
	}
}