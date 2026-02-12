/**
 * Stock Market State Management
 * Handles major stock indices and individual stock data.
 */

export interface StockAsset {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
}

class StockState {
	selectedSymbol = $state<string>('NASDAQ:NVDA');
	loading = $state<boolean>(false);

	// Major indices and popular stocks
	indices = [
		{ symbol: 'IDX:COMPOSITE', name: 'IHSG (Indonesia)' },
		{ symbol: 'IDX:BBCA', name: 'Bank Central Asia' },
		{ symbol: 'IDX:BBRI', name: 'Bank Rakyat Indonesia' },
		{ symbol: 'IDX:TLKM', name: 'Telkom Indonesia' },
		{ symbol: 'IDX:ASII', name: 'Astra International' },
		{ symbol: 'NASDAQ:AAPL', name: 'Apple Inc.' },
		{ symbol: 'NASDAQ:TSLA', name: 'Tesla, Inc.' },
		{ symbol: 'NASDAQ:NVDA', name: 'NVIDIA' },
		{ symbol: 'NASDAQ:GOOGL', name: 'Alphabet Inc.' },
		{ symbol: 'NASDAQ:MSFT', name: 'Microsoft' },
		{ symbol: 'NASDAQ:AMZN', name: 'Amazon' },
		{ symbol: 'NYSE:BABA', name: 'Alibaba Group' }
	];

	setSelectedSymbol(symbol: string) {
		this.selectedSymbol = symbol;
	}
}

export const stockState = new StockState();
