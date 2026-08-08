export interface KnowledgeBase {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  status: string;
  query_count: number;
  last_queried_at: string | null;
  created_at: string;
  updated_at: string;
  statistics?: KnowledgeBaseStats;
}

export interface KnowledgeBaseStats {
  total_uploads: number;
  total_pages: number;
  total_chunks: number;
  total_vectors: number;
  query_count: number;
}

export interface CreateKnowledgeBaseRequest {
  name: string;
  display_name: string;
  description?: string;
}

export interface UploadRecord {
  id: string;
  original_filename: string;
  display_name: string | null;
  file_type: string;
  file_size_bytes: number;
  page_count: number;
  chunk_count: number;
  total_vectors: number;
  embedding_model: string;
  processing_status: string;
  processing_duration_ms: number;
  error_message: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface UploadHistoryResponse {
  kb_id: string;
  uploads: UploadRecord[];
  total: number;
}

export interface KbStatisticsResponse {
  kb_id: string;
  kb_name: string;
  total_uploads: number;
  total_pages: number;
  total_chunks: number;
  total_vectors: number;
  query_count: number;
  last_queried_at: string | null;
}

export interface UploadResponse {
  success: boolean;
  upload_id: string;
  kb_id: string;
  filename: string;
  status: string;
  background_processing: boolean;
  job_id?: string;
  pages?: number;
  chunks?: number;
  vectors?: number;
}

export interface ReindexResponse {
  success: boolean;
  kb_id: string;
  kb_name?: string;
  uploads_count?: number;
  job_id?: string | null;
  status?: string;
  message: string;
}
