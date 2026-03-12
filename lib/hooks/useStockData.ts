import { useQuery } from '@/lib/queryClient';

export async function fetchStockData(symbol: string) {
  const response = await fetch(`/api/stock/${symbol}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch stock data: ${response.statusText}`);
  }

  return response.json();
}

export function useStockData(symbol: string) {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => fetchStockData(symbol),
    enabled: !!symbol,
    refetchOnWindowFocus: false,
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
