import type { NextResponse } from "next/server";
import { callBackend, handleBffError, toNextResponse } from "@/lib/bff";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const response = await callBackend("/api/auth/register", {
      method: "POST",
      body,
    });
    return toNextResponse(response);
  } catch (error) {
    return handleBffError(error);
  }
}
