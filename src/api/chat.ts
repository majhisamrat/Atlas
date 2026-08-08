import { apiClient } from '@/lib/api-client';
import type { ChatRequest, ChatResponse } from '@/types/chat';

export const chatApi = {
  send: (data: ChatRequest) =>
    apiClient.post<ChatResponse>('/chat', data).then((r) => r.data),
};
