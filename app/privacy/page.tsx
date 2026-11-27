import type { Metadata } from "next";
import ReadingRoom, { DocSection as Section } from "@/app/components/reading-room/ReadingRoom";

export const metadata: Metadata = {
  title: "Privacy Policy | AlgorithmX",
  description:
    "How AlgorithmX handles your child's data. GDPR compliant, no third-party advertising, no data sold.",
};

export default function PrivacyPage() {
  /* The round 7 reading room (landing lab r7-misc-privacy.html). Only the
     layout changed: the title, the date line and every section below are
     word for word as they were. */
  return (
    <ReadingRoom variant="plain" route="/privacy" title="Privacy Policy" updated="Last updated: April 2026">

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
          <ul>
            <li>We do not sell or share your child&rsquo;s data with third parties.</li>
            <li>We do not run third-party advertising trackers on the lesson player.</li>
            <li>We do not let other users contact your child - there is no chat,
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
            Cyber Heroes Academy is designed for children aged 6–10. We treat all
            user accounts as belonging to a parent or guardian - you create the
            account, you provide consent, you control the data.
          </p>
        </Section>

        <Section title="Questions">
          <p>
            For privacy questions, data exports, or deletion requests, email{" "}
            <ContactEmail />.
          </p>
        </Section>
    </ReadingRoom>
  );
}

function ContactEmail() {
  return (
    <a href="mailto:support@algorithmx.co.uk">
      support@algorithmx.co.uk
    </a>
  );
}
