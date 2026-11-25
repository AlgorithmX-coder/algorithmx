/**
 * Token-based auth for the native (Expo/iOS) app.
 *
 * The web uses NextAuth's cookie session, which a native app can't carry, so
 * the mobile endpoints (/api/mobile/*) issue a signed JWT the app stores in
 * SecureStore and sends as `Authorization: Bearer <token>`. Signed with the
 * same AUTH_SECRET the rest of the app already uses (HS256). Additive — it
 * does not touch the web NextAuth flow.
 */
import { SignJWT, jwtVerify } from "jose";
import { sessionStillValid } from "@/app/lib/sessionValidity";

const secretStr = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
const secret = new TextEncoder().encode(secretStr);
const ISSUER = "algorithmx";
const AUDIENCE = "algorithmx-mobile";

export interface MobileClaims {
  sub: string;
  email: string;
  name?: string | null;
  role?: string;
  /** When the token was issued, in seconds (the JWT iat). */
  iat?: number;
}

export async function signMobileToken(claims: MobileClaims): Promise<string> {
  if (!secretStr) throw new Error("AUTH_SECRET is not configured");
  return new SignJWT({
    email: claims.email,
    name: claims.name ?? null,
    role: claims.role ?? "learner",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyMobileToken(token: string): Promise<MobileClaims | null> {
  if (!secretStr || !token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (!payload.sub) return null;
    return {
      sub: String(payload.sub),
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : null,
      role: typeof payload.role === "string" ? payload.role : "learner",
      iat: typeof payload.iat === "number" ? payload.iat : undefined,
    };
  } catch {
    return null;
  }
}

/** Extract + verify a Bearer token from a request. Returns null if invalid. */
export async function getMobileUser(request: Request): Promise<MobileClaims | null> {
  const authz = request.headers.get("authorization") ?? "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7).trim() : "";
  const claims = token ? await verifyMobileToken(token) : null;
  if (!claims) return null;
  /* Same rule as the web session: a token issued before the password last
     changed is refused. iat is whole seconds, so it counts as the end of
     the second it was issued in: a token issued in the same second as a
     reset survives, which is the only rounding that never signs out a
     token issued just after one. */
  const issuedMs = typeof claims.iat === "number" ? claims.iat * 1000 + 999 : undefined;
  if (!(await sessionStillValid(claims.sub, issuedMs))) return null;
  return claims;
}
