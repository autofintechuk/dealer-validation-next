import { cookies } from "next/headers";
import { env } from "@/env";

const SESSION_COOKIE = "auth_session";

export async function validatePassword(password: string) {
  const validPasswords = env.AUTH_PASSWORD.split(",").map((p) => p.trim());
  return validPasswords.includes(password);
}

export async function setAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.has(SESSION_COOKIE);
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
