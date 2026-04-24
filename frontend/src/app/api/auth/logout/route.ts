import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete("abrigofacil.perfil");
  cookieStore.delete("abrigofacil.nome");

  return NextResponse.json({
    status: "success",
    message: "Sessão encerrada com sucesso.",
  });
}
