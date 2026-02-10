import https from 'https';
import fs from 'fs';
import path from 'path';

// Correct Rumi Author ID from user
const AUTHOR_ID = '875661.Jalal_ad_Din_Muhammad_ar_Rumi';
const PAGES_TO_SCRAPE = 10;
const OUTPUT_PATH = path.join(process.cwd(), 'static/data/quotes.json');

async function fetchPage(page) {
	const url = `https://www.goodreads.com/author/quotes/${AUTHOR_ID}?page=${page}`;
	console.log(`🔍 Fetching Page ${page}: ${url}`);

	return new Promise((resolve, reject) => {
		const options = {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
				Accept:
					'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,webp,image/apng,*/*;q=0.8',
				'Accept-Language': 'en-US,en;q=0.9',
				Referer: 'https://www.goodreads.com/'
			}
		};

		https
			.get(url, options, (res) => {
				if (res.statusCode !== 200) {
					console.log(`❌ Page ${page} returned status: ${res.statusCode}`);
					resolve([]);
					return;
				}

				let data = '';
				res.on('data', (chunk) => (data += chunk));
				res.on('end', () => {
					const scrapedQuotes = [];
					// Target the quote container
					const quoteRegex = /<div class="quoteText">([\s\S]*?)<\/div>/g;
					let match;

					while ((match = quoteRegex.exec(data)) !== null) {
						let containerHtml = match[1];

						// Extract the quote text
						const quoteMatch = containerHtml.match(/&ldquo;([\s\S]*?)&rdquo;/);

						// Extract the author/source (authorOrTitle span)
						const authorMatch = containerHtml.match(
							/<span class="authorOrTitle">([\s\S]*?)<\/span>/
						);

						if (quoteMatch) {
							const cleanQuote = quoteMatch[1]
								.replace(/<br\s*\/?>/gi, ' ')
								.replace(/<\/?[^>]+(>|$)/g, '')
								.replace(/&nbsp;/g, ' ')
								.replace(/\s+/g, ' ')
								.trim();

							let cleanAuthor = 'Rumi';
							if (authorMatch) {
								cleanAuthor = authorMatch[1].replace(/,/g, '').trim();
							}

							if (cleanQuote.length > 10) {
								scrapedQuotes.push({
									text: cleanQuote,
									author: cleanAuthor
								});
							}
						}
					}
					console.log(`   ✨ Found ${scrapedQuotes.length} quotes on page ${page}`);
					resolve(scrapedQuotes);
				});
			})
			.on('error', (err) => {
				console.error(`🌐 Network Error on page ${page}:`, err.message);
				resolve([]);
			});
	});
}

async function run() {
	try {
		let allQuotes = [];
		for (let i = 1; i <= PAGES_TO_SCRAPE; i++) {
			const pageQuotes = await fetchPage(i);
			allQuotes = [...allQuotes, ...pageQuotes];
			if (i < PAGES_TO_SCRAPE) await new Promise((r) => setTimeout(r, 1000));
		}

		// De-duplicate based on the quote text
		const seen = new Set();
		const uniqueQuotes = allQuotes.filter((item) => {
			const duplicate = seen.has(item.text);
			seen.add(item.text);
			return !duplicate;
		});

		if (uniqueQuotes.length > 0) {
			const dir = path.dirname(OUTPUT_PATH);
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

			fs.writeFileSync(OUTPUT_PATH, JSON.stringify(uniqueQuotes, null, 2));
			console.log(
				`\n✅ Success! Saved ${uniqueQuotes.length} quotes with author data to ${OUTPUT_PATH}\n`
			);
		} else {
			console.log('\n⚠️ No quotes found.');
		}
	} catch (error) {
		console.error('\n❌ Fatal Error:', error.message);
	}
}

run();
