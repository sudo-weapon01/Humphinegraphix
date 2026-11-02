import { NextResponse, type NextRequest } from "next/server";
import { getSessionSecret } from "./lib/auth-config";
import { SESSION_COOKIE, verifySessionToken } from "./lib/session";

/**
 * Gate for the admin area.
 *
 * - /admin/**            → redirect to /admin/login when there is no valid session
 * - /api/admin/**        → 401 JSON when there is no valid session
 * - /admin/login         → redirect to /admin when already signed in
 *
 * Admin route handlers and server components verify the session again, so this
 * is defence in depth rather than the only check.
 */
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token, getSessionSecret()) : null;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  if (isLoginPage) {
    if (!session) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isLoginApi) return NextResponse.next();

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, message: "Sign in as studio staff to continue." },
        { status: 401 },
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    const next = `${pathname}${search}`;
    url.search = next === "/admin" ? "" : `?next=${encodeURIComponent(next)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
