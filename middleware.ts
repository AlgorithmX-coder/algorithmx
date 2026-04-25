import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
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
     *  - /_next/* (Next.js internals — static, image, etc.)
     *  - /favicon.ico
     *  - /logos/* (static logo assets)
     *  - /dev/* (dev-only preview/tooling routes — no auth)
     *  - anything with a file extension (static files)
     */
    "/((?!password|api|_next|favicon.ico|logos|dev|.*\\..*).*)",
  ],
};
