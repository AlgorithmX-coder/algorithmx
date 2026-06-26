import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dev-only routes (the /dev preview harness + /test QA pages) must NEVER be
  // reachable in production — they expose internal tooling and unfinished
  // scaffolding. 404 them in prod; leave them open (no site-password) in
  // local dev so iteration stays frictionless.
  if (pathname.startsWith("/dev") || pathname.startsWith("/test")) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

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
    "/((?!password|api|_next|favicon.ico|logos|.*\\..*).*)",
  ],
};
