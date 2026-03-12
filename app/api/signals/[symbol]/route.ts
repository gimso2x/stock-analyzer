import { fetchStockCandles, fetchStockQuote } from '@/lib/finnhub';
import { calculateAllIndicators, getLatestIndicators } from '@/lib/indicators';

export interface TechnicalSignals {
  symbol: string;
  signals: {
    trend: 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL';
    rsi: 'OVERBOUGHT' | 'NEUTRAL' | 'OVERSOLD';
    macd: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    bollinger: 'ABOVE_UPPER' | 'WITHIN_BANDS' | 'BELOW_LOWER';
    stochastic: 'OVERBOUGHT' | 'NEUTRAL' | 'OVERSOLD';
  };
  recommendations: {
    action: 'BUY' | 'SELL' | 'HOLD';
    price?: number;
    target?: number;
    stopLoss?: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    timeframe: string;
    riskReward?: number;
  };
  levels: {
    support: number[];
    resistance: number[];
    entry?: number;
  };
  timestamp: string;
}

async function calculateRecommendations(
  symbol: string,
  indicators: ReturnType<typeof getLatestIndicators>,
  currentPrice: number,
  recentPrices: number[]
): Promise<{ action: 'BUY' | 'SELL' | 'HOLD'; price?: number; target?: number; stopLoss?: number; confidence: 'HIGH' | 'MEDIUM' | 'LOW'; timeframe: string; riskReward?: number }> {
  const signals: { type: string; score: number; reason: string }[] = [];

  // RSI Analysis
  if (indicators.rsi14 && !isNaN(indicators.rsi14)) {
    if (indicators.rsi14 < 30) {
      signals.push({ type: 'RSI', score: 2, reason: 'RSI is oversold, potential reversal' });
    } else if (indicators.rsi14 > 70) {
      signals.push({ type: 'RSI', score: -2, reason: 'RSI is overbought, potential decline' });
    } else if (indicators.rsi14 < 40) {
      signals.push({ type: 'RSI', score: 1, reason: 'RSI is approaching oversold territory' });
    } else if (indicators.rsi14 > 60) {
      signals.push({ type: 'RSI', score: -1, reason: 'RSI is approaching overbought territory' });
    }
  }

  // MACD Analysis
  const macd = indicators.macd;
  const macdSignal = indicators.macdSignal;
  if (macd && macdSignal && !isNaN(macd) && !isNaN(macdSignal)) {
    if (macd > macdSignal && macd > 0) {
      signals.push({ type: 'MACD', score: 2, reason: 'MACD is bullish - positive and above signal line' });
    } else if (macd < macdSignal && macd < 0) {
      signals.push({ type: 'MACD', score: -2, reason: 'MACD is bearish - negative and below signal line' });
    } else if (macd > macdSignal) {
      signals.push({ type: 'MACD', score: 1, reason: 'MACD is crossing above signal line' });
    } else if (macd < macdSignal) {
      signals.push({ type: 'MACD', score: -1, reason: 'MACD is crossing below signal line' });
    }
  }

  // Moving Averages Analysis
  const sma20 = indicators.sma20;
  const sma50 = indicators.sma50;
  const sma200 = indicators.sma200;

  if (sma20 && sma50 && !isNaN(sma20) && !isNaN(sma50)) {
    if (currentPrice > sma20 && sma20 > sma50) {
      signals.push({ type: 'MA', score: 2, reason: 'Price above 20-day SMA which is above 50-day SMA - bullish' });
    } else if (currentPrice < sma20 && sma20 < sma50) {
      signals.push({ type: 'MA', score: -2, reason: 'Price below 20-day SMA which is below 50-day SMA - bearish' });
    } else if (currentPrice > sma20) {
      signals.push({ type: 'MA', score: 1, reason: 'Price above 20-day SMA - short-term bullish' });
    } else if (currentPrice < sma20) {
      signals.push({ type: 'MA', score: -1, reason: 'Price below 20-day SMA - short-term bearish' });
    }
  }

  if (sma200 && !isNaN(sma200)) {
    if (currentPrice > sma200) {
      signals.push({ type: 'MA_LONG', score: 1, reason: 'Price above 200-day SMA - long-term bullish' });
    } else {
      signals.push({ type: 'MA_LONG', score: -1, reason: 'Price below 200-day SMA - long-term bearish' });
    }
  }

  // Bollinger Bands Analysis
  const bollingerLower = indicators.bollingerLower;
  const bollingerUpper = indicators.bollingerUpper;

  if (bollingerLower && bollingerUpper && !isNaN(bollingerLower) && !isNaN(bollingerUpper)) {
    if (currentPrice < bollingerLower) {
      signals.push({ type: 'BOLLINGER', score: 2, reason: 'Price touched lower Bollinger Band - oversold' });
    } else if (currentPrice > bollingerUpper) {
      signals.push({ type: 'BOLLINGER', score: -2, reason: 'Price touched upper Bollinger Band - overbought' });
    } else if (currentPrice < bollingerLower + (bollingerUpper - bollingerLower) * 0.2) {
      signals.push({ type: 'BOLLINGER', score: 1, reason: 'Price near lower Bollinger Band - potential support' });
    } else if (currentPrice > bollingerUpper - (bollingerUpper - bollingerLower) * 0.2) {
      signals.push({ type: 'BOLLINGER', score: -1, reason: 'Price near upper Bollinger Band - potential resistance' });
    }
  }

  // Calculate total score
  const totalScore = signals.reduce((sum, signal) => sum + signal.score, 0);
  const confidenceLevel = signals.length >= 3 ? 'HIGH' : signals.length >= 2 ? 'MEDIUM' : 'LOW';

  // Determine action based on score
  let action: 'BUY' | 'SELL' | 'HOLD';
  let target: number | undefined;
  let stopLoss: number | undefined;
  let riskReward: number | undefined;

  const avgTrueRange = recentPrices.length > 1 ? Math.abs(recentPrices[recentPrices.length - 1] - recentPrices[recentPrices.length - 2]) : currentPrice * 0.02;

  if (totalScore >= 3) {
    action = 'BUY';
    target = currentPrice * 1.05;
    stopLoss = currentPrice - avgTrueRange * 2;
    riskReward = (target - currentPrice) / (currentPrice - stopLoss);
  } else if (totalScore <= -3) {
    action = 'SELL';
    target = currentPrice * 0.95;
    stopLoss = currentPrice + avgTrueRange * 2;
  } else {
    action = 'HOLD';
  }

  return {
    action,
    price: currentPrice,
    target,
    stopLoss,
    confidence: confidenceLevel as 'HIGH' | 'MEDIUM' | 'LOW',
    timeframe: 'short-term (1-5 days)',
    riskReward,
  };
}

async function calculateSupportResistance(prices: number[], lookback: number = 20) {
  const recentPrices = prices.slice(-lookback);
  const supports: number[] = [];
  const resistances: number[] = [];

  for (let i = 2; i < recentPrices.length - 2; i++) {
    const low = recentPrices[i - 1];
    const currentLow = recentPrices[i];
    const nextLow = recentPrices[i + 1];

    const high = recentPrices[i - 1];
    const currentHigh = recentPrices[i];
    const nextHigh = recentPrices[i + 1];

    if (currentLow < low && currentLow < nextLow) {
      supports.push(currentLow);
    }

    if (currentHigh > high && currentHigh > nextHigh) {
      resistances.push(currentHigh);
    }
  }

  return {
    support: [...new Set(supports)].sort((a, b) => a - b).slice(0, 3),
    resistance: [...new Set(resistances)].sort((a, b) => b - a).slice(0, 3),
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const symbolUpper = symbol.toUpperCase();

    const [quote, candle] = await Promise.all([
      fetchStockQuote(symbolUpper),
      fetchStockCandles(symbolUpper, 'D'),
    ]);

    const allIndicators = calculateAllIndicators(candle);
    const latestIndicators = getLatestIndicators(allIndicators);

    const recommendations = await calculateRecommendations(symbol, latestIndicators, quote.c, candle.c);

    const levels = await calculateSupportResistance(candle.c);

    const rsiValue = latestIndicators.rsi14;
    const rsiStatus = rsiValue && !isNaN(rsiValue)
      ? (rsiValue > 70 ? 'OVERBOUGHT' : rsiValue < 30 ? 'OVERSOLD' : 'NEUTRAL')
      : 'NEUTRAL';

    const macdStatus = latestIndicators.macd && latestIndicators.macdSignal
      ? (latestIndicators.macd > latestIndicators.macdSignal ? 'BULLISH' : 'BEARISH')
      : 'NEUTRAL';

    const bollingerStatus = latestIndicators.bollingerUpper && latestIndicators.bollingerLower
      ? (quote.c > latestIndicators.bollingerUpper ? 'ABOVE_UPPER' : quote.c < latestIndicators.bollingerLower ? 'BELOW_LOWER' : 'WITHIN_BANDS')
      : 'WITHIN_BANDS';

    const stochasticK = latestIndicators.stochasticK;
    const stochasticStatus = stochasticK && !isNaN(stochasticK)
      ? (stochasticK > 80 ? 'OVERBOUGHT' : stochasticK < 20 ? 'OVERSOLD' : 'NEUTRAL')
      : 'NEUTRAL';

    const trendScore = [
      latestIndicators.sma20 && quote.c > latestIndicators.sma20 ? 1 : -1,
      latestIndicators.sma50 && quote.c > latestIndicators.sma50 ? 1 : -1,
      latestIndicators.sma200 && quote.c > latestIndicators.sma200 ? 1 : -1,
    ].reduce((a, b) => a + b, 0);

    const trendStatus = trendScore >= 2 ? 'STRONG BUY' : trendScore >= 1 ? 'BUY' : trendScore <= -2 ? 'STRONG SELL' : trendScore <= -1 ? 'SELL' : 'HOLD';

    return Response.json({
      symbol: symbolUpper,
      signals: {
        trend: trendStatus as 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL',
        rsi: rsiStatus,
        macd: macdStatus,
        bollinger: bollingerStatus,
        stochastic: stochasticStatus,
      },
      recommendations,
      levels: {
        ...levels,
        entry: quote.c,
      },
      timestamp: new Date().toISOString(),
    } satisfies TechnicalSignals);
  } catch (error) {
    console.error('Error calculating signals:', error);

    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate signals' },
      { status: 500 }
    );
  }
}
