import fetch from 'node-fetch';

interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ApiResponse {
  success?: boolean;
  error?: string;
  message?: string;
  documentId?: string;
}

// Base currency pairs configuration
const PAIRS = [
  // Major Pairs
  { pair: 'EUR_USD', basePrice: 1.085, variance: 0.002 },
  { pair: 'GBP_USD', basePrice: 1.265, variance: 0.002 },
  { pair: 'USD_JPY', basePrice: 151.5, variance: 0.2 },
  { pair: 'USD_CHF', basePrice: 0.905, variance: 0.002 },
  { pair: 'USD_CAD', basePrice: 1.355, variance: 0.002 },
  { pair: 'AUD_USD', basePrice: 0.655, variance: 0.002 },
  { pair: 'NZD_USD', basePrice: 0.605, variance: 0.002 },

  // Cross Rates
  { pair: 'EUR_GBP', basePrice: 0.855, variance: 0.002 },
  { pair: 'EUR_JPY', basePrice: 164.5, variance: 0.2 },
  { pair: 'EUR_CHF', basePrice: 0.985, variance: 0.002 },
  { pair: 'EUR_CAD', basePrice: 1.475, variance: 0.002 },
  { pair: 'EUR_AUD', basePrice: 1.655, variance: 0.002 },
  { pair: 'EUR_NZD', basePrice: 1.795, variance: 0.002 },
  { pair: 'GBP_JPY', basePrice: 191.5, variance: 0.2 },
  { pair: 'GBP_CHF', basePrice: 1.145, variance: 0.002 },
  { pair: 'GBP_CAD', basePrice: 1.715, variance: 0.002 },
  { pair: 'GBP_AUD', basePrice: 1.935, variance: 0.002 },
  { pair: 'GBP_NZD', basePrice: 2.095, variance: 0.002 },
  { pair: 'AUD_JPY', basePrice: 99.5, variance: 0.2 },
  { pair: 'AUD_CAD', basePrice: 0.885, variance: 0.002 },
  { pair: 'AUD_CHF', basePrice: 0.595, variance: 0.002 },
  { pair: 'AUD_NZD', basePrice: 1.085, variance: 0.002 },
  { pair: 'NZD_JPY', basePrice: 91.5, variance: 0.2 },
  { pair: 'NZD_CAD', basePrice: 0.815, variance: 0.002 },
  { pair: 'NZD_CHF', basePrice: 0.545, variance: 0.002 }
];

async function fetchCandleData(
  pairConfig: (typeof PAIRS)[0]
): Promise<Candle[]> {
  const mockCandles = Array.from({ length: 50 }, (_, i) => {
    const baseTimestamp = new Date('2024-03-20').getTime();
    const hourInMs = 3600000;

    const open =
      pairConfig.basePrice + (Math.random() - 0.5) * pairConfig.variance;
    const high = open + Math.random() * (pairConfig.variance / 2);
    const low = open - Math.random() * (pairConfig.variance / 2);
    const close = low + Math.random() * (high - low);

    // Use more decimal places for JPY pairs
    const decimals = pairConfig.pair.includes('JPY') ? 3 : 5;

    return {
      timestamp: new Date(baseTimestamp + i * hourInMs).toISOString(),
      open: Number(open.toFixed(decimals)),
      high: Number(high.toFixed(decimals)),
      low: Number(low.toFixed(decimals)),
      close: Number(close.toFixed(decimals))
    };
  });

  return mockCandles;
}

async function updateMarketData() {
  console.log('Starting market data update for all pairs...');

  for (const pairConfig of PAIRS) {
    try {
      const candles = await fetchCandleData(pairConfig);

      console.log(
        `Sending request to update market data for ${pairConfig.pair}...`
      );

      const response = await fetch(
        'http://localhost:3000/api/update-market-data',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pair: pairConfig.pair,
            candles
          })
        }
      );

      const responseData = (await response.json()) as ApiResponse;

      if (!response.ok) {
        console.error(
          `Response status for ${pairConfig.pair}:`,
          response.status
        );
        console.error('Response data:', responseData);
        throw new Error(
          `Failed to update market data: ${responseData.error || 'Unknown error'}`
        );
      }

      console.log(
        `Successfully updated market data for ${pairConfig.pair}:`,
        responseData
      );
    } catch (error) {
      console.error(`Error updating ${pairConfig.pair}:`, error);
    }
  }

  console.log('Completed market data update for all pairs');
}

updateMarketData();
