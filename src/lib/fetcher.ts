/**
 * Centralized data fetcher using GHP Tools to bypass CORS
 * and provide specialized parsing for RSS and GitHub Trends.
 * API: https://ghp-tools.vercel.app/docs-json
 */

export interface GhpResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	details?: string;
	status?: string;
}

export type FetchType = 'html' | 'rss' | 'meta';

/**
 * Centralized data fetcher using GHP Tools to bypass CORS
 * and provide specialized parsing for RSS and GitHub Trends.
 *
 * @param url - The target URL to fetch.
 * @param type - The type of content to fetch.
 * @returns Promise with structured response.
 */
export async function ghpFetch<T = any>(
	url: string,
	type: FetchType = 'html'
): Promise<GhpResponse<T>> {
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

		let data: T;
		const text = await response.text();
		try {
			data = JSON.parse(text);
		} catch {
			data = text as unknown as T;
		}

		return {
			success: true,
			data
		};
	} catch (e) {
		const err = e as Error;
		clearTimeout(id);
		if (err.name === 'AbortError') {
			return {
				success: false,
				error: 'Request timed out (8s limit)',
				details: 'Server took too long to respond'
			};
		}
		return {
			success: false,
			error: 'Network error or invalid target',
			details: err.message
		};
	}
}
