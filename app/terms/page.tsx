import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | AlgorithmX",
  description:
    "Terms of service for AlgorithmX Cyber Heroes Academy: account use, acceptable use, and content licence.",
};

export default function TermsPage() {
  return (
    <main
      style={{
        /* Owner 2026-09-24: joins the light brand. This page has no art
           direction of its own, so whatever the brand is, it is this. */
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 50% 70%, #fbf7f0 0%, #f6f1e7 35%, #f3ede4 70%, #efe8dc 100%)",
        color: "#14161d",
        padding: "80px 24px",
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      <article style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link
          href="/cyberheroes"
          style={{ color: "#0a7085", fontSize: 13, textDecoration: "none" }}
        >
          ← Back to Cyber Heroes
        </Link>
        <h1
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontSize: 40,
            fontWeight: 900,
            marginTop: 18,
            marginBottom: 8,
            background:
              "linear-gradient(135deg, #8a5400 0%, #a63a08 35%, #a5117f 70%, #5744c9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          Terms of Service
        </h1>
        <p style={{ color: "rgba(17,22,38,0.62)", fontSize: 13, marginBottom: 36 }}>
          Last updated: April 2026
        </p>

        <Section title="Your account">
          <p>
            One AlgorithmX account is for one parent / guardian and the children
            in their household. You&rsquo;re responsible for keeping your sign-in
            details safe. If you believe someone else has accessed your account,
            email <ContactEmail /> and we&rsquo;ll help you secure it.
          </p>
        </Section>

        <Section title="What you get with Cyber Heroes Academy">
          <p>
            Your one-time £99 purchase grants lifetime access to the Cyber Heroes
            Academy course (currently 20 weeks of lessons, missions, and boss
            battles), all milestone certificates, and ongoing content updates as
            new threats emerge.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>
            The course is for personal use within your household. You may not
            redistribute, resell, or share your account with people outside your
            family. The animated lessons, illustrations, and audio are
            copyrighted; please don&rsquo;t republish or repackage them.
          </p>
        </Section>

        <Section title="Service availability">
          <p>
            We aim for the lesson player to work reliably on modern browsers
            (Chrome, Safari, Firefox, Edge - last two major versions). If
            something breaks, email <ContactEmail /> with a screenshot and a
            quick description of what you were doing - we&rsquo;ll fix it as fast
            as we can.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            If we materially change these terms, we&rsquo;ll email account
            holders ahead of the change. Day-to-day clarifications get posted
            here without notice.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about anything on this page? Email <ContactEmail />.
          </p>
        </Section>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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

function ContactEmail() {
  return (
    <a
      href="mailto:support@algorithmx.co.uk"
      style={{ color: "#a5117f", textDecoration: "underline" }}
    >
      support@algorithmx.co.uk
    </a>
  );
}
