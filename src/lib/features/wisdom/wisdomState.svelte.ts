import { styleConfigs } from '$lib/utils/quoteGenerator.js';
import type { Quote } from '$lib/types';

class WisdomState {
	// Quote Data
	scrapedQuotes = $state<Quote[]>([]);
	currentQuoteIndex = $state<number>(0);
	quote = $derived<Quote>({
		text: this.scrapedQuotes[this.currentQuoteIndex]?.text || 'Seeking wisdom...',
		author: this.scrapedQuotes[this.currentQuoteIndex]?.author || 'Rumi'
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
		if (this.scrapedQuotes.length === 0) return;
		this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.scrapedQuotes.length;
	}
	prev() {
		if (this.scrapedQuotes.length === 0) return;
		this.currentQuoteIndex =
			(this.currentQuoteIndex - 1 + this.scrapedQuotes.length) % this.scrapedQuotes.length;
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
