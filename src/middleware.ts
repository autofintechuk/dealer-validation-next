import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth_session");
  const isAuthPage = request.nextUrl.pathname === "/sign-in";

  if (!authCookie && !isAuthPage) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (authCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
