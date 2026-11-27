import type { Metadata } from "next";
import ReadingRoom, { DocSection as Section } from "@/app/components/reading-room/ReadingRoom";

export const metadata: Metadata = {
  title: "Terms of Service | AlgorithmX",
  description:
    "Terms of service for AlgorithmX Cyber Heroes Academy: account use, acceptable use, and content licence.",
};

export default function TermsPage() {
  /* The round 7 reading room (landing lab r7-misc-terms.html). Only the
     layout changed: the title, the date line and every section below are
     word for word as they were. */
  return (
    <ReadingRoom variant="plain" route="/terms" title="Terms of Service" updated="Last updated: April 2026">

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
