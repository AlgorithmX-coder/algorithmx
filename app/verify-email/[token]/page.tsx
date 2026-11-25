import type { Metadata } from "next";
import Link from "next/link";
import { redeemVerifyToken, type VerifyOutcome } from "@/app/lib/emailVerification";

/* /verify-email/[token]: the link in the welcome email. Opening it
 * confirms the address (app/lib/emailVerification.ts) and says so on a
 * plain bright card. Nothing here signs anyone in or changes access: the
 * courses never waited on this. (Not /verify: that path was retired.) */

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Confirm your email | AlgorithmX", robots: { index: false, follow: false } };

const WORDS: Record<VerifyOutcome, { tone: "ok" | "warn"; head: string; body: string }> = {
  verified: { tone: "ok", head: "Your email is confirmed", body: "Thank you. Your AlgorithmX account is all set, and you can carry on where you left off." },
  already: { tone: "ok", head: "Your email is already confirmed", body: "This link has been used before, and your address is confirmed. There is nothing more to do." },
  expired: { tone: "warn", head: "This link has expired", body: "Links last seven days. Your account still works as normal. Sign in and carry on, and we will confirm your address another time." },
  invalid: { tone: "warn", head: "This link does not work", body: "It may have been copied only in part, or already used. Your account still works as normal, so you can sign in and carry on." },
};

export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const outcome = await redeemVerifyToken(token);
  const w = WORDS[outcome];
  const ok = w.tone === "ok";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
        background: "linear-gradient(180deg, #f5f8ff 0%, #eaf1ff 100%)",
        color: "#14183a",
        fontFamily: "var(--font-inter), var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      <section
        aria-labelledby="verify-title"
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#ffffff",
          borderRadius: 20,
          border: "1px solid #dbe3f5",
          boxShadow: "0 18px 48px rgba(20,24,58,0.10)",
          padding: "40px 32px 36px",
          textAlign: "center",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 56,
            height: 56,
            margin: "0 auto 20px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: ok ? "#e3f8ee" : "#fff4e0",
            color: ok ? "#127a4a" : "#9a5b00",
          }}
        >
          {ok ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
          )}
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#5a6390" }}>AlgorithmX</p>
        <h1 id="verify-title" style={{ margin: "0 0 12px", fontSize: 26, lineHeight: 1.25, fontWeight: 800 }}>{w.head}</h1>
        <p role="status" style={{ margin: "0 0 28px", fontSize: 16, lineHeight: 1.6, color: "#3b4470" }}>{w.body}</p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "13px 28px",
            borderRadius: 999,
            background: "#2f5bff",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 15,
            textDecoration: "none",
          }}
        >
          Go to AlgorithmX
        </Link>
      </section>
    </main>
  );
}
