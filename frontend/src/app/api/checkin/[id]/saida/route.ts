import { NextResponse } from "next/server";
import { getAuthTokenFromCookies } from "@/lib/auth-cookie";
import { callBackend, handleBffError, toNextResponse } from "@/lib/bff";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  _request: Request,
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
    const response = await callBackend(`/api/checkin/${id}/saida`, {
      method: "PATCH",
      token,
    });
    return toNextResponse(response);
  } catch (error) {
    return handleBffError(error);
  }
}
