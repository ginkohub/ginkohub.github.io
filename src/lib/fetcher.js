/**
 * Centralized data fetcher using Microlink.io API to bypass CORS
 * and provide consistent data structure.
 */
export async function microlinkFetch(url, options = {}) {
	const { timeout = 8000, ...apiOptions } = options;
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);

	try {
		const params = new URLSearchParams();
		params.append('url', url);

		// Handle nested objects for Microlink data extraction (e.g. data.items.selector)
		const flattenObject = (obj, prefix = '') => {
			Object.keys(obj).forEach((key) => {
				const value = obj[key];
				const newKey = prefix ? `${prefix}.${key}` : key;
				if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
					flattenObject(value, newKey);
				} else {
					params.append(newKey, value);
				}
			});
		};

		flattenObject(apiOptions);

		const targetUrl = `https://api.microlink.io?${params.toString()}`;
		const response = await fetch(targetUrl, { signal: controller.signal });
		clearTimeout(id);

		if (!response.ok) {
			return {
				success: false,
				error: `HTTP Error ${response.status}`,
				status: 'error'
			};
		}

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
