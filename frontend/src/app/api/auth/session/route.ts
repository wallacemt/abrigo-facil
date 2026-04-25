import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { AUTH_AVATAR_COOKIE_NAME, AUTH_NAME_COOKIE_NAME, AUTH_PROFILE_COOKIE_NAME } from "@/lib/auth-cookies";

export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
  const nome = cookieStore.get(AUTH_NAME_COOKIE_NAME)?.value ?? null;
  const perfil = cookieStore.get(AUTH_PROFILE_COOKIE_NAME)?.value ?? null;
  const avatarUrl = cookieStore.get(AUTH_AVATAR_COOKIE_NAME)?.value ?? null;

  return NextResponse.json({
    status: "success",
    data: {
      isAuthenticated: Boolean(token),
      usuario: token
        ? {
            nome,
            perfil,
            avatarUrl,
          }
        : null,
    },
  });
}
