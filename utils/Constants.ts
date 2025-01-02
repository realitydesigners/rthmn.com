interface CurrencyPairDetails {
    point: number;
    digits: number;
}

export const roundToDigits = (value: number, digits: number): number => {
    const multiplier = 10 ** digits;
    return Math.round(value * multiplier) / multiplier;
};

export interface SymbolsToDigits {
    [key: string]: CurrencyPairDetails;
}

export const symbolsToDigits: SymbolsToDigits = {
    // Forex
    EURUSD: { point: 0.00001, digits: 5 },
    GBPUSD: { point: 0.00001, digits: 5 },
    USDJPY: { point: 0.001, digits: 3 },
    AUDUSD: { point: 0.00001, digits: 5 },
    USDCAD: { point: 0.00001, digits: 5 },
    USDCHF: { point: 0.00001, digits: 5 },
    EURGBP: { point: 0.00001, digits: 5 },
    EURJPY: { point: 0.001, digits: 3 },
    GBPJPY: { point: 0.001, digits: 3 },
    NZDUSD: { point: 0.00001, digits: 5 },
    USDMXN: { point: 0.0001, digits: 4 },
    EURAUD: { point: 0.00001, digits: 5 },
    EURCHF: { point: 0.00001, digits: 5 },
    GBPAUD: { point: 0.00001, digits: 5 },
    GBPCAD: { point: 0.00001, digits: 5 },
    GBPCHF: { point: 0.00001, digits: 5 },
    AUDCAD: { point: 0.00001, digits: 5 },
    AUDCHF: { point: 0.00001, digits: 5 },
    AUDJPY: { point: 0.001, digits: 3 },
    CHFJPY: { point: 0.001, digits: 3 },
    EURNZD: { point: 0.00001, digits: 5 },
    EURCAD: { point: 0.00001, digits: 5 },
    AUDNZD: { point: 0.00001, digits: 5 },
    CADJPY: { point: 0.001, digits: 3 },
    NZDJPY: { point: 0.001, digits: 3 },
    USDSEK: { point: 0.0001, digits: 4 },

    // Crypto
    BTCUSD: { point: 0.01, digits: 2 },
    ETHUSD: { point: 0.01, digits: 2 },
    XRPUSD: { point: 0.0001, digits: 4 },
    DOTUSD: { point: 0.0001, digits: 4 },
    ADAUSD: { point: 0.0001, digits: 4 },
    SOLUSD: { point: 0.01, digits: 2 },
    BNBUSD: { point: 0.01, digits: 2 },
    DOGEUSD: { point: 0.00001, digits: 5 },
    MATICUSD: { point: 0.0001, digits: 4 },
    AVAXUSD: { point: 0.01, digits: 2 },
    LINKUSD: { point: 0.0001, digits: 4 },
    UNIUSD: { point: 0.0001, digits: 4 },
    ATOMUSD: { point: 0.01, digits: 2 },
    LTCUSD: { point: 0.01, digits: 2 },
    FILUSD: { point: 0.01, digits: 2 },
    TRXUSD: { point: 0.00001, digits: 5 },
    XLMUSD: { point: 0.00001, digits: 5 },
    EOSUSD: { point: 0.0001, digits: 4 },
    XTZUSD: { point: 0.0001, digits: 4 },
    ALGOUSD: { point: 0.0001, digits: 4 },
    NEARUSD: { point: 0.0001, digits: 4 },
    ICPUSD: { point: 0.01, digits: 2 },
    AAVEUSD: { point: 0.01, digits: 2 },
    FTMUSD: { point: 0.0001, digits: 4 },
    SANDUSD: { point: 0.0001, digits: 4 },
    MANAUSD: { point: 0.0001, digits: 4 },

    // Equity
    AAPL: { point: 0.01, digits: 2 },

    // ETF
    SPY: { point: 0.01, digits: 2 },
};

export const FOREX_PAIRS = [
    'EURUSD',
    'GBPUSD',
    'USDJPY',
    'AUDUSD',
    'USDCAD',
    'USDCHF',
    'EURGBP',
    'EURJPY',
    'GBPJPY',
    'NZDUSD',
    'USDMXN',
    'EURAUD',
    'EURCHF',
    'GBPAUD',
    'GBPCAD',
    'GBPCHF',
    'AUDCAD',
    'AUDCHF',
    'AUDJPY',
    'CHFJPY',
    'EURNZD',
    'EURCAD',
    'AUDNZD',
    'CADJPY',
    'NZDJPY',
    'USDSEK',
] as const;

export const CRYPTO_PAIRS = [
    'BTCUSD',
    'ETHUSD',
    'XRPUSD',
    'DOTUSD',
    'ADAUSD',
    'SOLUSD',
    'BNBUSD',
    'DOGEUSD',
    'MATICUSD',
    'AVAXUSD',
    'LINKUSD',
    'UNIUSD',
    'ATOMUSD',
    'LTCUSD',
    'FILUSD',
    'TRXUSD',
    'XLMUSD',
    'EOSUSD',
    'XTZUSD',
    'ALGOUSD',
    'NEARUSD',
    'ICPUSD',
    'AAVEUSD',
    'FTMUSD',
    'SANDUSD',
    'MANAUSD',
] as const;

export const EQUITY_PAIRS = ['AAPL'] as const;
export const ETF_PAIRS = ['SPY'] as const;

export const PAIRS = [...FOREX_PAIRS, ...CRYPTO_PAIRS, ...EQUITY_PAIRS, ...ETF_PAIRS] as const;

// Convert to TwelveData format (only used for API calls)
export const toTwelveDataFormat = (pair: string): string => {
    return pair.length === 6 ? `${pair.slice(0, 3)}/${pair.slice(3)}` : pair;
};

export function toOandaFormat(pair: string): string {
    return pair.replace(/([A-Z]{3})([A-Z]{3})/, '$1_$2');
}

export const BoxSizes = [
    2000, 1732, 1500, 1299, 1125, 974, 843, 730, 632, 548, 474, 411, 356, 308, 267, 231, 200, 173, 150, 130, 112, 97, 84, 73, 63, 55, 47, 41, 36, 31, 27, 23, 20, 17, 15, 13, 11,
    10,
];
