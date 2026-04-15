import { FetchOptions, FetchResponse } from "@/types/api";
import Cookies from "js-cookie";
export const baseUrl = process.env.BACKEND_URL || "http://localhost:8080";
export const jwtToken = (): string => {
  if (Cookies.get("vinmatrix.jwt_token")) {
    return Cookies.get("vinmatrix.jwt_token") || "";
  }

  return "";
};

export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown,
    public error?: string,
  ) {
    super(message);
    this.name = "FetchError";
  }
}

const DEFAULT_OPTIONS: Partial<FetchOptions> = {
  method: "GET",
  authenticate: true,
  timeout: 30000,
  retry: 3,
  retryDelay: 1000,
  cache: "default",
  responseType: "json",
};

export const fetchRequest = async <T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<FetchResponse<T>> => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Validação de token
  let token: string | null = null;
  
  if (config.authenticate) {
    token = jwtToken(); // Função que busca o token user
    if (!token) {
      throw new FetchError("Token de autenticação não encontrado", 401);
    }
  }

  // Construir headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...config.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Função auxiliar para fazer a requisição com retry
  const makeRequest = async (attempt = 1): Promise<Response> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const requestConfig: RequestInit = {
        method: config.method,
        headers,
        cache: config.cache as RequestCache,
        signal: controller.signal,
      };

      if (config.body) {
        requestConfig.body = JSON.stringify(config.body);
      }

      const response = await fetch(`${baseUrl}${endpoint}`, requestConfig);

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (attempt < config.retry! && isRetryableError(error)) {
        await delay(config.retryDelay! * attempt); // Backoff exponencial
        return makeRequest(attempt + 1);
      }
      throw error;
    }
  };

  try {
    const response = await makeRequest();

    // Tratamento de erros HTTP
    if (!response.ok) {
      const errorData = await safeParseResponse(response);
      throw new FetchError(`Erro na requisição: ${response.statusText}`, response.status, errorData);
    }

    // Parsear resposta conforme tipo
    const data = await parseResponse<T>(response, config.responseType);

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }
    throw new FetchError(error instanceof Error ? error.message : "Erro desconhecido na requisição", undefined, error);
  }
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.name === "AbortError" || error.message.includes("Failed to fetch") || error.message.includes("Network")
    );
  }
  return false;
};

const safeParseResponse = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return await response.text();
  }
};

const parseResponse = async <T>(response: Response, responseType?: string): Promise<T> => {
  switch (responseType) {
    case "text":
      return (await response.text()) as T;
    case "blob":
      return (await response.blob()) as T;
    case "arrayBuffer":
      return (await response.arrayBuffer()) as T;
    case "json":
    default:
      return (await response.json()) as T;
  }
};
