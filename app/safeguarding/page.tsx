import { DraftLegalPage, Mail, Section, draftMetadata } from "@/app/components/legal/DraftLegalPage";

/* DRAFT for the solicitor. Describes only what the code does as of
 * 2026-11-25: app/lib/pupilAuth.ts (class code, name, picture sequence,
 * no pupil email), prisma ChildProfile (first name, optional date of birth,
 * favourite colour), no messaging model anywhere in prisma/schema.prisma,
 * Cyber Ops runs in a simulated range. Re-check before this goes live. */

export const metadata = draftMetadata("Safeguarding", "How AlgorithmX keeps children safe on its courses.");

export default function SafeguardingPage() {
  return (
    <DraftLegalPage title="Safeguarding" updated="November 2026">
      <Section title="Who our courses are for">
        <p>
          AlgorithmX teaches children to stay safe online. Cyber Heroes is for ages 6 to 9, Cyber Explorers for 10
          to 13 and Cyber Ops for 14 to 17. Children take part at home on a family account, or at school in a class
          set up by their teacher. Everything below is how the platform is built today.
        </p>
      </Section>

      <Section title="Children cannot contact each other">
        <p>
          There is no chat, messaging, friend list, comment box or public profile page anywhere on the platform. A child
          cannot send anything to another child or to an adult, and nobody can send anything to a child. There are
          no leaderboards, no advertising and nothing for sale inside a lesson.
        </p>
      </Section>

      <Section title="Signing in at school">
        <p>
          A pupil signs in with three taps: the class code from the card their teacher hands out, their own first
          name from the class list, and a short sequence of pictures. A pupil never needs an email address or a
          typed password, and we never ask a school for one. Pupil accounts have no email address that can receive
          mail.
        </p>
        <p>
          A class code shows only the first names of the children in that class, so a child can find their own.
          Codes are made by the platform, not chosen by the school, so they cannot be guessed from a school&rsquo;s
          name. We do not ask schools for a pupil&rsquo;s date of birth.
        </p>
      </Section>

      <Section title="Family accounts">
        <p>
          A family account is opened with a name, an email address and a password. Each child then has a profile
          with a first name, a date of birth and a favourite colour. The account holder can see their child&rsquo;s progress, badges and certificates.
        </p>
      </Section>

      <Section title="What teachers see">
        <p>
          School staff see the classes in their own school and the progress of the pupils in them. They cannot
          see another school&rsquo;s classes, and pupils cannot see each other&rsquo;s work.
        </p>
      </Section>

      <Section title="Safe by design">
        <p>
          Lessons teach children to stop, think and tell a trusted adult. Scenarios use made-up characters and
          made-up messages. Cyber Ops practice happens in a simulated range: no real systems, websites or people are
          involved.
        </p>
      </Section>

      <Section title="Raising a concern">
        <p>
          If you are worried about a child&rsquo;s safety in connection with AlgorithmX, or about anything you have
          seen on the platform, email <Mail to="support" />. A real person reads every message.
        </p>
      </Section>
    </DraftLegalPage>
  );
}
