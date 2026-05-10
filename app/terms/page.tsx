import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | AlgorithmX",
  description:
    "Terms of service for AlgorithmX Cyber Heroes Academy - refund policy, account use, content licence.",
};

export default function TermsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 50% 70%, #2a0d2e 0%, #1a1f4d 35%, #0f1530 70%, #04050d 100%)",
        color: "#e7ecff",
        padding: "80px 24px",
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      <article style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link
          href="/cyberheroes"
          style={{ color: "#7df0ff", fontSize: 13, textDecoration: "none" }}
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
              "linear-gradient(135deg, #ffd158 0%, #ff7a59 35%, #ff5fb3 70%, #7c5cff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          Terms of Service
        </h1>
        <p style={{ color: "rgba(199,207,240,0.7)", fontSize: 13, marginBottom: 36 }}>
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

        <Section title="Refund policy">
          <p>
            We offer a 30-day money-back guarantee, no questions asked. If your
            child isn&rsquo;t engaged within the first 30 days of purchase, email{" "}
            <ContactEmail /> with your order details and we&rsquo;ll process a
            full refund. After the refund, we delete your child&rsquo;s progress
            data; if you change your mind later, you&rsquo;re welcome to re-enrol.
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
            If we materially change these terms (for example a refund-window
            change), we&rsquo;ll email account holders ahead of the change.
            Day-to-day clarifications get posted here without notice.
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
          color: "#7df0ff",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      <div style={{ color: "#c5cdf0", fontSize: 15, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

function ContactEmail() {
  return (
    <a
      href="mailto:support@algorithmx.co.uk"
      style={{ color: "#ff5fb3", textDecoration: "underline" }}
    >
      support@algorithmx.co.uk
    </a>
  );
}
