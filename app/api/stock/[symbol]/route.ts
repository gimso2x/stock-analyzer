import { fetchStockQuote, fetchStockCandles, fetchCompanyInfo } from '@/lib/finnhub';
import { calculateAllIndicators, getLatestIndicators } from '@/lib/indicators';
import type { StockCandle, StockQuote, CompanyInfo } from '@/lib/finnhub';

export interface IndicatorsResponse {
  quote: StockQuote;
  candle: StockCandle;
  indicators: ReturnType<typeof getLatestIndicators>;
  companyInfo: CompanyInfo;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const symbolUpper = symbol.toUpperCase();

    const [quote, candle, companyInfo] = await Promise.all([
      fetchStockQuote(symbolUpper),
      fetchStockCandles(symbolUpper, 'D'),
      fetchCompanyInfo(symbolUpper),
    ]);

    const allIndicators = calculateAllIndicators(candle);
    const latestIndicators = getLatestIndicators(allIndicators);

    return Response.json({
      quote,
      candle,
      indicators: latestIndicators,
      companyInfo,
    } satisfies IndicatorsResponse);
  } catch (error) {
    console.error('Error fetching stock data:', error);

    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
