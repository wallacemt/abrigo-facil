import { NextResponse } from "next/server";
import { getAuthTokenFromCookies } from "@/lib/auth-cookie";
import { callBackend, handleBffError, toNextResponse } from "@/lib/bff";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const token = await getAuthTokenFromCookies();
    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Não autenticado." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const response = await callBackend(`/api/abrigos/${id}/vagas`, {
      method: "PATCH",
      body,
      token,
    });
    return toNextResponse(response);
  } catch (error) {
    return handleBffError(error);
  }
}
