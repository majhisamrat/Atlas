import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeApi } from '@/api/knowledge';
import type { CreateKnowledgeBaseRequest } from '@/types/knowledge';
import { toast } from 'sonner';

export function useKnowledgeBases(params?: { skip?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['knowledge-bases', params],
    queryFn: () => knowledgeApi.list(params),
  });
}

export function useKnowledgeBase(id: string | undefined) {
  return useQuery({
    queryKey: ['knowledge-base', id],
    queryFn: () => knowledgeApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateKnowledgeBase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKnowledgeBaseRequest) => knowledgeApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge-bases'] });
      toast.success('Knowledge base created');
    },
  });
}

export function useDeleteKnowledgeBase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => knowledgeApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge-bases'] });
      toast.success('Knowledge base deleted');
    },
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      kbId,
      file,
      displayName,
      tags,
    }: {
      kbId: string;
      file: File;
      displayName?: string;
      tags?: string;
    }) => knowledgeApi.upload(kbId, file, displayName, tags),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['knowledge-base', variables.kbId] });
      qc.invalidateQueries({ queryKey: ['upload-history', variables.kbId] });
      toast.success('Document uploaded');
    },
  });
}

export function useUploadHistory(kbId: string | undefined, params?: { skip?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['upload-history', kbId, params],
    queryFn: () => knowledgeApi.getHistory(kbId!, params),
    enabled: !!kbId,
  });
}

export function useKbStatistics(kbId: string | undefined) {
  return useQuery({
    queryKey: ['kb-statistics', kbId],
    queryFn: () => knowledgeApi.getStatistics(kbId!),
    enabled: !!kbId,
  });
}

export function useReindexKb() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (kbId: string) => knowledgeApi.reindex(kbId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge-bases'] });
      toast.success('Reindexing queued');
    },
  });
}
