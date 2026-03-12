import { useQuery } from '@/lib/queryClient';

export async function fetchAIReport(symbol: string) {
  const response = await fetch(`/api/ai-report/${symbol}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch AI report: ${response.statusText}`);
  }

  return response.json();
}

export function useAIReport(symbol: string) {
  return useQuery({
    queryKey: ['ai-report', symbol],
    queryFn: () => fetchAIReport(symbol),
    enabled: !!symbol,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
