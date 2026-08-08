import { useMutation } from '@tanstack/react-query';
import { chatApi } from '@/api/chat';
import type { ChatRequest } from '@/types/chat';

export function useChat() {
  return useMutation({
    mutationFn: (data: ChatRequest) => chatApi.send(data),
  });
}
