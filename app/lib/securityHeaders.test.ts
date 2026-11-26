import { describe, expect, it } from "vitest";
import { PERMISSIONS_POLICY, contentSecurityPolicy, securityHeaders, sentryCspReportUri } from "./securityHeaders";

describe("securityHeaders", () => {
  const byKey = Object.fromEntries(securityHeaders().map((h) => [h.key, h.value]));

  it("sends the fixed headers", () => {
    expect(byKey["Strict-Transport-Security"]).toBe("max-age=63072000; includeSubDomains");
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["X-Frame-Options"]).toBe("SAMEORIGIN");
  });

  it("ships the CSP report-only, never enforcing", () => {
    expect(byKey["Content-Security-Policy-Report-Only"]).toBeTruthy();
    expect(byKey["Content-Security-Policy"]).toBeUndefined();
  });

  it("keeps fullscreen and clipboard for this origin and switches off the camera, microphone and location", () => {
    expect(PERMISSIONS_POLICY).toContain("fullscreen=(self)");
    expect(PERMISSIONS_POLICY).toContain("clipboard-write=(self)");
    for (const f of ["camera=()", "microphone=()", "geolocation=()"]) expect(PERMISSIONS_POLICY).toContain(f);
  });
});

describe("contentSecurityPolicy", () => {
  it("covers what the app loads", () => {
    const csp = contentSecurityPolicy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toMatch(/script-src [^;]*https:\/\/plausible\.io/);
    expect(csp).toMatch(/connect-src [^;]*https:\/\/\*\.ingest\.de\.sentry\.io/);
    expect(csp).toMatch(/style-src [^;]*https:\/\/fonts\.googleapis\.com/);
    expect(csp).toMatch(/font-src [^;]*https:\/\/fonts\.gstatic\.com/);
    expect(csp).toMatch(/img-src [^;]*blob:/);
    expect(csp).toMatch(/media-src [^;]*blob:/);
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain("report-uri");
  });

  it("allows eval and the dev socket only in development", () => {
    expect(contentSecurityPolicy()).not.toContain("'unsafe-eval'");
    expect(contentSecurityPolicy({ dev: true })).toContain("'unsafe-eval'");
    expect(contentSecurityPolicy({ dev: true })).toMatch(/connect-src [^;]*ws:/);
  });

  it("adds a report-uri when given one", () => {
    expect(contentSecurityPolicy({ reportUri: "https://r.example/csp" })).toContain("report-uri https://r.example/csp");
  });
});

describe("sentryCspReportUri", () => {
  it("turns a DSN into Sentry's security endpoint", () => {
    expect(sentryCspReportUri("https://abc123@o1.ingest.de.sentry.io/456")).toBe("https://o1.ingest.de.sentry.io/api/456/security/?sentry_key=abc123");
  });
  it("gives nothing for an empty or broken DSN", () => {
    expect(sentryCspReportUri("")).toBeNull();
    expect(sentryCspReportUri(undefined)).toBeNull();
    expect(sentryCspReportUri("not a url")).toBeNull();
    expect(sentryCspReportUri("https://o1.ingest.sentry.io/456")).toBeNull();
  });
});
