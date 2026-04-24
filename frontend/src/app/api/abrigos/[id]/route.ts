import type { NextResponse } from "next/server";
import { callBackend, handleBffError, toNextResponse } from "@/lib/bff";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const response = await callBackend(`/api/abrigos/${id}`);
    return toNextResponse(response);
  } catch (error) {
    return handleBffError(error);
  }
}
