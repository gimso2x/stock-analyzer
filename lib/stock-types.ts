const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000';

export interface StockCandle {
  t: number[];
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
}

export interface StockQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface CompanyInfo {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

export interface FinancialMetrics {
  forwardPE: number | null;
  trailingPE: number | null;
  priceToBook: number | null;
  revenueGrowth: number | null;
  profitMargins: number | null;
  debtToEquity: number | null;
  returnOnEquity: number | null;
  operatingMargins: number | null;
}

export interface StockAnalysisData {
  targetMeanPrice: number | null;
  targetHighPrice: number | null;
  targetLowPrice: number | null;
  numberOfAnalystOpinions: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyTwoWeekHigh: number | null;
  currentPrice: number;
  financialMetrics: FinancialMetrics;
}

export interface StockData {
  quote: StockQuote;
  candle: StockCandle;
  company_info: CompanyInfo;
  analysis?: StockAnalysisData;
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const url = `${FLASK_API_URL}/api/stock/${symbol}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch stock quote: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.quote;
}

export async function fetchStockCandles(
  symbol: string
): Promise<StockCandle> {
  const url = `${FLASK_API_URL}/api/stock/${symbol}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch stock candles: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.candle;
}

export async function fetchCompanyInfo(symbol: string): Promise<CompanyInfo> {
  const url = `${FLASK_API_URL}/api/stock/${symbol}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch company info: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.company_info;
}

export async function validateApiKey(): Promise<boolean> {
  try {
    const response = await fetch(`${FLASK_API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
