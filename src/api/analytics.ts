import { apiClient } from '@/lib/api-client';
import type {
  DashboardSummary,
  QueryAnalyticsResponse,
  UsageAnalyticsResponse,
  PerformanceMetricsResponse,
  KbDetailedResponse,
} from '@/types/analytics';

export const analyticsApi = {
  getDashboard: () =>
    apiClient.get<DashboardSummary>('/analytics/dashboard').then((r) => r.data),

  getQueries: (params?: { days?: number; kb_id?: string; limit?: number }) =>
    apiClient.get<QueryAnalyticsResponse>('/analytics/queries', { params }).then((r) => r.data),

  getUsage: (params?: { days?: number }) =>
    apiClient.get<UsageAnalyticsResponse>('/analytics/usage', { params }).then((r) => r.data),

  getPerformance: (params?: { days?: number }) =>
    apiClient.get<PerformanceMetricsResponse>('/analytics/performance', { params }).then((r) => r.data),

  getKbDetailed: (kbId: string) =>
    apiClient.get<KbDetailedResponse>(`/analytics/knowledge-bases/${kbId}/detailed`).then((r) => r.data),
};
