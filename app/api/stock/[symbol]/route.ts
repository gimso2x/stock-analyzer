import { calculateAllIndicators, getLatestIndicators } from '@/lib/indicators';
import type { StockCandle, StockQuote, CompanyInfo } from '@/lib/stock-types';

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

    // Fetch everything from Flask backend in one go
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '3mo';
    const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000';
    const response = await fetch(`${FLASK_API_URL}/api/stock/${symbolUpper}?period=${period}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from backend: ${response.statusText}`);
    }

    const data = await response.json();
    const { quote, candle, company_info: companyInfo, analysis } = data;

    const allIndicators = calculateAllIndicators(candle);
    const latestIndicators = getLatestIndicators(allIndicators);

    return Response.json({
      quote,
      candle,
      indicators: latestIndicators,
      companyInfo,
      analysis,
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);

    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
