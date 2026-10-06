import { NextRequest, NextResponse } from "next/server";

/* Paths that never see the launch password. `/verify` and `/api` are
 * already outside the matcher below. */
const OPEN_PREFIXES = ["/corporate", "/ai-cleared", "/ai-fluent", "/login", "/signup", "/forgot-password", "/reset-password", "/privacy", "/terms"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dev-only routes (the /dev preview harness + /test QA pages) must NEVER be
  // reachable in production — they expose internal tooling and unfinished
  // scaffolding. 404 them in prod; leave them open (no site-password) in
  // local dev so iteration stays frictionless.
  // The CI e2e job runs a production build with E2E_TESTS=1 and plays the
  // AI Cleared modules through /dev/ai-cleared; Vercel never sets that.
  if (pathname.startsWith("/dev") || pathname.startsWith("/test")) {
    if (process.env.NODE_ENV === "production" && process.env.E2E_TESTS !== "1") {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  // The corporate line is on sale: its pages, both courses (including the
  // join links and certificates under them) and the sign-in pages a learner
  // needs are open to everyone. The rest of the site stays behind the
  // launch password until the owner lifts it.
  if (OPEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return NextResponse.next();

  const authed = req.cookies.get("site_auth")?.value === "true";
  if (authed) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/password";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - /password (the gate page itself)
     *  - /api/* (API routes, incl. /api/password)
     *  - /_next/* (Next.js internals - static, image, etc.)
     *  - /favicon.ico
     *  - /logos/* (static logo assets)
     *  - anything with a file extension (static files)
     * NOTE: /dev and /test are intentionally INCLUDED now so the handler
     * above can 404 them in production.
     */
    "/((?!password|api|verify|_next|favicon.ico|logos|.*\\..*).*)",
  ],
};
