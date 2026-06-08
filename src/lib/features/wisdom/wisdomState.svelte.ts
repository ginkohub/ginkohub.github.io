import { styleConfigs } from '$lib/utils/quoteGenerator.js';
import type { Quote } from '$lib/types';

class WisdomState {
	// Quote Data
	scrapedQuotes = $state<Quote[]>([]);
	searchQuery = $state<string>('');
	currentQuoteIndex = $state<number>(0);

	filteredQuotes = $derived<Quote[]>(
		this.searchQuery.trim() === ''
			? this.scrapedQuotes
			: this.scrapedQuotes.filter((q) => {
					const queryWords = this.searchQuery.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
					const content = (q.text + ' ' + q.author).toLowerCase();
					return queryWords.every((word) => content.includes(word));
				})
	);

	currentQuoteId = $derived<string>(
		this.filteredQuotes[this.currentQuoteIndex]
			? (this.scrapedQuotes.indexOf(this.filteredQuotes[this.currentQuoteIndex]) + 1).toString()
			: '0'
	);

	quote = $derived<Quote>({
		text:
			this.filteredQuotes[this.currentQuoteIndex]?.text ||
			(this.searchQuery ? 'No matching wisdom found...' : 'Seeking wisdom...'),
		author: this.filteredQuotes[this.currentQuoteIndex]?.author || (this.searchQuery ? '' : 'Rumi')
	});

	// Style State
	selectedStyle = $state<string>('glass');
	selectedFont = $state<string>('serif');
	selectedAlign = $state<string>('center');
	grayscaleMode = $state<boolean>(true);

	// Signals for AI interaction
	nextSignal = $state<number>(0);
	prevSignal = $state<number>(0);

	init(quotes: Quote[]) {
		if (quotes && quotes.length > 0) {
			this.scrapedQuotes = quotes;
			this.currentQuoteIndex = Math.floor(Math.random() * quotes.length);
		}
	}

	setSearchQuery(query: string) {
		this.searchQuery = query;
		this.currentQuoteIndex = 0;
	}

	setQuoteById(id: string) {
		const index = parseInt(id) - 1;
		if (!isNaN(index) && index >= 0 && index < this.scrapedQuotes.length) {
			const quote = this.scrapedQuotes[index];
			const filteredIndex = this.filteredQuotes.indexOf(quote);
			if (filteredIndex !== -1) {
				this.currentQuoteIndex = filteredIndex;
			} else {
				// If not in filtered results, clear search and set index
				this.searchQuery = '';
				this.currentQuoteIndex = index;
			}
		}
	}

	setStyle(style: string) {
		// @ts-ignore - styleConfigs is not yet typed
		if (styleConfigs[style]) {
			this.selectedStyle = style;
		}
	}

	setFont(font: string) {
		this.selectedFont = font;
	}

	setAlign(align: string) {
		this.selectedAlign = align;
	}

	toggleGrayscale(value?: boolean) {
		this.grayscaleMode = value !== undefined ? value : !this.grayscaleMode;
	}

	next() {
		if (this.filteredQuotes.length === 0) return;
		this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.filteredQuotes.length;
	}
	prev() {
		if (this.filteredQuotes.length === 0) return;
		this.currentQuoteIndex =
			(this.currentQuoteIndex - 1 + this.filteredQuotes.length) % this.filteredQuotes.length;
	}

	// For compatibility with old signal system if needed
	triggerNext() {
		this.nextSignal++;
	}
	triggerPrev() {
		this.prevSignal++;
	}
}

export const wisdomState = new WisdomState();
