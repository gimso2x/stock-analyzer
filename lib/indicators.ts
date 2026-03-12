import type { StockCandle } from './finnhub';
import dayjs from 'dayjs';

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
      continue;
    }

    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }

  return sma;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];

  const multiplier = 2 / (period + 1);

  // Start with SMA for the first EMA value
  const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(firstSMA);

  // Calculate EMA for the rest
  for (let i = period; i < prices.length; i++) {
    const currentEMA = (prices[i] - ema[i - period]) * multiplier + ema[i - period];
    ema.push(currentEMA);
  }

  // Fill with NaN for initial values
  return [...new Array(period - 1).fill(NaN), ...ema];
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(NaN);
      continue;
    }

    // Calculate gains and losses
    let avgGain = 0;
    let avgLoss = 0;

    // First average
    if (i === period) {
      for (let j = 1; j <= period; j++) {
        const change = prices[j] - prices[j - 1];
        if (change > 0) {
          avgGain += change;
        } else {
          avgLoss += Math.abs(change);
        }
      }
      avgGain /= period;
      avgLoss /= period;
    } else {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  return rsi;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
  const ema12 = calculateEMA(prices, fastPeriod);
  const ema26 = calculateEMA(prices, slowPeriod);

  const macdLine: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(ema12[i]) || isNaN(ema26[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(ema12[i] - ema26[i]);
    }
  }

  // Filter out NaN values for signal line calculation
  const validMacdLine = macdLine.filter((v) => !isNaN(v));
  const signalLine = calculateEMA(validMacdLine, signalPeriod);

  // Calculate histogram
  const histogram: number[] = [];
  const fullSignalLine = [...new Array(macdLine.indexOf(validMacdLine[0])).fill(NaN), ...signalLine];

  for (let i = 0; i < macdLine.length; i++) {
    if (isNaN(macdLine[i]) || isNaN(fullSignalLine[i])) {
      histogram.push(NaN);
    } else {
      histogram.push(macdLine[i] - fullSignalLine[i]);
    }
  }

  return {
    macd: macdLine,
    signal: fullSignalLine,
    histogram,
  };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
  const sma = calculateSMA(prices, period);
  const upperBand: number[] = [];
  const lowerBand: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      upperBand.push(NaN);
      lowerBand.push(NaN);
      continue;
    }

    const slice = prices.slice(i - period + 1, i + 1);
    const mean = sma[i];
    const squaredDiffs = slice.map((price) => Math.pow(price - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const standardDeviation = Math.sqrt(variance);

    upperBand.push(mean + standardDeviation * stdDev);
    lowerBand.push(mean - standardDeviation * stdDev);
  }

  return {
    middle: sma,
    upper: upperBand,
    lower: lowerBand,
  };
}

/**
 * Calculate Stochastic Oscillator
 */
export function calculateStochastic(highs: number[], lows: number[], closes: number[], kPeriod: number = 14, dPeriod: number = 3) {
  const k: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < kPeriod - 1) {
      k.push(NaN);
      continue;
    }

    const highSlice = highs.slice(i - kPeriod + 1, i + 1);
    const lowSlice = lows.slice(i - kPeriod + 1, i + 1);

    const highestHigh = Math.max(...highSlice);
    const lowestLow = Math.min(...lowSlice);

    const rawK = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
    k.push(rawK);
  }

  // Calculate %D (SMA of %K)
  const d = calculateSMA(k.filter((v) => !isNaN(v)), dPeriod);

  const fullD = [...new Array(k.indexOf(k.find((v) => !isNaN(v)) || 0)).fill(NaN), ...d];

  return { k, d: fullD };
}

/**
 * Calculate all technical indicators
 */
export function calculateAllIndicators(candle: StockCandle) {
  const closes = candle.c;

  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);

  const rsi14 = calculateRSI(closes, 14);
  const macd = calculateMACD(closes, 12, 26, 9);
  const bollingerBands = calculateBollingerBands(closes, 20, 2);
  const stochastic = calculateStochastic(candle.h, candle.l, closes, 14, 3);

  return {
    sma: {
      sma20,
      sma50,
      sma200,
    },
    ema: {
      ema12,
      ema26,
    },
    rsi: {
      rsi14,
    },
    macd,
    bollingerBands,
    stochastic,
  };
}

/**
 * Get latest indicator values
 */
export function getLatestIndicators(indicators: ReturnType<typeof calculateAllIndicators>) {
  const lastIndex = indicators.sma.sma20.length - 1;

  return {
    sma20: indicators.sma.sma20[lastIndex],
    sma50: indicators.sma.sma50[lastIndex],
    sma200: indicators.sma.sma200[lastIndex],
    ema12: indicators.ema.ema12[lastIndex],
    ema26: indicators.ema.ema26[lastIndex],
    rsi14: indicators.rsi.rsi14[lastIndex],
    macd: indicators.macd.macd[lastIndex],
    macdSignal: indicators.macd.signal[lastIndex],
    macdHistogram: indicators.macd.histogram[lastIndex],
    bollingerUpper: indicators.bollingerBands.upper[lastIndex],
    bollingerMiddle: indicators.bollingerBands.middle[lastIndex],
    bollingerLower: indicators.bollingerBands.lower[lastIndex],
    stochasticK: indicators.stochastic.k[lastIndex],
    stochasticD: indicators.stochastic.d[lastIndex],
  };
}
