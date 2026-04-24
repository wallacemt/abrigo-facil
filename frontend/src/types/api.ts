export interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  cache?: "no-cache" | "default" | "force-cache";
  responseType?: "json" | "text" | "blob" | "arrayBuffer";
}

export interface FetchResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

export interface ApiEnvelope<T> {
  status: "success" | "error";
  message?: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface Abrigo {
  id: string;
  nome: string;
  codigo_checkin: string;
  endereco: string;
  latitude: number;
  longitude: number;
  capacidade_total: number;
  vagas_disponiveis: number;
  ativo: boolean;
  distancia_km?: number;
}

export interface PessoaSearchResult {
  id: string;
  nome: string;
  status: "desaparecida" | "em_abrigo" | "encontrada";
  abrigo_atual?: {
    id: string;
    nome: string;
    endereco: string;
  };
}

export interface AuthUser {
  id: string;
  nome: string;
  perfil: "voluntario" | "coordenador";
}
