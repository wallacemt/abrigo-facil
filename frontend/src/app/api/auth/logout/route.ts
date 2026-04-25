import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { AUTH_AVATAR_COOKIE_NAME, AUTH_NAME_COOKIE_NAME, AUTH_PROFILE_COOKIE_NAME } from "@/lib/auth-cookies";

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(AUTH_PROFILE_COOKIE_NAME);
  cookieStore.delete(AUTH_NAME_COOKIE_NAME);
  cookieStore.delete(AUTH_AVATAR_COOKIE_NAME);

  return NextResponse.json({
    status: "success",
    message: "Sessão encerrada com sucesso.",
  });
}
