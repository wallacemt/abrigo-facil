import type { FetchOptions, FetchResponse } from "@/types/api";

export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = "FetchError";
  }
}

const DEFAULT_OPTIONS: Partial<FetchOptions> = {
  method: "GET",
  timeout: 15000,
  cache: "no-cache",
  responseType: "json",
};

const safeParseResponse = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return await response.text();
  }
};

const parseResponse = async <T>(
  response: Response,
  responseType?: FetchOptions["responseType"],
): Promise<T> => {
  switch (responseType) {
    case "text":
      return (await response.text()) as T;
    case "blob":
      return (await response.blob()) as T;
    case "arrayBuffer":
      return (await response.arrayBuffer()) as T;
    default:
      return (await response.json()) as T;
  }
};

export const fetchRequest = async <T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<FetchResponse<T>> => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(endpoint, {
      method: config.method,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      cache: config.cache as RequestCache,
      signal: controller.signal,
      body: config.body !== undefined ? JSON.stringify(config.body) : undefined,
    });

    if (!response.ok) {
      const errorData = await safeParseResponse(response);
      throw new FetchError(
        `Erro na requisição: ${response.statusText}`,
        response.status,
        errorData,
      );
    }

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

    throw new FetchError(
      error instanceof Error
        ? error.message
        : "Erro desconhecido na requisição.",
    );
  } finally {
    clearTimeout(timeoutId);
  }
};
