import { apiClient } from '@/lib/api-client';

export const healthApi = {
  check: () =>
    apiClient.get<{ status: string; service: string; version: string }>('/health').then((r) => r.data),

  readiness: () =>
    apiClient.get<{ ready: boolean; service: string; services: Record<string, string> }>('/ready').then((r) => r.data),
};
