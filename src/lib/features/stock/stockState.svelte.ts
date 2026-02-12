/**
 * Stock Market State Management
 * Focuses on managing the selected asset for the high-performance TradingView chart.
 */

export interface StockAsset {
	symbol: string;
	name: string;
	exchange: string;
}

class StockState {
	selectedSymbol = $state<string>('NASDAQ:NVDA');
	loading = $state<boolean>(false);

	// Major indices and popular stocks
	assets: StockAsset[] = [
		{ symbol: 'NASDAQ:NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
		{ symbol: 'IDX:COMPOSITE', name: 'IHSG (Indonesia)', exchange: 'IDX' },
		{ symbol: 'IDX:BBCA', name: 'Bank Central Asia', exchange: 'IDX' },
		{ symbol: 'IDX:BBRI', name: 'Bank Rakyat Indonesia', exchange: 'IDX' },
		{ symbol: 'IDX:TLKM', name: 'Telkom Indonesia', exchange: 'IDX' },
		{ symbol: 'IDX:ASII', name: 'Astra International', exchange: 'IDX' },
		{ symbol: 'NASDAQ:AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
		{ symbol: 'NASDAQ:TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ' },
		{ symbol: 'NASDAQ:AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ' },
		{ symbol: 'NASDAQ:MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
		{ symbol: 'NASDAQ:GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
		{ symbol: 'NYSE:BABA', name: 'Alibaba Group', exchange: 'NYSE' }
	];

	get selectedAsset() {
		return this.assets.find((a) => a.symbol === this.selectedSymbol) || this.assets[0];
	}

	setSelectedSymbol(symbol: string) {
		this.selectedSymbol = symbol;
	}
}

export const stockState = new StockState();
