import { NextResponse } from "next/server";
import { getAuthTokenFromCookies } from "@/lib/auth-cookie";
import { callBackend, handleBffError, toNextResponse } from "@/lib/bff";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const requestUrl = new URL(request.url);
    const response = await callBackend("/api/abrigos", {
      searchParams: requestUrl.searchParams,
    });
    return toNextResponse(response);
  } catch (error) {
    return handleBffError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const token = await getAuthTokenFromCookies();
    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Não autenticado." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const response = await callBackend("/api/abrigos", {
      method: "POST",
      body,
      token,
    });
    return toNextResponse(response);
  } catch (error) {
    return handleBffError(error);
  }
}
