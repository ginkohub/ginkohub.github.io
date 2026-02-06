/**
 * Centralized data fetcher using Microlink.io API to bypass CORS
 * and provide consistent data structure.
 */
export async function microlinkFetch(url, options = {}) {
	try {
		const targetUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&${new URLSearchParams(options).toString()}`;
		const response = await fetch(targetUrl);
		const result = await response.json();

		if (result.status === 'success') {
			return {
				success: true,
				data: result.data,
				status: result.status
			};
		} else {
			return {
				success: false,
				error: result.message || 'Transmission failed',
				status: result.status
			};
		}
	} catch (e) {
		return {
			success: false,
			error: 'Network error or invalid target',
			details: e.message
		};
	}
}
