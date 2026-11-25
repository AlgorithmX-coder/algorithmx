import { DraftLegalPage, Mail, Section, draftMetadata } from "@/app/components/legal/DraftLegalPage";

/* DRAFT for the solicitor. The features listed are in the code as of
 * 2026-11-25 (pause-motion buttons on the landing pages, prefers-reduced-
 * motion styles, comfort mode and mute in lessons, spoken narration in the
 * children's courses, picture sign-in for pupils). No audit has been done,
 * so the page says so rather than claiming conformance. */

export const metadata = draftMetadata("Accessibility", "How accessible AlgorithmX is today, and how to tell us when something gets in your way.");

export default function AccessibilityPage() {
  return (
    <DraftLegalPage title="Accessibility" updated="November 2026">
      <Section title="Our aim">
        <p>
          We want everyone to be able to learn with AlgorithmX. We are working towards the Web Content
          Accessibility Guidelines (WCAG) 2.2 at level AA across the website and every course.
        </p>
      </Section>

      <Section title="Where we are today">
        <p>
          The site has not yet had an independent accessibility audit, so we cannot yet say that it meets WCAG 2.2
          AA, and we do not yet know every place where it falls short. An audit is the next step, and this page
          will list what it finds and when each item will be fixed.
        </p>
      </Section>

      <Section title="What is already built in">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Moving backgrounds and videos on our main pages have a button to pause them.</li>
          <li>If your device is set to reduce motion, the site respects it.</li>
          <li>Lessons have a mute control. Cyber Heroes has a comfort mode that calms effects, cuts motion and slows down timed games.</li>
          <li>In Cyber Heroes and Cyber Explorers, a narrator reads the lesson aloud.</li>
          <li>Pupils at school sign in with their class code, then tap their name and a set of pictures. There is no password to type.</li>
          <li>Pages work in current versions of Chrome, Safari, Firefox and Edge, and you can zoom them.</li>
        </ul>
      </Section>

      <Section title="Parts that may be harder to use">
        <p>
          Some course activities are games that use dragging, timing or quick reactions, and some rely on sound or
          colour. These may be hard to use with a keyboard alone, a screen reader or switch access. If one gets in
          your way, tell us and we will help you through it and look at how to fix it.
        </p>
      </Section>

      <Section title="Tell us about a problem">
        <p>
          If anything on AlgorithmX is hard to use, or you need information in a different format, email{" "}
          <Mail to="support" />. Tell us the page or lesson and what happened, and we will reply.
        </p>
      </Section>
    </DraftLegalPage>
  );
}
