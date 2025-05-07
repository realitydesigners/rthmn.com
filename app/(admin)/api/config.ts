export const API_ROUTES = {
	BOX_SLICE: "/api/getBoxSlice",
	LATEST_BOX_SLICES: "/api/getLatestBoxSlices",
	LATEST_CANDLES: "/api/getLatestCandles",
	CANDLES: "/api/getCandles",
	WEBHOOKS: "/api/webhooks",
} as const;

export const SERVER_ROUTES = {
	BOX_SLICE: (pair: string) => `/boxslice/${pair}`,
	LATEST_BOX_SLICES: "/latest-boxslices",
	LATEST_CANDLES: "/latest-candles",
	CANDLES: (pair: string) => `/candles/${pair}`,
} as const;
