import { apiClient } from '@/lib/api-client';
import type {
  KnowledgeBase,
  CreateKnowledgeBaseRequest,
  UploadHistoryResponse,
  KbStatisticsResponse,
  UploadResponse,
  ReindexResponse,
} from '@/types/knowledge';

export const knowledgeApi = {
  list: (params?: { skip?: number; limit?: number; status?: string }) =>
    apiClient.get<KnowledgeBase[]>('/knowledge', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<KnowledgeBase>(`/knowledge/${id}`).then((r) => r.data),

  create: (data: CreateKnowledgeBaseRequest) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('display_name', data.display_name);
    if (data.description) formData.append('description', data.description);
    return apiClient.post<KnowledgeBase>('/knowledge', formData).then((r) => r.data);
  },

  delete: (id: string) =>
    apiClient.delete<{ success: boolean; deleted_kb_id: string; message: string }>(
      `/knowledge/${id}`,
    ).then((r) => r.data),

  upload: (kbId: string, file: File, displayName?: string, tags?: string, backgroundProcessing = true) => {
    const formData = new FormData();
    formData.append('file', file);
    if (displayName) formData.append('display_name', displayName);
    if (tags) formData.append('tags', tags);
    formData.append('background_processing', String(backgroundProcessing));
    return apiClient
      .post<UploadResponse>(`/knowledge/${kbId}/upload`, formData)
      .then((r) => r.data);
  },

  getHistory: (kbId: string, params?: { skip?: number; limit?: number; status?: string }) =>
    apiClient.get<UploadHistoryResponse>(`/knowledge/${kbId}/history`, { params }).then((r) => r.data),

  getStatistics: (kbId: string) =>
    apiClient.get<KbStatisticsResponse>(`/knowledge/${kbId}/statistics`).then((r) => r.data),

  reindex: (kbId: string) =>
    apiClient.post<ReindexResponse>(`/knowledge/${kbId}/reindex`).then((r) => r.data),

  deleteUpload: (kbId: string, uploadId: string) =>
    apiClient.delete<{ success: boolean; deleted_upload_id: string; message: string }>(
      `/knowledge/${kbId}/upload/${uploadId}`,
    ).then((r) => r.data),
};
