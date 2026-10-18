import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dev-only routes (the /dev preview harness + /test QA pages) must NEVER be
  // reachable in production: they expose internal tooling and unfinished
  // scaffolding. 404 them in prod; leave them open (no gate) in local dev so
  // iteration stays frictionless. The CI e2e job runs a production build with
  // E2E_TESTS=1 and plays modules through /dev/*; Vercel never sets that.
  if (pathname.startsWith("/dev") || pathname.startsWith("/test")) {
    if (process.env.NODE_ENV === "production" && process.env.E2E_TESTS !== "1") {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  // The launch password was lifted (owner, 2026-10-18): the whole site is
  // public now. Member areas (dashboard, lessons, the school class + teacher
  // tools) each keep their own account login underneath, so a signed-in
  // account is the only password a visitor ever needs. To re-gate the site,
  // restore the site_auth cookie check that redirected to /password here.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - /password, /verify (open pages that need no middleware)
     *  - /api/* (API routes)
     *  - /_next/* (Next.js internals: static, image, etc.)
     *  - /favicon.ico
     *  - /logos/* (static logo assets)
     *  - anything with a file extension (static files)
     * /dev and /test stay INCLUDED so the guard above can 404 them in prod.
     */
    "/((?!password|api|verify|_next|favicon.ico|logos|.*\\..*).*)",
  ],
};
