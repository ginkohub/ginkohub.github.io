import fs from 'fs';
import path from 'path';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	let quotes = [];

	// Try to read from the manually scraped file first
	try {
		const filePath = path.join(process.cwd(), 'static/data/quotes.json');
		if (fs.existsSync(filePath)) {
			const data = fs.readFileSync(filePath, 'utf-8');
			quotes = JSON.parse(data);
		}
	} catch (e) {
		console.error('Error reading scraped quotes:', e);
	}

	// Fallback if the file doesn't exist or is empty
	if (quotes.length === 0) {
		quotes = [
			{ text: 'The wound is the place where the Light enters you.', author: 'Rumi' },
			{ text: 'What you seek is seeking you.', author: 'Rumi' },
			{ text: 'What you love, you are.', author: 'Rumi' }
		];
	}

	return {
		quotes: quotes
	};
};
