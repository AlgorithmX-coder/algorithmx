import type { Metadata } from "next";
import Link from "next/link";
import CorporateSubpage from "../CorporateSubpage";
import { DraftBanner, SolicitorNote } from "../SolicitorNote";

/**
 * /corporate/dpa - the data processing agreement between a firm (the
 * controller) and AlgorithmX (the processor) for Cyber Secured.
 * DRAFT: written for the solicitor's review and held on this branch until
 * the reviewed text replaces it. Article 28 UK GDPR is the spine.
 *
 * The data inventory and the sub-processor list were checked against the
 * code on 2026-11-10 (prisma/schema.prisma, the /api/ai-cleared and
 * /api/ai-fluent routes, app/lib/anthropicClient.ts, the Sentry configs,
 * vercel.json and the env var names). Where the code keeps something for
 * longer than the text below would suggest, the text says what the code
 * does and a FOR THE SOLICITOR note flags it.
 */
export const metadata: Metadata = {
  title: "Data processing agreement | Cyber Secured by AlgorithmX",
  description: "How AlgorithmX processes a firm's people's data to run Cyber Secured: what, why, where, through whom, for how long, and how it is deleted on request.",
  alternates: { canonical: "https://algorithmx.io/corporate/dpa" },
  robots: { index: false },
};

export default function CorporateDpaPage() {
  return (
    <CorporateSubpage
      eyebrow="// Data processing agreement · firms · DRAFT"
      title={<>How we process your people&rsquo;s data, <span className="corp-sub-grad">and nothing more.</span></>}
      lede="This agreement forms part of the terms for firms. The firm is the controller of its people's personal data; AlgorithmX Ltd is the processor, and processes that data only to run Cyber Secured for the firm. It is written to meet Article 28 of UK GDPR and to be read without a lawyer, although your own advice governs."
      asOf="10 November 2026 (draft)"
      mapsHeading="// What this agreement commits us to"
      maps={[
        "Process only on your instructions, which are these terms and what your admin does in the console.",
        "Named sub-processors, each under written terms; notice to you before any change.",
        "Practice chats are not stored: we keep progress and scores, never what a person typed, except a prompt they choose to save to their own playbook.",
        "Delete a person's data, or your whole firm's, on your written request, and tell you when it is done.",
      ]}
      sections={[
        {
          heading: "1. The parties and the roles",
          body: (
            <>
              <DraftBanner>This page is a draft for legal review. The data inventory and the sub-processor list describe the system as it runs on 10 November 2026. Each note marked &ldquo;FOR THE SOLICITOR&rdquo; is a decision still to be made, and is removed when the reviewed text replaces this draft.</DraftBanner>
              <p>The firm named on the order (the <strong>controller</strong>) and AlgorithmX Ltd (the <strong>processor</strong>). For the personal data described in section 2 the firm decides why and how it is processed; AlgorithmX processes it on the firm&rsquo;s behalf to provide Cyber Secured. For AlgorithmX&rsquo;s own records of the contract, the payment and the admin&rsquo;s contact details, AlgorithmX is a controller in its own right.</p>
              <SolicitorNote>Confirm the roles. In particular: a learner&rsquo;s account (email, name, password) is not owned by the firm and survives the firm&rsquo;s deletion, because the same person may hold courses of their own; decide whether AlgorithmX is controller of the account itself and processor only of the course data.</SolicitorNote>
            </>
          ),
        },
        {
          heading: "2. What is processed, about whom, and why",
          body: (
            <>
              <ul>
                <li><strong>Data subjects:</strong> the firm&rsquo;s staff and contractors the admin invites to a seat, the admin and any manager, and the contact the firm names for AI questions.</li>
                <li><strong>Account:</strong> work email address; the name the person signs up with; a one-way (bcrypt) hash of their password; accessibility settings they choose (for example reduced motion).</li>
                <li><strong>Seat and team:</strong> the address the seat was sent to, their team and desk (the job area they pick, which sets the practice documents), their role, and the dates they were invited and claimed the seat.</li>
                <li><strong>Progress:</strong> for each course and each module, where they are, their quiz score, their best practice verdict, and the dates they started and finished; when they were last active.</li>
                <li><strong>Practice results:</strong> for each practice send in AI Cleared and AI Fluent, the verdict and score, how many items of each data class it contained, and whether it was halted. Never the text they typed and never the reply.</li>
                <li><strong>Playbook (AI Fluent only):</strong> a prompt the person chooses to save, with the tool it is for and their own notes on when to use it. Private to that person; the admin never sees it.</li>
                <li><strong>Model call record:</strong> for each call to the AI model on the person&rsquo;s behalf, who, which course, which kind of call and when, used to enforce the daily allowance. Never the content.</li>
                <li><strong>Firm profile:</strong> the firm&rsquo;s name and sector, the name and role of the person staff should ask about AI, its approved tools and its names for its data classes.</li>
                <li><strong>Older certificates:</strong> for a person who earned one before Cyber Secured replaced the separate courses, its serial, score and dates. No new certificate is issued.</li>
                <li><strong>Not processed:</strong> special category data is never asked for, and the course halts a practice send that looks like real personal data. Card details go to Stripe, never to us.</li>
                <li><strong>Purpose:</strong> to run Cyber Secured for the firm: let the person in, grade their practice, show their progress to them and on the firm&rsquo;s team register, and send invites and reminders.</li>
                <li><strong>Duration:</strong> for as long as the firm has seats with us and until the firm asks for deletion after that, as section 8 describes.</li>
              </ul>
              <p><strong>What a practice chat is, and is not:</strong> when a person writes to the simulated AI tool in AI Cleared or AI Fluent, their text (and, in AI Fluent, the earlier turns of that same practice) is sent to the AI model provider to grade it and to write the reply. The reply is shown and the text is then discarded; it is not written to our database. Cyber Awareness does not use the AI model.</p>
            </>
          ),
        },
        {
          heading: "3. Our instructions",
          body: (
            <>
              <p>We process the data only on the firm&rsquo;s documented instructions, which are: the terms for firms, this agreement, and the actions the firm&rsquo;s admin takes in the admin console (inviting a person, removing an unclaimed invite, sending reminders, changing the firm profile, downloading the register). If we believe an instruction breaks data protection law we tell the admin before acting on it. We do not process the data for our own purposes, and we never use it to train an AI model.</p>
            </>
          ),
        },
        {
          heading: "4. Confidentiality and security",
          body: (
            <>
              <p>Everyone at AlgorithmX who can see the data is bound by a duty of confidence. The technical and organisational measures are set out on the <Link href="/corporate/security">security page</Link>, which forms part of this agreement: encryption in transit and at rest, a database in London reachable only by the application, staff access through a console that checks a staff flag on every request, secrets held only in the hosting provider&rsquo;s encrypted store, and automated tests on every change before it reaches production. We keep those measures current and may improve them without notice; we do not weaken them without telling the firm.</p>
              <SolicitorNote>The security page still describes the earlier products in places (it mentions certificates and &ldquo;five sub-processors&rdquo;). It will be brought into line with this agreement before both are published; confirm whether it should form part of the agreement or sit outside it as a description.</SolicitorNote>
            </>
          ),
        },
        {
          heading: "5. Sub-processors",
          body: (
            <>
              <p>The firm gives general authorisation for the sub-processors below, each of which is under a written agreement with us that imposes data protection obligations no less protective than this agreement. We remain responsible for their performance.</p>
              <ul>
                <li><strong>Vercel Inc.</strong> (USA): hosting and serverless compute for the application, run in the London region; also counts page views with its cookieless analytics, which identifies nobody.</li>
                <li><strong>Neon Inc.</strong> (USA): the Postgres database, hosted in AWS London (eu-west-2). Holds everything in section 2.</li>
                <li><strong>Anthropic PBC</strong> (USA): the AI model that grades practice sends and writes the simulated replies in AI Cleared and AI Fluent. Receives the text a learner types in a practice (in AI Fluent, with the earlier turns of that practice), the invented practice documents, the firm&rsquo;s name, its names for its data classes and the name of the tool being simulated. It does not receive the learner&rsquo;s name or email. Under its commercial terms it does not train on inputs or outputs, and may hold them for a limited period for trust and safety.</li>
                <li><strong>Resend Inc.</strong> (USA): transactional email: seat invites, the admin&rsquo;s welcome and seats-added emails, the reminders an admin sends, and password reset links. Receives the recipient&rsquo;s address and the content of each email.</li>
                <li><strong>Stripe Payments UK Ltd</strong> (UK): card payments, invoices and VAT for the firm&rsquo;s purchase. Receives the admin&rsquo;s email, the billing name and address, and the firm&rsquo;s VAT number if given. Stripe is a controller for the card data it collects.</li>
                <li><strong>Functional Software Inc., trading as Sentry</strong> (USA; data held in its EU region, Frankfurt): application error reports. A report carries the page address, the browser and the error, and, for an error on our servers, can carry details of the request being handled when it happened.</li>
              </ul>
              <SolicitorNote>Decide the notice period for adding or replacing a sub-processor, and the firm&rsquo;s remedy if it objects. The earlier draft proposed thirty days&rsquo; email notice to every admin, and a firm that objects on reasonable data protection grounds may end its seats with unclaimed seats refunded.</SolicitorNote>
              <SolicitorNote>Confirm Anthropic&rsquo;s current retention period under its commercial terms and data processing addendum (the security page says up to thirty days), or decide to request zero data retention from Anthropic and say so here.</SolicitorNote>
              <SolicitorNote>Decide whether Sentry and the page-view analytics belong in this list. We list Sentry because its default settings can attach request details, which may include what a learner typed, to a server error report. Vercel&rsquo;s analytics is listed with Vercel. The site can also load Plausible analytics (Plausible Insights OU, Estonia, cookieless) when it is switched on in the hosting settings; the owner to confirm whether it is on in production, and whether it is listed.</SolicitorNote>
              <SolicitorNote>Confirm which Stripe entity the account contracts with, and whether Stripe is a sub-processor for the invoice and VAT data or an independent controller throughout.</SolicitorNote>
            </>
          ),
        },
        {
          heading: "6. International transfers",
          body: (
            <>
              <p>The application and the database run in the United Kingdom, and error reports are held in the European Union. The AI model request to Anthropic is processed in the United States. Vercel, Neon, Anthropic, Resend and Sentry are headquartered in the United States and may access data from there in providing their service; each transfer is covered by the UK International Data Transfer Addendum to the EU Standard Contractual Clauses, by the UK Extension to the EU-US Data Privacy Framework where the provider is certified, or by the UK&rsquo;s adequacy regulations where they apply.</p>
              <SolicitorNote>Confirm the transfer mechanism for each of the five US providers against its current data processing addendum, and whether a transfer risk assessment is needed for Anthropic.</SolicitorNote>
            </>
          ),
        },
        {
          heading: "7. Helping the firm meet its duties",
          body: (
            <>
              <ul>
                <li><strong>Data subject requests:</strong> if a person asks the firm for access to, correction, deletion or a copy of their data, we provide what we hold about that person after the admin&rsquo;s written request, so the firm can answer within its own time limit. A person who writes to us directly is pointed to their firm&rsquo;s admin, and the admin is told.</li>
                <li><strong>Security of processing, impact assessments, consultation with the ICO:</strong> we provide the information on the security page and answer the firm&rsquo;s reasonable questions about it.</li>
                <li><strong>Personal data breach:</strong> if we become aware of a breach affecting the firm&rsquo;s data we tell the admin without undue delay, with what happened, which data and which people are affected as far as we know, what we have done, and a contact, and we update them as we learn more, so the firm can meet its 72-hour duty to the ICO.</li>
                <li><strong>Audit:</strong> on written request, no more than once a year unless a breach has occurred, we provide the information needed to show we comply with this agreement, including the security page, the relevant terms of our sub-processor agreements, and answers to a reasonable questionnaire. An on-site audit is by agreement and at the firm&rsquo;s cost.</li>
              </ul>
              <SolicitorNote>Decide the response times. The earlier draft proposed ten working days to provide a person&rsquo;s data after the admin&rsquo;s request, and five working days to answer security questions. There is no self-service export of one person&rsquo;s data today; the admin&rsquo;s register CSV covers progress only, so a full access request is answered by AlgorithmX staff by hand.</SolicitorNote>
              <SolicitorNote>Confirm the breach notice wording (for example a fixed outer limit such as 48 hours, in addition to &ldquo;without undue delay&rdquo;) and the audit frequency and cost.</SolicitorNote>
            </>
          ),
        },
        {
          heading: "8. Retention and deletion",
          body: (
            <>
              <p>What the system does today:</p>
              <ul>
                <li><strong>No automatic deletion.</strong> Accounts, seats, progress, practice results, playbooks and the firm profile are kept for as long as the firm holds seats with us and after that until the firm asks otherwise, so a renewal picks up where it left off. Nothing is deleted on a timer when the seats&rsquo; year ends.</li>
                <li><strong>Deleting one person:</strong> on the firm&rsquo;s written request, from the admin to <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a>, we delete the person&rsquo;s account and with it their progress, practice results, playbook and any certificate, mark their seat on the register as &ldquo;removed at the person&rsquo;s request&rdquo; (the seat stays counted as used), and confirm by email.</li>
                <li><strong>Deleting the whole firm:</strong> on the firm&rsquo;s written request we close its access and then delete the firm, its profile, seats, purchase records held by us, and every person&rsquo;s progress, practice results, playbook and certificates at that firm. A learner&rsquo;s own account (email, name, password) is kept, because the same person may hold courses of their own; on request we delete it too.</li>
                <li><strong>Model call records</strong> (who called the model, for which course and when, never the content) are kept with no expiry today and are not removed when a person&rsquo;s account is deleted; once the account is gone they no longer link to a name or email.</li>
                <li><strong>Practice chats</strong> are not stored by us at all; Anthropic&rsquo;s retention is described in section 5.</li>
                <li><strong>Copies held elsewhere:</strong> Stripe keeps payment and invoice records, Resend keeps a log of each email sent, Sentry keeps error reports, and the database provider keeps point-in-time recovery history, each for its own period. We keep only what the law requires us to keep, such as invoice records.</li>
              </ul>
              <SolicitorNote>Decide the retention periods. The system implements none today (no deletion on a timer, for any data). Decide: how long after the last seat ends the firm&rsquo;s data is kept before it is deleted unprompted; how long model call records are kept (the code was designed to need only the last 24 hours); and how long older certificates stay checkable. Each period chosen has to be built before it is promised.</SolicitorNote>
              <SolicitorNote>Decide the deletion deadline (the earlier draft said thirty days from the written request) and how backups are treated: deleted data remains in the database provider&rsquo;s recovery history until that history rolls over.</SolicitorNote>
            </>
          ),
        },
        {
          heading: "9. Liability and the rest",
          body: (
            <>
              <p>Liability under this agreement is subject to the limits in the terms for firms. This agreement lasts as long as we process the firm&rsquo;s data, is governed by the law of England and Wales, and is updated by publishing a new version here with its date; a material change that reduces the firm&rsquo;s protection is notified to the admin before it takes effect.</p>
              <SolicitorNote>Decide whether data protection liability sits inside the general cap in the terms for firms or under a separate cap, and the notice period for a material change to this agreement (the earlier draft said thirty days).</SolicitorNote>
            </>
          ),
        },
      ]}
    />
  );
}
