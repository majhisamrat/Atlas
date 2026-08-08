export interface DashboardSummary {
  organization_id: string;
  timestamp: string;
  summary: {
    total_knowledge_bases: number;
    total_uploads: number;
    total_pages: number;
    total_chunks: number;
    total_vectors: number;
    total_queries: number;
  };
  knowledge_bases: KbDashboardInfo[];
}

export interface KbDashboardInfo {
  id: string;
  name: string;
  display_name: string;
  status: string;
  created_at: string;
  last_queried_at: string | null;
  statistics: {
    total_uploads: number;
    total_pages: number;
    total_chunks: number;
    total_vectors: number;
    query_count: number;
  };
  latest_uploads: {
    id: string;
    filename: string;
    display_name: string;
    upload_date: string;
    pages: number;
    chunks: number;
    vectors: number;
    status: string;
  }[];
}

export interface QueryAnalyticsResponse {
  organization_id: string;
  period_days: number;
  timestamp: string;
  summary: {
    total_queries: number;
    avg_latency_ms: number;
    avg_retrieved_chunks: number;
    total_retrieved_chunks: number;
  };
  by_knowledge_base: Record<string, {
    query_count: number;
    avg_latency_ms: number;
    avg_retrieved: number;
  }>;
  recent_queries: {
    id: string;
    query: string;
    knowledge_base_id: string | null;
    retrieved_count: number;
    latency_ms: number;
    used_uploads: string[];
    created_at: string;
  }[];
}

export interface UsageAnalyticsResponse {
  organization_id: string;
  period_days: number;
  timestamp: string;
  summary: {
    total_queries: number;
    total_chat_messages: number;
    total_uploads: number;
    total_pages_indexed: number;
    total_vectors: number;
    avg_upload_processing_time_ms: number;
    queries_per_day: number;
    messages_per_day: number;
  };
  daily_breakdown: {
    date: string;
    query_count: number;
    retrieved_chunks: number;
    avg_latency_ms: number;
  }[];
}

export interface PerformanceMetricsResponse {
  organization_id: string;
  period_days: number;
  timestamp: string;
  query_metrics: {
    total_queries: number;
    avg_latency_ms: number;
    p50_latency_ms: number;
    p95_latency_ms: number;
    p99_latency_ms: number;
    avg_retrieved_chunks: number;
  };
  upload_metrics: {
    total_uploads: number;
    avg_processing_time_ms: number;
    p50_processing_time_ms: number;
    p95_processing_time_ms: number;
    failed_uploads: number;
  };
}

export interface KbDetailedResponse {
  kb_id: string;
  kb_name: string;
  kb_display_name: string;
  created_at: string;
  last_queried_at: string | null;
  status: string;
  statistics: {
    total_uploads: number;
    completed_uploads: number;
    failed_uploads: number;
    total_pages: number;
    total_chunks: number;
    total_vectors: number;
    total_queries: number;
    avg_upload_time_ms: number;
    avg_query_latency_ms: number;
  };
  uploads: {
    id: string;
    filename: string;
    display_name: string;
    file_type: string;
    file_size_bytes: number;
    pages: number;
    chunks: number;
    vectors: number;
    embedding_model: string;
    status: string;
    processing_time_ms: number;
    error: string | null;
    created_at: string;
    tags: string[] | null;
  }[];
  recent_queries: {
    query: string;
    retrieved_count: number;
    latency_ms: number;
    created_at: string;
  }[];
}
