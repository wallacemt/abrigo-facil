import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./auth-cookies";

export { AUTH_COOKIE_NAME } from "./auth-cookies";

export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const getAuthTokenFromCookies = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
};
