import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | AlgorithmX",
  description:
    "How AlgorithmX handles your child's data. GDPR compliant, no third-party advertising, no data sold.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ color: "rgba(199,207,240,0.7)", fontSize: 13, marginBottom: 36 }}>
          Last updated: April 2026
        </p>

        <Section title="What we collect">
          <p>
            When you create an AlgorithmX account, we collect only the data we need
            to deliver the course: your email address, your child&rsquo;s first
            name (or chosen avatar name), age, and your encrypted password. As your
            child plays, we store their lesson progress, badges earned, scores,
            and timestamps so they can pick up where they left off and so you can
            see how they&rsquo;re getting on from the parent dashboard.
          </p>
        </Section>

        <Section title="What we never do">
          <ul style={{ paddingLeft: 22, lineHeight: 1.7 }}>
            <li>We do not sell or share your child&rsquo;s data with third parties.</li>
            <li>We do not run third-party advertising trackers on the lesson player.</li>
            <li>We do not let other users contact your child — there is no chat,
              no public profile, no social feed.</li>
            <li>
              We do not use any of your child&rsquo;s data to train AI models,
              advertise to them, or build behavioural profiles outside of the
              course itself.
            </li>
          </ul>
        </Section>

        <Section title="Where data is stored">
          <p>
            Your account and progress data are stored on UK / EU-region servers
            and protected by encryption at rest and in transit (HTTPS / TLS).
            We are working toward formal GDPR and ICO registration; in the
            meantime we follow GDPR principles by default.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can request a full export of your child&rsquo;s data, request that
            it be deleted, or close your account at any time by emailing{" "}
            <ContactEmail />. If you request deletion, we&rsquo;ll remove
            personally identifiable data within 30 days.
          </p>
        </Section>

        <Section title="Cookies and local storage">
          <p>
            We use the browser&rsquo;s local storage to remember your sign-in and
            your child&rsquo;s in-game progress (badges, saved password sandbox,
            etc.). We do not place third-party advertising or tracking cookies.
          </p>
        </Section>

        <Section title="Children under 13">
          <p>
            Cyber Heroes Academy is designed for children aged 6–9. We treat all
            user accounts as belonging to a parent or guardian — you create the
            account, you provide consent, you control the data.
          </p>
        </Section>

        <Section title="Questions">
          <p>
            For privacy questions, data exports, or deletion requests, email{" "}
            <ContactEmail />.
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
      href="mailto:hello@algorithmx.co.uk"
      style={{ color: "#ff5fb3", textDecoration: "underline" }}
    >
      hello@algorithmx.co.uk
    </a>
  );
}
