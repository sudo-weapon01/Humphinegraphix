import { NextResponse } from "next/server";
import { isSameOrigin, jsonError, readJson } from "@/lib/api";
import { getSessionSecret, getStaffCredentials } from "@/lib/auth-config";
import {
  SESSION_COOKIE,
  createSessionToken,
  safeStringEqual,
  sessionCookieOptions,
} from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Cross-origin requests are not allowed.", 403);
  }

  const credentials = getStaffCredentials();
  if (!credentials) {
    return jsonError(
      "Staff sign-in is not configured on this deployment. Set ADMIN_USERNAME and ADMIN_PASSWORD.",
      503,
    );
  }

  const body = await readJson(request);
  const input = (body ?? {}) as { username?: unknown; password?: unknown };
  const username = typeof input.username === "string" ? input.username.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!username || !password) {
    return jsonError("Enter your username and password.", 400, {
      username: username ? "" : "Enter your username.",
      password: password ? "" : "Enter your password.",
    });
  }

  const [userMatches, passwordMatches] = await Promise.all([
    safeStringEqual(username.toLowerCase(), credentials.username.toLowerCase()),
    safeStringEqual(password, credentials.password),
  ]);

  if (!userMatches || !passwordMatches) {
    // Same message either way so the form cannot be used to discover usernames.
    return jsonError("Those details don't match a studio account.", 401);
  }

  const token = await createSessionToken(credentials.username, getSessionSecret());
  const response = NextResponse.json({ ok: true, user: credentials.username });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
