import type { Metadata } from "next";
import CorporateSubpage from "../CorporateSubpage";

/**
 * /corporate/security - the one page a buyer's procurement or IT team asks
 * for: where the data is, who processes it, how long it is kept, how a
 * person gets in, and what happens when something goes wrong. Facts only;
 * every claim here is something the firm can check and something the code
 * or a contract actually does.
 */
export const metadata: Metadata = {
  title: "Security and data handling | AI Cleared by AlgorithmX",
  description:
    "Where AI Cleared and AI Fluent keep a firm's data, who processes it, how long it is kept, how people sign in, and how an incident is handled. The page a procurement team asks for.",
  alternates: { canonical: "https://algorithmx.io/corporate/security" },
  openGraph: {
    title: "Security and data handling at AlgorithmX",
    description: "Hosting, sub-processors, retention, access and incident handling for the corporate courses.",
    url: "https://algorithmx.io/corporate/security",
    siteName: "AlgorithmX",
    type: "article",
    images: [{ url: "https://algorithmx.io/corporate/og.png", width: 1200, height: 630, alt: "Every member of staff, cleared to use AI. AI Cleared and AI Fluent by AlgorithmX." }],
  },
};

export default function SecurityPage() {
  return (
    <CorporateSubpage
      eyebrow="// Security · how the courses handle a firm's data"
      title={<>What we hold, where it lives, <span className="corp-sub-grad">and who can see it.</span></>}
      lede="A firm that puts its staff through AI Cleared or AI Fluent gives us very little: the names and work emails of the people on its seats, and what each of them typed into a practice sandbox that holds invented data. This page sets out how that is handled, in the order a procurement questionnaire asks."
      asOf="5 October 2026"
      mapsHeading="// In one line each"
      maps={[
        "The application and the database run in London; the only data that leaves the UK is the model request to Anthropic and Stripe's record of a payment.",
        "Five sub-processors, named below. The model is never trained on what a learner types.",
        "Practice data is invented by design, and a send that looks like real personal data is stopped in the browser before it goes anywhere.",
        "A person's account, attempts and playbook are deleted on their firm's written request.",
      ]}
      sections={[
        {
          heading: "What we hold about a firm and its people",
          body: (
            <>
              <p>For the firm: its name, sector, the name and role of the person staff should ask about AI, its approved tools and data class names, how many seats it bought and when. For each person on a seat: their work email, the name they sign up with, the modules they have finished, the verdict and score on each practice send, and their certificate serial.</p>
              <p>For AI Fluent learners only: the prompts they chose to save to their personal playbook. The playbook is theirs; the firm&rsquo;s admin sees how many entries exist, never the text.</p>
              <p>We do not hold payment card details. Stripe takes the card on its own page and gives us a reference and an invoice.</p>
            </>
          ),
        },
        {
          heading: "Where it lives",
          body: (
            <>
              <ul>
                <li><strong>Application:</strong> Vercel, serverless functions in the London region, encrypted in transit and at rest.</li>
                <li><strong>Database:</strong> Neon Postgres in AWS London (eu-west-2), encrypted at rest, with point-in-time recovery.</li>
                <li><strong>Email:</strong> Resend sends the invites, welcomes, certificates and reminders and keeps its own log of each send.</li>
                <li><strong>Payments:</strong> Stripe holds the card and the invoice under its own PCI DSS Level 1 certification.</li>
                <li><strong>Errors:</strong> Sentry&rsquo;s EU region (Frankfurt) receives error reports, which carry no learner content.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "The model, and what it sees",
          body: (
            <>
              <p>Every practice send and every reply in the sandbox runs on Anthropic&rsquo;s Claude through its commercial API. Under those terms Anthropic does not use inputs or outputs to train its models; it may hold them for up to thirty days for trust and safety monitoring, and no longer. We send the learner&rsquo;s prompt, the invented practice documents and the firm&rsquo;s name so the reply reads naturally. We never send the register, a real client document, or anything a learner did not type into the sandbox.</p>
              <p>The sandbox is built so that real data should never reach it: every practice uses invented firms, people and figures, and a rules layer in the browser halts a send that looks like a real email address, a National Insurance number, a bank detail or a card number before anything leaves the page. The learner is told why and nothing is sent.</p>
              <p>Each person has a daily allowance of model calls; past it the course carries on with its rules-based grading until the next day. That is what stops a runaway session or a script from spending without limit.</p>
            </>
          ),
        },
        {
          heading: "Sub-processors",
          body: (
            <>
              <p>Five organisations process a firm&rsquo;s data on our behalf, each under its own data processing terms. We tell admins before adding one.</p>
              <ul>
                <li><strong>Vercel Inc.</strong> Hosting and serverless compute, London region.</li>
                <li><strong>Neon Inc.</strong> The Postgres database, AWS London.</li>
                <li><strong>Anthropic PBC.</strong> The model behind the grader and the simulator replies, under its commercial terms: no training on inputs, retention of up to thirty days for trust and safety.</li>
                <li><strong>Resend Inc.</strong> Transactional email.</li>
                <li><strong>Stripe Payments UK Ltd.</strong> Card payments, invoices and VAT receipts. The firm&rsquo;s billing contact and VAT number are held by Stripe under its own terms.</li>
              </ul>
              <p>Sentry (Functional Software Inc.) receives error reports in its EU region; it sees no learner content. Vercel&rsquo;s cookieless analytics counts page views on the public pages and identifies nobody.</p>
            </>
          ),
        },
        {
          heading: "How people get in",
          body: (
            <>
              <ul>
                <li>A learner reaches the course through an invite link sent to the work email their firm&rsquo;s admin entered. The link claims one seat, once; after that nobody else can use it.</li>
                <li>Sign-in is email and password: at least eight characters with a capital and a symbol, hashed with bcrypt, sessions signed with a server-side secret. A password reset is an emailed link that expires after an hour.</li>
                <li>An admin sees only their own firm: the register, the certificates and the profile. Staff at AlgorithmX reach every firm through a separate console that checks a staff flag on every request.</li>
                <li>Production secrets live only in Vercel&rsquo;s encrypted environment store. No key is in the code, and the database accepts connections only from the application.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "How long we keep it, and how to have it removed",
          body: (
            <>
              <ul>
                <li><strong>The firm, its seats and its people&rsquo;s progress:</strong> for as long as the firm is a customer, and until it asks otherwise after that.</li>
                <li><strong>Certificates:</strong> the serial, holder name, firm, score and dates stay on the public verify page so a client or auditor can check them, until the firm or the holder asks for removal.</li>
                <li><strong>Model call records:</strong> who called the model and when, kept to enforce the daily allowance. Never the content.</li>
                <li><strong>Deletion on request:</strong> a firm&rsquo;s admin writes to <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a> naming the person. We delete the account, their attempts and their playbook within thirty days and mark the seat on the register as removed. A firm leaving us has the whole firm deleted the same way.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "When something goes wrong",
          body: (
            <>
              <p>A payment that did not set a firm up, an email that did not send or an error in the application raises an alert to a named person at AlgorithmX straight away. Where an incident involves a firm&rsquo;s personal data, we tell the firm&rsquo;s admin without undue delay, with what happened, what data was involved and what we have done, so the firm can meet its own duty to the ICO.</p>
              <p>Every change to the application goes through a pull request with automated type checks, unit tests and a full play-through of both courses before it reaches production. Deploys are atomic and can be rolled back in one step.</p>
            </>
          ),
        },
        {
          heading: "What we do not do",
          body: (
            <>
              <ul>
                <li>We do not sell, share or use a firm&rsquo;s data for anything but running the courses for that firm.</li>
                <li>We do not use learner prompts to train anything, ours or anyone else&rsquo;s.</li>
                <li>We place no advertising or tracking cookies; the only cookies are the sign-in session and the launch gate.</li>
                <li>We do not hold card numbers, and we never ask a learner for anything about a real client.</li>
              </ul>
              <p>Questions from a procurement or security team go to <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a>.</p>
            </>
          ),
        },
      ]}
    />
  );
}
