import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSessionSecret, getStaffCredentials } from "@/lib/auth-config";
import {
  SESSION_COOKIE,
  createSessionToken,
  safeStringEqual,
  verifySessionToken,
} from "@/lib/session";
import { middleware } from "@/middleware";

const secret = () => getSessionSecret();

async function requestFor(path: string, token?: string) {
  return new NextRequest(new URL(`http://localhost${path}`), {
    headers: token ? { cookie: `${SESSION_COOKIE}=${token}` } : {},
  });
}

describe("staff session tokens", () => {
  it("round-trips a signed session", async () => {
    const token = await createSessionToken("studio", secret());
    const session = await verifySessionToken(token, secret());
    expect(session?.sub).toBe("studio");
    expect(session?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("rejects a tampered payload", async () => {
    const token = await createSessionToken("studio", secret());
    const [body, signature] = token.split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({ sub: "intruder", exp: Math.floor(Date.now() / 1000) + 3600 }),
    )
      .toString("base64url");
    expect(await verifySessionToken(`${forgedPayload}.${signature}`, secret())).toBeNull();
    expect(await verifySessionToken(`${body}.deadbeef`, secret())).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken("studio", "a-completely-different-secret");
    expect(await verifySessionToken(token, secret())).toBeNull();
  });

  it("rejects expired tokens", async () => {
    const token = await createSessionToken("studio", secret(), -10);
    expect(await verifySessionToken(token, secret())).toBeNull();
  });

  it("rejects garbage and missing tokens", async () => {
    for (const value of ["", "nonsense", "a.b.c", undefined, null]) {
      expect(await verifySessionToken(value, secret())).toBeNull();
    }
  });

  it("compares credentials without leaking length information", async () => {
    expect(await safeStringEqual("humphine-demo", "humphine-demo")).toBe(true);
    expect(await safeStringEqual("humphine-demo", "humphine-demO")).toBe(false);
    expect(await safeStringEqual("short", "a-much-longer-value")).toBe(false);
  });
});

describe("credential configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses ADMIN_USERNAME and ADMIN_PASSWORD when both are set", () => {
    vi.stubEnv("ADMIN_USERNAME", "staff");
    vi.stubEnv("ADMIN_PASSWORD", "super-secret");
    expect(getStaffCredentials()).toEqual({
      username: "staff",
      password: "super-secret",
      source: "env",
    });
  });

  it("falls back to the documented demo login outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ADMIN_USERNAME", "");
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(getStaffCredentials()?.source).toBe("development-default");
  });

  it("disables sign-in in production when no credentials are configured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_USERNAME", "");
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(getStaffCredentials()).toBeNull();
  });
});

describe("middleware protection", () => {
  it("redirects unauthenticated visitors from the admin area to the sign-in page", async () => {
    const response = await middleware(await requestFor("/admin/portfolio"));
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/admin/login");
    expect(location).toContain("next=%2Fadmin%2Fportfolio");
  });

  it("redirects unauthenticated visitors from the admin root", async () => {
    const response = await middleware(await requestFor("/admin"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/admin/login");
  });

  it("blocks admin API endpoints with a 401 instead of exposing them", async () => {
    for (const path of ["/api/admin/content", "/api/admin/publish", "/api/admin/discard"]) {
      const response = await middleware(await requestFor(path));
      expect(response.status, path).toBe(401);
      const body = await response.json();
      expect(body.ok).toBe(false);
    }
  });

  it("does not accept a forged or expired session cookie", async () => {
    const expired = await createSessionToken("studio", secret(), -60);
    const response = await middleware(await requestFor("/admin", expired));
    expect(response.status).toBe(307);
  });

  it("lets authenticated staff through to the admin area", async () => {
    const token = await createSessionToken("studio", secret());
    const response = await middleware(await requestFor("/admin/portfolio", token));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("lets authenticated staff call admin APIs", async () => {
    const token = await createSessionToken("studio", secret());
    const response = await middleware(await requestFor("/api/admin/content", token));
    expect(response.status).toBe(200);
  });

  it("sends signed-in staff away from the sign-in page", async () => {
    const token = await createSessionToken("studio", secret());
    const response = await middleware(await requestFor("/admin/login", token));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toMatch(/\/admin$/);
  });

  it("always allows the sign-in page and sign-in endpoint", async () => {
    const page = await middleware(await requestFor("/admin/login"));
    expect(page.status).toBe(200);
    const api = await middleware(await requestFor("/api/admin/login"));
    expect(api.status).toBe(200);
  });
});
