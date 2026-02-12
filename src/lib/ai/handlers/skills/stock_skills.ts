import { stockState } from '$lib/features/stock/stockState.svelte';
import type { ToolConfig } from '$lib/types';

export interface StockArgs {
	symbol: string;
	action?: 'view_chart';
}

export const config: ToolConfig = {
	name: 'stock_skills',
	description: 'Query global stock market data and update charts.',
	parameters: {
		type: 'object',
		properties: {
			symbol: {
				type: 'string',
				description: 'The stock symbol (e.g., AAPL, TSLA, IDX:COMPOSITE).'
			},
			action: {
				type: 'string',
				enum: ['view_chart'],
				description: 'The action to perform.'
			}
		},
		required: ['symbol']
	}
};

export const handler =
	(state: any) =>
	async ({ symbol, action }: StockArgs): Promise<string> => {
		if (state.setTab) state.setTab('stock');

		stockState.setSelectedSymbol(symbol.toUpperCase());

		return `Switched stock chart to ${symbol}.`;
	};
