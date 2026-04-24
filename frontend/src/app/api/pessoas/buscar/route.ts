import type { NextResponse } from "next/server";
import { callBackend, handleBffError, toNextResponse } from "@/lib/bff";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const requestUrl = new URL(request.url);
    const response = await callBackend("/api/pessoas/buscar", {
      searchParams: requestUrl.searchParams,
    });
    return toNextResponse(response);
  } catch (error) {
    return handleBffError(error);
  }
}
