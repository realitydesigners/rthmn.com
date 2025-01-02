export const API_ROUTES = {
    BOX_SLICE: '/api/getBoxSlice',
    LATEST_BOX_SLICES: '/api/getLatestBoxSlices',
    CANDLES: '/api/getCandles',
    WEBHOOKS: '/api/webhooks',
} as const;

export const SERVER_ROUTES = {
    BOX_SLICE: (pair: string) => `/boxslice/${pair}`,
    LATEST_BOX_SLICES: '/latest-boxslices',
    CANDLES: (pair: string) => `/candles/${pair}`,
} as const;
