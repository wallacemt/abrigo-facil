import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { callBackend, handleBffError, toNextResponse } from "@/lib/bff";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const backendResponse = await callBackend("/api/auth/login", {
      method: "POST",
      body,
    });

    if (
      backendResponse.status >= 200 &&
      backendResponse.status < 300 &&
      typeof backendResponse.payload === "object" &&
      backendResponse.payload !== null
    ) {
      const payload = backendResponse.payload as {
        data?: { token?: string; usuario?: unknown };
        status?: string;
      };

      const token = payload.data?.token;
      if (token) {
        const cookieStore = await cookies();

        const usuario = payload.data?.usuario as { perfil?: string; nome?: string } | undefined;

        cookieStore.set(AUTH_COOKIE_NAME, token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: AUTH_COOKIE_MAX_AGE,
        });

        if (usuario?.perfil) {
          cookieStore.set("abrigofacil.perfil", usuario.perfil, {
            httpOnly: false,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: AUTH_COOKIE_MAX_AGE,
          });
        }

        if (usuario?.nome) {
          cookieStore.set("abrigofacil.nome", usuario.nome, {
            httpOnly: false,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: AUTH_COOKIE_MAX_AGE,
          });
        }
      }

      return NextResponse.json(
        {
          status: payload.status ?? "success",
          data: {
            usuario: payload.data?.usuario ?? null,
          },
        },
        { status: backendResponse.status },
      );
    }

    return toNextResponse(backendResponse);
  } catch (error) {
    return handleBffError(error);
  }
}
