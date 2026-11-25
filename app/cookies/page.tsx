import { DraftLegalPage, Mail, Section, Table, draftMetadata } from "@/app/components/legal/DraftLegalPage";

/* DRAFT for the solicitor. Facts are taken from the code as of 2026-11-25:
 * app/api/password/route.ts (site_auth), app/lib/auth.ts (Auth.js, JWT
 * sessions), app/layout.tsx (Vercel Analytics, PlausibleScript),
 * instrumentation-client.ts (Sentry, replay off, sendDefaultPii false).
 * Re-check those files before this goes live. */

export const metadata = draftMetadata("Cookies", "How AlgorithmX uses cookies and browser storage.");

export default function CookiesPage() {
  return (
    <DraftLegalPage title="Cookies" updated="November 2026">
      <Section title="The short version">
        <p>
          AlgorithmX uses a small number of cookies, and only the ones the site needs to work: to keep you signed in
          and to keep the sign-in form secure. We use no advertising cookies and no cookies that follow you around
          other websites. Our visitor counts are made without cookies.
        </p>
      </Section>

      <Section title="Cookies we set">
        <p>These are strictly necessary, so they are set without asking. Blocking them stops sign-in from working.</p>
        <Table
          head={["Cookie", "What it does", "How long it lasts"]}
          rows={[
            [<code key="a">authjs.session-token</code>, "Keeps you signed in to your account. Holds a signed token, not your password.", "Up to 30 days, or until you sign out"],
            [<code key="b">authjs.csrf-token</code>, "Protects the sign-in form from being submitted by another website.", "Until you close your browser"],
            [<code key="c">authjs.callback-url</code>, "Remembers which page to take you back to after you sign in.", "Until you close your browser"],
            [<code key="d">site_auth</code>, "Only while the site is in its preview period: remembers that you entered the preview password.", "30 days"],
          ]}
        />
        <p>
          On the live site the sign-in cookies carry a <code>__Secure-</code> or <code>__Host-</code> prefix, which
          tells your browser to send them only over a secure connection.
        </p>
      </Section>

      <Section title="Counting visits without cookies">
        <p>
          We use Vercel Web Analytics to count page views. It does not set cookies and does not build a profile of
          you. When it is switched on, Plausible Analytics does the same job in the same way: no cookies, no
          personal data.
        </p>
      </Section>

      <Section title="Error reports">
        <p>
          When something breaks, Sentry sends us a report so we can fix it. Our set-up does not record your screen,
          does not attach your personal details, and removes cookies and sign-in details from every report before
          it is sent. It does not set cookies.
        </p>
      </Section>

      <Section title="Browser storage">
        <p>
          Some courses save your place in your browser&rsquo;s own storage (local storage) so a lesson can pick up
          where it left off: progress through a lesson or mission, notes you write, and settings such as sound on or
          off, paused motion and comfort mode. This stays on your device and is not used to track you. Clearing your
          browser data removes it; progress saved to your account is kept.
        </p>
      </Section>

      <Section title="Payments">
        <p>
          When you pay, you are taken to a secure payment page run by Stripe. Stripe sets its own cookies on that
          page to process the payment and prevent fraud. Those cookies belong to Stripe and are covered by
          Stripe&rsquo;s own cookie policy.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          You can delete or block cookies in your browser settings at any time. If you block the sign-in cookies you
          will not be able to stay signed in.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about cookies? Email <Mail to="support" />.
        </p>
      </Section>
    </DraftLegalPage>
  );
}
