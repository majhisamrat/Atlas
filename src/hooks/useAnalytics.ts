import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsApi.getDashboard(),
  });
}

export function useQueryAnalytics(params?: { days?: number; kb_id?: string; limit?: number }) {
  return useQuery({
    queryKey: ['analytics-queries', params],
    queryFn: () => analyticsApi.getQueries(params),
  });
}

export function useUsageAnalytics(params?: { days?: number }) {
  return useQuery({
    queryKey: ['analytics-usage', params],
    queryFn: () => analyticsApi.getUsage(params),
  });
}

export function usePerformanceMetrics(params?: { days?: number }) {
  return useQuery({
    queryKey: ['analytics-performance', params],
    queryFn: () => analyticsApi.getPerformance(params),
  });
}

export function useKbDetailed(kbId: string | undefined) {
  return useQuery({
    queryKey: ['kb-detailed', kbId],
    queryFn: () => analyticsApi.getKbDetailed(kbId!),
    enabled: !!kbId,
  });
}
