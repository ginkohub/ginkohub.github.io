/**
 * Centralized data fetcher using Microlink.io API to bypass CORS
 * and provide consistent data structure.
 */
export async function microlinkFetch(url, options = {}) {
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

		flattenObject(options);

		const targetUrl = `https://api.microlink.io?${params.toString()}`;
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
