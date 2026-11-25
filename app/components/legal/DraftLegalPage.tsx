import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The shell for the four DRAFT policy pages (/cookies, /safeguarding,
 * /accessibility, /refunds), in the bright front-door look of /terms and
 * /privacy.
 *
 * Drafts until the solicitor has read them: every page carries a visible
 * Draft banner, is noindex, and nothing on the site links to it. When a
 * page is approved, drop the banner and the robots line and link it from
 * the footers.
 */

export function draftMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} (draft) | AlgorithmX`,
    description,
    robots: { index: false, follow: false },
  };
}

export function DraftLegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 70%, #fbf7f0 0%, #f6f1e7 35%, #f3ede4 70%, #efe8dc 100%)",
        color: "#14161d",
        padding: "80px 24px",
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      <article style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#0a7085", fontSize: 13, textDecoration: "none" }}>
          ← Back to AlgorithmX
        </Link>
        <p
          role="note"
          style={{
            margin: "18px 0 0",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid rgba(166,58,8,0.35)",
            background: "rgba(255,237,213,0.85)",
            color: "#7a2e06",
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          Draft. This page is waiting for legal review and is not yet in force.
        </p>
        <h1
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontSize: 40,
            fontWeight: 900,
            marginTop: 18,
            marginBottom: 8,
            background: "linear-gradient(135deg, #8a5400 0%, #a63a08 35%, #a5117f 70%, #5744c9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <p style={{ color: "rgba(17,22,38,0.62)", fontSize: 13, marginBottom: 36 }}>Draft: {updated}</p>
        {children}
        <p style={{ color: "rgba(17,22,38,0.62)", fontSize: 13, marginTop: 40 }}>
          AlgorithmX Limited. Company 17266946, registered in England and Wales. Registered office: 301b Uppingham Road, Leicester LE5 4DG.
        </p>
      </article>
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2
        style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 18,
          fontWeight: 800,
          color: "#0a7085",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      <div style={{ color: "rgba(17,22,38,0.84)", fontSize: 15, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

export function Mail({ to }: { to: "support" | "admissions" }) {
  const address = `${to}@algorithmx.co.uk`;
  return (
    <a href={`mailto:${address}`} style={{ color: "#a5117f", textDecoration: "underline" }}>
      {address}
    </a>
  );
}

/** A plain two-column table for the cookie and storage lists. */
export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  const cell = { padding: "10px 12px", borderBottom: "1px solid rgba(20,22,29,0.12)", textAlign: "left" as const, verticalAlign: "top" as const };
  return (
    <div style={{ overflowX: "auto", margin: "6px 0 14px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, lineHeight: 1.55 }}>
        <thead>
          <tr>{head.map((h) => <th key={h} scope="col" style={{ ...cell, fontWeight: 800, color: "#14161d" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={cell}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}
