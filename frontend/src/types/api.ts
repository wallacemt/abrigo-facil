export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  authenticate?: boolean;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
  cache?: 'no-cache' | 'default' | 'force-cache';
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
  onProgress?: (progress: number) => void;
}

export interface FetchResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}
