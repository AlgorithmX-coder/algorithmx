import type { Metadata } from "next";
import Link from "next/link";
import CorporateSubpage from "../CorporateSubpage";

/**
 * /corporate/dpa - the data processing agreement between a firm (the
 * controller) and AlgorithmX (the processor) for AI Cleared and AI Fluent.
 * DRAFT: written for the solicitor's review and held on this branch until
 * the reviewed text replaces it. Article 28 UK GDPR is the spine.
 */
export const metadata: Metadata = {
  title: "Data processing agreement | AI Cleared by AlgorithmX",
  description: "How AlgorithmX processes a firm's people's data to run AI Cleared and AI Fluent: what, why, where, through whom, for how long, and how it is deleted on request.",
  alternates: { canonical: "https://algorithmx.io/corporate/dpa" },
  robots: { index: false },
};

export default function CorporateDpaPage() {
  return (
    <CorporateSubpage
      eyebrow="// Data processing agreement · firms"
      title={<>How we process your people&rsquo;s data, <span className="corp-sub-grad">and nothing more.</span></>}
      lede="This agreement forms part of the terms for firms. The firm is the controller of its people's personal data; AlgorithmX Ltd is the processor, and processes that data only to run the courses the firm has bought. It is written to meet Article 28 of UK GDPR and to be read without a lawyer, although your own advice governs."
      asOf="5 October 2026"
      mapsHeading="// What this agreement commits us to"
      maps={[
        "Process only on your instructions, which are these terms and what your admin does in the console.",
        "Five named sub-processors, each under written terms; notice to you before any change.",
        "Help you answer a data subject's request within the time you have to answer it.",
        "Delete a person's data, or your whole firm's, on your written request, and tell you when it is done.",
      ]}
      sections={[
        {
          heading: "1. The parties and the roles",
          body: (
            <>
              <p>The firm named on the order (the <strong>controller</strong>) and AlgorithmX Ltd (the <strong>processor</strong>). For the personal data described in section 2 the firm decides why and how it is processed; AlgorithmX processes it on the firm&rsquo;s behalf to provide the courses. For AlgorithmX&rsquo;s own records of the contract, the invoice and the admin&rsquo;s contact details, AlgorithmX is a controller in its own right.</p>
            </>
          ),
        },
        {
          heading: "2. What is processed, about whom, and why",
          body: (
            <>
              <ul>
                <li><strong>Data subjects:</strong> the firm&rsquo;s staff and contractors the admin invites to a seat, and the admin.</li>
                <li><strong>Personal data:</strong> work email address; the name the person signs up with; which modules they have finished and when; the verdict and score of each practice send; their certificate serial, score and dates; for AI Fluent, the prompts they chose to save to their playbook; a record of when they called the AI model, without content.</li>
                <li><strong>Special category data:</strong> none is asked for, and the course stops a send that looks like real personal data of any kind.</li>
                <li><strong>Purpose:</strong> to run the course for the firm: let the person in, grade their practice, show their progress to them and their admin, issue and verify their certificate, and remind them to finish.</li>
                <li><strong>Duration:</strong> for as long as the firm has seats with us and until the firm asks for deletion after that, as section 8 describes.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "3. Our instructions",
          body: (
            <>
              <p>We process the data only on the firm&rsquo;s documented instructions, which are: the terms for firms, this agreement, and the actions the firm&rsquo;s admin takes in the admin console (inviting a person, nudging them, changing the firm profile, exporting the register). If we believe an instruction breaks data protection law we tell the admin before acting on it. We do not process the data for our own purposes, and we never use it to train an AI model.</p>
            </>
          ),
        },
        {
          heading: "4. Confidentiality and security",
          body: (
            <>
              <p>Everyone at AlgorithmX who can see the data is bound by a duty of confidence. The technical and organisational measures are set out on the <Link href="/corporate/security">security page</Link>, which forms part of this agreement: encryption in transit and at rest, a database in London reachable only by the application, staff access through a console that checks a staff flag on every request, secrets held only in the hosting provider&rsquo;s encrypted store, and automated tests on every change before it reaches production. We keep those measures current and may improve them without notice; we do not weaken them without telling the firm.</p>
            </>
          ),
        },
        {
          heading: "5. Sub-processors",
          body: (
            <>
              <p>The firm gives general authorisation for the sub-processors below, each of which is under a written agreement with us that imposes the same obligations this agreement imposes on us. We remain responsible for their performance. We tell every firm&rsquo;s admin by email at least thirty days before adding or replacing a sub-processor; a firm that objects on reasonable data protection grounds may end its seats and have unclaimed seats refunded.</p>
              <ul>
                <li><strong>Vercel Inc.</strong> (USA): hosting and compute for the application, London region. Transfers under the UK Addendum to the EU Standard Contractual Clauses.</li>
                <li><strong>Neon Inc.</strong> (USA): the Postgres database, held in AWS London. Transfers under the UK Addendum to the EU Standard Contractual Clauses.</li>
                <li><strong>Anthropic PBC</strong> (USA): the AI model that grades practice sends and writes the simulator replies. Receives the prompt a learner types, the invented practice documents and the firm&rsquo;s name. Under its commercial terms it does not train on inputs or outputs and may hold them for up to thirty days for trust and safety monitoring. Transfers under its data processing addendum and the UK Addendum.</li>
                <li><strong>Resend Inc.</strong> (USA): transactional email to learners and admins. Receives the recipient address and the content of each email we send.</li>
                <li><strong>Stripe Payments UK Ltd</strong> (UK): card payments, invoices and VAT receipts for the firm&rsquo;s purchase. Stripe is a controller for the card data it collects.</li>
              </ul>
              <p>Sentry (Functional Software Inc., EU region) receives application error reports with no learner content, and is not a sub-processor of learner data.</p>
            </>
          ),
        },
        {
          heading: "6. International transfers",
          body: (
            <>
              <p>The application and the database run in the United Kingdom. Three sub-processors are headquartered in the United States and may access data from there in providing their service; each transfer is covered by the UK International Data Transfer Addendum to the EU Standard Contractual Clauses, or by the UK&rsquo;s adequacy regulations where they apply.</p>
            </>
          ),
        },
        {
          heading: "7. Helping the firm meet its duties",
          body: (
            <>
              <ul>
                <li><strong>Data subject requests:</strong> if a person asks the firm for access to, correction, deletion or a copy of their data, we provide what we hold about that person within ten working days of the admin&rsquo;s written request, so the firm can answer within its own time limit. A person who writes to us directly is pointed to their firm&rsquo;s admin, and the admin is told.</li>
                <li><strong>Security of processing, impact assessments, consultation with the ICO:</strong> we provide the information on the security page and answer the firm&rsquo;s reasonable questions about it within five working days.</li>
                <li><strong>Personal data breach:</strong> if we become aware of a breach affecting the firm&rsquo;s data we tell the admin without undue delay, with what happened, which data and which people are affected as far as we know, what we have done, and a contact, and we update them as we learn more, so the firm can meet its 72-hour duty to the ICO.</li>
                <li><strong>Audit:</strong> on written request, no more than once a year unless a breach has occurred, we provide the information needed to show we comply with this agreement, including the security page, our sub-processor agreements&rsquo; relevant terms, and answers to a reasonable questionnaire. An on-site audit is by agreement and at the firm&rsquo;s cost.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "8. Retention and deletion",
          body: (
            <>
              <p>We keep the data for as long as the firm holds seats with us and after that until the firm asks otherwise, so a renewal picks up where it left off. On the firm&rsquo;s written request, from the admin to <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a>, we delete a named person&rsquo;s account, attempts, playbook and certificate within thirty days, mark their seat on the register as removed, and confirm by email. A request to delete the whole firm is handled the same way and covers every person, the register and the profile. Certificates remain on the public verify page until the firm or the holder asks for their removal, because they exist to be checked by others. We keep only what the law requires us to keep, such as invoice records.</p>
            </>
          ),
        },
        {
          heading: "9. Liability and the rest",
          body: (
            <>
              <p>Liability under this agreement is subject to the limits in the terms for firms. This agreement lasts as long as we process the firm&rsquo;s data, is governed by the law of England and Wales, and is updated by publishing a new version here with its date; a material change that reduces the firm&rsquo;s protection is notified to the admin thirty days before it takes effect.</p>
            </>
          ),
        },
      ]}
    />
  );
}
