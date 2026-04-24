import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/server-config";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface BackendRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  searchParams?: URLSearchParams;
}

interface BackendResponseData {
  status: number;
  payload: unknown;
}

const isJsonContentType = (contentType: string | null): boolean => {
  return contentType?.includes("application/json") ?? false;
};

const appendSearchParams = (url: URL, searchParams?: URLSearchParams): void => {
  if (!searchParams) {
    return;
  }

  for (const [key, value] of searchParams.entries()) {
    url.searchParams.append(key, value);
  }
};

export const callBackend = async (
  path: string,
  options: BackendRequestOptions = {},
): Promise<BackendResponseData> => {
  const baseUrl = getApiBaseUrl();
  const backendUrl = new URL(path, `${baseUrl}/`);
  appendSearchParams(backendUrl, options.searchParams);

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(backendUrl, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type");
  const payload = isJsonContentType(contentType)
    ? await response.json()
    : await response.text();

  return {
    status: response.status,
    payload,
  };
};

export const toNextResponse = (data: BackendResponseData): NextResponse => {
  if (typeof data.payload === "object" && data.payload !== null) {
    return NextResponse.json(data.payload, { status: data.status });
  }

  return new NextResponse(String(data.payload), {
    status: data.status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

export const handleBffError = (error: unknown): NextResponse => {
  const message =
    error instanceof Error ? error.message : "BFF request failed.";

  return NextResponse.json(
    {
      status: "error",
      message,
    },
    { status: 502 },
  );
};
