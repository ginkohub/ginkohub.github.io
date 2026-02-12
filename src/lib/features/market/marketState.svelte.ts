/**
 * Market State Management
 * Handles live crypto prices and historical data for charts.
 * Powered by Binance Public API.
 */

import { ghpFetch } from '$lib/fetcher';

export interface MarketAsset {
	symbol: string;
	pair: string;
	price: number;
	change24h: number;
	high24h: number;
	low24h: number;
	volume: number;
}

export interface ExchangeRate {
	code: string;
	name: string;
	rate: number;
	flag: string;
}

class MarketState {
	assets = $state<MarketAsset[]>([]);
	rates = $state<ExchangeRate[]>([]);
	selectedSymbol = $state<string>('BTC');
	loading = $state<boolean>(false);
	error = $state<string | null>(null);
	ws: WebSocket | null = null;

	// Converter State (Dynamic Bidirectional)
	convFrom = $state<string>('USD');
	convTo = $state<string>('IDR');
	valFrom = $state<number>(1);
	valTo = $state<number>(0);
	lastEdited = $state<'from' | 'to'>('from');

	// Raw rates from USD base (for internal calculation)
	private rawRates = $state<Record<string, number>>({});

	// Tracked symbols
	private symbols = [
		'BTCUSDT',
		'ETHUSDT',
		'SOLUSDT',
		'BNBUSDT',
		'ADAUSDT',
		'DOTUSDT',
		'DOGEUSDT',
		'XRPUSDT',
		'LINKUSDT',
		'MATICUSDT',
		'AVAXUSDT',
		'UNIUSDT'
	];
	private currencies = [
		{ code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩' },
		{ code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
		{ code: 'EUR', name: 'Euro', flag: '🇪🇺' },
		{ code: 'JPY', name: 'JP Yen', flag: '🇯🇵' },
		{ code: 'GBP', name: 'GB Pound', flag: '🇬🇧' },
		{ code: 'SGD', name: 'SG Dollar', flag: '🇸🇬' },
		{ code: 'SAR', name: 'SA Riyal', flag: '🇸🇦' }
	];

	constructor() {
		// Pre-populate symbols so dropdown is never empty
		this.assets = this.symbols.map((s) => ({
			symbol: s.replace('USDT', ''),
			pair: s,
			price: 0,
			change24h: 0,
			high24h: 0,
			low24h: 0,
			volume: 0
		}));

		if (typeof window !== 'undefined') {
			this.init();
		}
	}

	// Use $derived for the conversion to avoid effect_orphan
	valToComputed = $derived.by(() => {
		if (this.lastEdited === 'to' || !this.rawRates[this.convFrom] || !this.rawRates[this.convTo]) {
			return this.valTo;
		}
		return (this.valFrom / this.rawRates[this.convFrom]) * this.rawRates[this.convTo];
	});

	valFromComputed = $derived.by(() => {
		if (
			this.lastEdited === 'from' ||
			!this.rawRates[this.convFrom] ||
			!this.rawRates[this.convTo]
		) {
			return this.valFrom;
		}
		return (this.valTo / this.rawRates[this.convTo]) * this.rawRates[this.convFrom];
	});

	async init() {
		this.loading = true;
		try {
			// Fetch data in parallel but don't let one failure block everything
			await Promise.allSettled([this.fetchInitialData(), this.fetchForexData()]);
			this.connectWebSocket();
		} catch (e) {
			this.error = 'Failed to establish market uplink.';
			console.error(e);
		} finally {
			this.loading = false;
		}
	}

	private async fetchForexData() {
		try {
			// er-api supports CORS, try direct fetch first for better reliability
			let data;
			try {
				const directRes = await fetch('https://open.er-api.com/v6/latest/USD');
				if (directRes.ok) {
					data = await directRes.json();
				}
			} catch (directErr) {
				console.warn('Direct forex fetch failed, trying proxy...', directErr);
				const proxyRes = await ghpFetch('https://open.er-api.com/v6/latest/USD');
				if (proxyRes.success) {
					data = proxyRes.data;
				}
			}

			if (data && data.rates) {
				this.rawRates = data.rates;
				const idrToUsd = data.rates['IDR'];

				if (idrToUsd) {
					this.rates = this.currencies
						.filter((c) => c.code !== 'IDR')
						.map((c) => {
							const rateToUsd = data.rates[c.code] || 1;
							const finalRate = idrToUsd / rateToUsd;

							return {
								...c,
								rate: finalRate
							};
						});

					// Force initial calculation
					this.lastEdited = 'from';
					this.valTo = (this.valFrom / this.rawRates[this.convFrom]) * this.rawRates[this.convTo];
					return;
				}
			}
			console.error('Forex data format invalid or missing rates', data);
		} catch (e) {
			console.error('Forex fetch process failed', e);
		}
	}

	private async fetchInitialData() {
		const symbolsJson = JSON.stringify(this.symbols);
		const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsJson}`;

		let data: any[] = [];

		try {
			// Try proxy first
			const res = await ghpFetch(url);
			if (res.success && Array.isArray(res.data)) {
				data = res.data;
			} else {
				// Fallback to direct fetch (might work on some browsers/extensions)
				const directRes = await fetch(url);
				if (directRes.ok) {
					data = await directRes.json();
				}
			}

			if (data && data.length > 0) {
				data.forEach((item: any) => {
					const symbol = item.symbol.replace('USDT', '');
					const index = this.assets.findIndex((a) => a.symbol === symbol);
					if (index !== -1) {
						this.assets[index] = {
							symbol,
							pair: item.symbol,
							price: parseFloat(item.lastPrice) || 0,
							change24h: parseFloat(item.priceChangePercent) || 0,
							high24h: parseFloat(item.highPrice) || 0,
							low24h: parseFloat(item.lowPrice) || 0,
							volume: parseFloat(item.quoteVolume) || 0
						};
					}
				});
			}
		} catch (e) {
			console.warn('Initial market fetch failed', e);
		}
	}

	private connectWebSocket() {
		if (this.ws) this.ws.close();

		// Use the combined stream endpoint which is more stable for multiple symbols
		const streamNames = this.symbols.map((s) => `${s.toLowerCase()}@ticker`).join('/');
		this.ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streamNames}`);

		this.ws.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data);
				// Combined streams are wrapped in { stream, data }
				const data = msg.data || msg;

				if (!data.s) return; // Not a ticker message

				const symbol = data.s.replace('USDT', '');
				const index = this.assets.findIndex((a) => a.symbol === symbol);

				if (index !== -1) {
					this.assets[index] = {
						...this.assets[index],
						price: parseFloat(data.c),
						change24h: parseFloat(data.P),
						high24h: parseFloat(data.h),
						low24h: parseFloat(data.l),
						volume: parseFloat(data.q)
					};
				}
			} catch (e) {
				console.error('WS Message parsing failed', e);
			}
		};

		this.ws.onerror = () => {
			this.error = 'Neural link interference detected.';
		};

		this.ws.onclose = () => {
			// Reconnect after 5 seconds if closed
			setTimeout(() => this.connectWebSocket(), 5000);
		};
	}

	get selectedAsset() {
		return this.assets.find((a) => a.symbol === this.selectedSymbol) || this.assets[0];
	}

	setSelectedSymbol(symbol: string) {
		this.selectedSymbol = symbol;
	}

	cleanup() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}
}

export const marketState = new MarketState();
