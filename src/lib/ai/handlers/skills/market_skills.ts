import { marketState } from '$lib/features/market/marketState.svelte';
import type { ToolConfig } from '$lib/types';

export interface MarketArgs {
	symbol: string;
	amount?: number;
	action?: 'view_chart' | 'get_price' | 'get_kurs' | 'convert';
}

export const config: ToolConfig = {
	name: 'market_skills',
	description: 'Query crypto market data and update price charts.',
	parameters: {
		type: 'object',
		properties: {
			symbol: {
				type: 'string',
				description: 'The crypto symbol (e.g., BTC, ETH) or currency code (e.g., USD, EUR).'
			},
			amount: {
				type: 'number',
				description: 'The amount to convert (optional).'
			},
			action: {
				type: 'string',
				enum: ['view_chart', 'get_price', 'get_kurs', 'convert'],
				description: 'The action to perform.'
			}
		},
		required: ['symbol']
	}
};

export const handler =
	(state: any) =>
	async ({ symbol, amount, action }: MarketArgs): Promise<string> => {
		const cleanSymbol = symbol.toUpperCase().replace('USDT', '');

		if (state.setTab) state.setTab('market');

		if (action === 'get_kurs' || action === 'convert') {
			if (action === 'convert' && amount) {
				marketState.convFrom = 'IDR';
				marketState.convTo = cleanSymbol;
				marketState.valFrom = amount;
				marketState.lastEdited = 'from';

				return `Konversi Rp ${amount.toLocaleString()} ke ${cleanSymbol} sudah disiapkan di tab Market.`;
			}

			const rate = marketState.rates.find((r) => r.code === cleanSymbol);
			if (rate) {
				return `Kurs ${rate.name} (${rate.code}) saat ini adalah Rp ${rate.rate.toLocaleString()}.`;
			}
			return `Data kurs untuk ${cleanSymbol} tidak ditemukan.`;
		}

		marketState.setSelectedSymbol(cleanSymbol);

		const asset = marketState.assets.find((a) => a.symbol === cleanSymbol);
		if (asset) {
			return `Switched chart to ${cleanSymbol}. Current price: $${asset.price.toLocaleString()}. 24h Change: ${asset.change24h.toFixed(2)}%.`;
		}

		return `Switched chart to ${cleanSymbol}. Synchronizing data...`;
	};
