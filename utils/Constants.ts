interface CurrencyPairDetails {
    point: number;
    digits: number;
}

export interface SymbolsToDigits {
    [key: string]: CurrencyPairDetails;
}

export const symbolsToDigits: SymbolsToDigits = {
    AUD_USD: { point: 0.00001, digits: 5 },
    GBP_USD: { point: 0.00001, digits: 5 },
    USD_CAD: { point: 0.00001, digits: 5 },
    USD_JPY: { point: 0.001, digits: 3 },
    NZD_USD: { point: 0.00001, digits: 5 },
    GBP_JPY: { point: 0.001, digits: 3 },
    AUD_JPY: { point: 0.001, digits: 3 },
    AUD_HKD: { point: 0.00001, digits: 5 },
    USD_CHF: { point: 0.00001, digits: 5 },
    CAD_HKD: { point: 0.00001, digits: 5 },
    EUR_SGD: { point: 0.00001, digits: 5 },
    NZD_CAD: { point: 0.00001, digits: 5 },
    GBP_AUD: { point: 0.00001, digits: 5 },
    EUR_USD: { point: 0.00001, digits: 5 },
    AUD_CAD: { point: 0.00001, digits: 5 },
    EUR_NOK: { point: 0.00001, digits: 5 },
    CHF_HKD: { point: 0.00001, digits: 5 },
    EUR_GBP: { point: 0.00001, digits: 5 },
    AUD_NZD: { point: 0.00001, digits: 5 },
    NZD_JPY: { point: 0.001, digits: 3 },
};
