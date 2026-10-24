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

  // Launch gate toggle. OFF 2026-10-24 (owner: drop the site password for ~a
  // week; restore on request, ~2026-10-31). While OFF the whole site is public
  // again; member areas keep their own auth. To re-enable the gate, flip
  // LAUNCH_GATE back to true — the password logic below is preserved.
  //
  // When ON, the whole site requires the site password before anything is
  // reachable. /password, /api, /verify and static assets are excluded by the
  // matcher below, so the gate page and its POST endpoint stay open to take the
  // password. CI e2e runs with E2E_TESTS=1 and bypasses the gate so the suite
  // can drive the app directly.
  const LAUNCH_GATE = false;

  if (LAUNCH_GATE && process.env.E2E_TESTS !== "1") {
    const authed = req.cookies.get("site_auth")?.value === "v2";
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/password";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

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
