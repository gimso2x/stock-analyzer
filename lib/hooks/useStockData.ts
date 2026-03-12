import { useQuery } from '@/lib/queryClient';
import { keepPreviousData } from '@tanstack/react-query';

export async function fetchStockData(symbol: string, period: string = '3mo') {
  const response = await fetch(`/api/stock/${symbol}?period=${period}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch stock data: ${response.statusText}`);
  }

  return response.json();
}

export function useStockData(symbol: string, period: string = '3mo') {
  return useQuery({
    queryKey: ['stock', symbol, period],
    queryFn: () => fetchStockData(symbol, period),
    enabled: !!symbol,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useStockQuote(symbol: string) {
  return useStockData(symbol);
}

export function useStockCandles(symbol: string) {
  return useStockData(symbol);
}

export function useCompanyInfo(symbol: string) {
  return useStockData(symbol);
}
