export interface ChatSource {
  citation_key: string;
  document_id: string;
  upload_id?: string;
  document_name?: string;
  upload_date?: string;
  title: string;
  page_number: number;
  text_snippet: string;
  relevance_score: number;
}

export interface ChatMetadata {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  context_documents: number;
  kb_filtered: boolean;
  used_uploads: string[];
}

export interface ChatRequest {
  query: string;
  session_id?: string;
  knowledge_base_id?: string;
  top_k?: number;
}

export interface ChatResponse {
  answer: string;
  session_id: string | null;
  knowledge_base_id: string | null;
  sources: ChatSource[];
  metadata: ChatMetadata;
  rate_limit_info?: {
    is_allowed: boolean;
    message_count: number;
    max_messages: number;
    reset_time: string;
  };
}

export interface ChatMessageDisplay {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  metadata?: ChatMetadata;
  timestamp: Date;
}
