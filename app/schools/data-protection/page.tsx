import type { Metadata } from "next";
import Link from "next/link";
import { Blank, DraftBanner } from "@/app/components/legal/DraftNotice";
import "@/app/components/legal/legal.css";

/**
 * The pack a school&rsquo;s data protection officer asks for.
 *
 * WHAT A SCHOOL ACTUALLY ASKS, in roughly this order: who is the
 * controller, what exactly do you hold about our children, who else
 * touches it, where is it, how is it protected, how long do you keep it,
 * what do you do when we get a subject access request, and what happens at
 * the end. Until now the answer to every one of those was an email from
 * the owner. This is the answer written once.
 *
 * IT IS CONTRACTUAL, so it carries the draft banner and must not be linked
 * from a sales page until a solicitor has been over it. The privacy notice
 * next door is a statement of fact and needs no such hold; these are
 * terms, and terms get signed.
 *
 * The facts are read out of the system, not drafted from a template: the
 * data categories are the fields in schema.prisma, the sub-processors are
 * the ones with a runtime call behind them, and the security measures are
 * things a reader could verify. Where something is genuinely the
 * owner&rsquo;s to decide, such as how long an enquiry is kept or whether
 * there has been a penetration test, it is a blank rather than a
 * comfortable sentence.
 */
export const metadata: Metadata = {
  title: "School data protection pack | AlgorithmX",
  description:
    "Processor terms, sub-processors, security measures, retention and breach handling for schools using AlgorithmX.",
  /* Out of the index while it is a draft. Unreviewed contractual terms
     turning up in a search result, in front of the exact person who knows
     how to read them, is the worst way for a school to meet us. Remove
     this once the solicitor has signed it off. */
  robots: { index: false, follow: false },
};

const UPDATED = "13 November 2026";

export default function SchoolDataProtectionPage() {
  return (
    <main className="axlegal">
      <div className="wrap">
        <p className="back">
          <Link href="/schools">Back to AlgorithmX for schools</Link>
        </p>

        <h1>School data protection pack</h1>
        <p className="lede">
          The processing terms between a school and AlgorithmX, the full list of who else touches
          the data, how it is protected, how long it is kept, and what happens when you ask for it
          back. Written to be printed and put in front of a data protection officer.
        </p>
        <p className="asof">Last updated {UPDATED}.</p>

        <DraftBanner>
          These are contractual terms and have not yet been reviewed by a solicitor. Do not rely
          on them, and do not send them to a school, until that review is done and this banner is
          gone.
        </DraftBanner>

        <h2>1. Who is who</h2>
        <p>
          The <b>school</b> is the data controller for its pupils and staff. It decides that its
          pupils will use AlgorithmX, and what is entered about them.
        </p>
        <p>
          <b>AlgorithmX</b> (<Blank what="registered company name" />, company number{" "}
          <Blank what="company number" />) is the data processor. We hold the data and act on the
          school&rsquo;s documented instructions, which are these terms plus whatever the school
          does in its own portal.
        </p>
        <p>
          These terms are the Article 28 terms required by UK GDPR and form part of the agreement
          between us.
        </p>

        <h2>2. What the processing is</h2>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Answer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Subject matter</b>
                </td>
                <td>Running online cyber security lessons for the school&rsquo;s pupils.</td>
              </tr>
              <tr>
                <td>
                  <b>Duration</b>
                </td>
                <td>
                  For as long as the school holds a licence, plus the short period described in
                  section 7.
                </td>
              </tr>
              <tr>
                <td>
                  <b>Nature and purpose</b>
                </td>
                <td>
                  Creating pupil accounts, signing pupils in, recording what each has completed,
                  showing that to their teacher, issuing certificates, and counting licence places.
                </td>
              </tr>
              <tr>
                <td>
                  <b>Types of personal data</b>
                </td>
                <td>
                  Pupils: first name, group, course, lesson progress, points and completion dates,
                  a hashed picture sign-in sequence, certificates earned, and on Cyber Ops a
                  self-chosen callsign and written findings.
                  <small>
                    No surname, no email address, no date of birth, no photograph, no address.
                  </small>
                  Staff: name, email address, role in the school, and a hashed password.
                </td>
              </tr>
              <tr>
                <td>
                  <b>Categories of data subject</b>
                </td>
                <td>The school&rsquo;s pupils, and the school staff who run the groups.</td>
              </tr>
              <tr>
                <td>
                  <b>Special category data</b>
                </td>
                <td>
                  None. We do not ask for or hold health, ethnicity, religion, SEN status or any
                  other special category data about a pupil.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>3. What we undertake</h2>
        <ul>
          <li>
            To process personal data only on the school&rsquo;s documented instructions, including
            on transfers, unless the law requires otherwise, in which case we tell the school
            first unless the law forbids that too.
          </li>
          <li>
            To make sure everyone we allow near the data is under a duty of confidence.
          </li>
          <li>To apply the security measures in section 4.</li>
          <li>To use sub-processors only as set out in section 5.</li>
          <li>
            To help the school meet its own obligations: answering data subject requests, data
            protection impact assessments, and consultations with the regulator.
          </li>
          <li>
            To tell the school without undue delay if personal data is lost or exposed, and to
            help it tell the regulator and the people affected.
          </li>
          <li>To delete or return the data at the end, as section 7 describes.</li>
          <li>
            To give the school the information it needs to show all of this, and to allow an audit
            as section 8 describes.
          </li>
        </ul>

        <h2>4. How the data is protected</h2>
        <p>What is true of the system today:</p>
        <ul>
          <li>
            <b>Everything is encrypted in transit.</b> The site is served over HTTPS only.
          </li>
          <li>
            <b>No password is stored in readable form</b>, including a pupil&rsquo;s picture
            sequence, which is hashed the same way an adult&rsquo;s password is and cannot be read
            back by us or by a teacher.
          </li>
          <li>
            <b>One school cannot see another.</b> Every query that reads pupil data is restricted
            to the school of the person asking, in the query itself rather than by a check
            afterwards. A group identifier belonging to another school returns nothing.
          </li>
          <li>
            <b>Teachers can read pupil progress and cannot change it.</b> Progress is written by
            the pupil playing the lesson.
          </li>
          <li>
            <b>Our staff console cannot open a named child&rsquo;s progress.</b> It shows schools,
            groups and counts. Access is limited to named AlgorithmX staff accounts.
          </li>
          <li>
            <b>Card details never reach us.</b> Payments are taken by Stripe directly.
          </li>
          <li>
            <b>Error reports carry no personal data.</b> Request bodies, cookies and anything
            typed on a private page are stripped before a report leaves the browser or the server.
          </li>
          <li>
            <b>The data lives in the United Kingdom</b>, in a managed Postgres database in London,
            reached only by the application and by named staff.
          </li>
        </ul>
        <p>
          <Blank what="owner to add: backup frequency and restore testing, penetration testing, any certification such as Cyber Essentials, and the staff vetting position" />
        </p>

        <h2>5. Sub-processors</h2>
        <p>
          These are the only companies that touch the data, each doing one job under a contract
          that holds them to it.
        </p>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Sub-processor</th>
                <th>Job</th>
                <th>Location</th>
                <th>Pupil data?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Vercel</b>
                </td>
                <td>Hosting, delivery, and a cookieless count of page views</td>
                <td>London</td>
                <td>In transit, and briefly in server logs</td>
              </tr>
              <tr>
                <td>
                  <b>Neon</b>
                </td>
                <td>The database</td>
                <td>AWS London</td>
                <td>Yes, at rest</td>
              </tr>
              <tr>
                <td>
                  <b>Resend</b>
                </td>
                <td>Email to staff: invitations, password resets, notifications</td>
                <td>United States</td>
                <td>No. Pupils are never emailed</td>
              </tr>
              <tr>
                <td>
                  <b>Stripe</b>
                </td>
                <td>Card payments, where a school pays by card rather than invoice</td>
                <td>United States, EU</td>
                <td>No. Buyer details only</td>
              </tr>
              <tr>
                <td>
                  <b>Sentry</b>
                </td>
                <td>Error reporting</td>
                <td>European Union</td>
                <td>No, by configuration</td>
              </tr>
              <tr>
                <td>
                  <b>Anthropic</b>
                </td>
                <td>AI tutor and marking, on the adult courses only</td>
                <td>United States</td>
                <td>
                  No. Not called by Cyber Heroes, Cyber Explorers or Cyber Ops
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          We will give the school <Blank what="notice period, commonly 30 days" /> written notice
          before adding or replacing a sub-processor, and the school may object on reasonable data
          protection grounds.
        </p>
        <p>
          Where a sub-processor operates outside the UK, the transfer is made under the UK Addendum
          to the European Commission&rsquo;s standard contractual clauses, or another mechanism UK
          data protection law permits.
        </p>

        <h2>6. How long it is kept</h2>
        <ul>
          <li>
            <b>A pupil account and its progress</b>: until the school deletes the pupil, or until
            section 7 applies. Deleting a pupil deletes the account and the progress with it,
            immediately.
          </li>
          <li>
            <b>A group whose year has ended</b>: kept so the school can still see last
            year&rsquo;s work. Nobody in it can sign in.
          </li>
          <li>
            <b>The record that a licence place was used</b>: kept after a pupil is deleted, with
            no pupil attached. It holds no personal data once the child is gone.
          </li>
          <li>
            <b>Invoices and payment records</b>: six years, as tax law requires.
          </li>
        </ul>

        <h2>7. At the end</h2>
        <p>
          When the licence ends, the school tells us whether it wants the data deleted or returned.
          We act within <Blank what="period to commit to, commonly 30 days" /> of that instruction,
          and delete it in any case within{" "}
          <Blank what="backstop period, commonly 90 days" /> of the licence ending unless the
          school has asked us to keep it. Backups age out on their own cycle. Anything the law
          requires us to keep, such as invoices, we keep and nothing more.
        </p>

        <h2>8. Audit</h2>
        <p>
          We will answer a school&rsquo;s reasonable written questions about this processing, and
          provide the records needed to show we are meeting these terms. Where a school needs more
          than that, we will agree a time and a scope, no more than once a year unless the
          regulator or an incident requires otherwise.
        </p>

        <h2>9. Subject access requests</h2>
        <p>
          Requests come to the school, because the school is the controller. Most of it the school
          can do itself in its own portal: see a pupil&rsquo;s progress, correct a name, delete a
          pupil and their work. Where the school needs the rest, write to{" "}
          <a href="mailto:privacy@algorithmx.co.uk">privacy@algorithmx.co.uk</a> and we will
          provide it within <Blank what="period to commit to, commonly 14 days" />, in good time
          for the school&rsquo;s own one month deadline.
        </p>

        <h2>10. If something goes wrong</h2>
        <p>
          We tell the school without undue delay, with what we know, what we are doing and who is
          affected, and we keep telling it as we learn more. We do not wait until we have the whole
          picture.
        </p>

        <footer className="note">
          Related: <Link href="/privacy">privacy notice</Link> &middot;{" "}
          <Link href="/safeguarding">safeguarding</Link> &middot;{" "}
          <Link href="/terms">terms</Link>
          <br />
          Questions: <a href="mailto:privacy@algorithmx.co.uk">privacy@algorithmx.co.uk</a>
        </footer>
      </div>
    </main>
  );
}
