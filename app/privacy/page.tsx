import type { Metadata } from "next";
import Link from "next/link";
import { Blank } from "@/app/components/legal/DraftNotice";
import "@/app/components/legal/legal.css";

/**
 * The privacy notice for the whole platform.
 *
 * WHAT IT REPLACED. The old one was written for Cyber Heroes alone: six
 * hundred words addressed to the parent of a six to ten year old. By the
 * time a school read it the platform also ran Cyber Explorers, Cyber Ops,
 * Cyber Pro and two corporate courses, took card payments, sent email and
 * called an AI model, and the notice mentioned none of it. A notice that
 * does not describe the processing is not a notice.
 *
 * EVERY FACT IN HERE WAS READ OUT OF THE CODE, not remembered: the fields
 * are the ones in schema.prisma, the sub-processors are the ones with a
 * runtime call or an env var behind them, the regions are the ones in
 * vercel.json and in the Neon project, and the AI section says adults only
 * because exactly five routes reach Anthropic and all five are adult
 * courses. If any of that changes, this page is part of the change.
 *
 * It is NOT marked as a draft, because a privacy notice is a statement of
 * what we do rather than a contract to be signed, and the statement is
 * true. What it carries instead is a `Blank` wherever a fact belongs to
 * the owner alone: the registered company, the ICO number, the postal
 * address. Those get checked against public registers by the people who
 * read this, so a guess is worse than a gap, and the gaps are what stop
 * the page going live by accident.
 */
export const metadata: Metadata = {
  title: "Privacy notice | AlgorithmX",
  description:
    "What AlgorithmX collects, why, who else sees it, where it is kept and how long for. Written for parents, schools and organisations.",
};

const UPDATED = "13 November 2026";

export default function PrivacyPage() {
  return (
    <main className="axlegal">
      <div className="wrap">
        <p className="back">
          <Link href="/">Back to AlgorithmX</Link>
        </p>

        <h1>Privacy notice</h1>
        <p className="lede">
          What we collect, why, who else sees it, where it is kept and how long we keep it. If you
          are a school, the section on your pupils is the one you want, and the{" "}
          <Link href="/schools/data-protection">school data protection pack</Link> carries the
          processing terms and the sub-processor list in full.
        </p>
        <p className="asof">Last updated {UPDATED}.</p>

        <h2>Who we are</h2>
        <p>
          AlgorithmX is <Blank what="registered company name" />, company number{" "}
          <Blank what="company number" />, registered at <Blank what="registered address" />. We
          are registered with the Information Commissioner&rsquo;s Office under{" "}
          <Blank what="ICO registration number" />.
        </p>
        <p>
          For anything on this page, including a request to see or delete data, write to{" "}
          <a href="mailto:privacy@algorithmx.co.uk">privacy@algorithmx.co.uk</a>.
        </p>

        <h2>Which of us is responsible for what</h2>
        <p>This decides who you ask for what, so it comes first.</p>
        <ul>
          <li>
            <b>A pupil at a school or organisation.</b> The school decides that the pupil will use
            AlgorithmX and what is entered about them, so the school is the data controller. We
            are the processor: we hold the data and act on the school&rsquo;s instructions. A
            parent asking about a pupil account asks the school, and the school asks us.
          </li>
          <li>
            <b>A family account bought directly.</b> The adult who created it is our customer and
            we are the controller. Ask us directly.
          </li>
          <li>
            <b>A learner at a firm</b> on one of the corporate courses. The firm is the
            controller and we are the processor, the same as a school.
          </li>
        </ul>

        <h2>What we hold</h2>
        <h3>Adults with an account</h3>
        <p>
          A name, an email address, and a password we never store in readable form. If you bought
          something, the fact that you did and the reference Stripe gave it. If you are a teacher
          or a manager, which school or organisation you belong to and what you may do in it.
        </p>

        <h3>Pupils at a school</h3>
        <div className="pledge">
          <p>
            <b>A first name, and what they have finished. That is the whole record.</b>
          </p>
          <p>
            No surname, no email address, no date of birth, no photograph, no address, nothing a
            school has not typed in. Pupils sign in with a group code and a short sequence of
            pictures they choose themselves, so there is no email address to collect and no
            password to type. That sequence is stored hashed, the way a password is, and cannot be
            read back by us or by a teacher.
          </p>
        </div>
        <p>Alongside the first name we keep:</p>
        <ul>
          <li>which group they are in, and therefore which course;</li>
          <li>
            progress: which week or topic they have opened, how far through it they are, stars and
            points earned, and when a week was finished;
          </li>
          <li>any certificates earned, which are produced from that progress;</li>
          <li>
            on Cyber Ops, a short callsign the learner chooses (up to fourteen characters) and the
            written findings they file in their own portfolio.
          </li>
        </ul>

        <h3>Family accounts</h3>
        <p>
          The same progress record, plus the child&rsquo;s first name, an optional date of birth
          the parent enters so the course pitches itself correctly, and a favourite colour used to
          theme the screen. The date of birth is optional and the course works without it.
        </p>

        <h2>What we never do</h2>
        <ul>
          <li>
            <b>No advertising.</b> We do not sell or share anyone&rsquo;s data with advertisers,
            run advertising trackers, or build advertising profiles.
          </li>
          <li>
            <b>No contact between learners.</b> There is no chat, no messaging, no comments, no
            friend list and no public profile anywhere on the platform. A learner cannot see
            another learner&rsquo;s account, and nothing a learner types is shown to another
            learner.
          </li>
          <li>
            <b>No uploads from children.</b> Children cannot upload photographs, video or files.
          </li>
          <li>
            <b>No AI on the children&rsquo;s courses.</b> Cyber Heroes, Cyber Explorers and Cyber
            Ops send nothing to any AI model. The tutor and the marking of written answers run
            only on Cyber Pro, which is 18 and over, and on the two corporate courses.
          </li>
          <li>
            <b>No training.</b> Nothing anyone enters is used to train an AI model, by us or by
            anyone we use.
          </li>
        </ul>

        <h2>Why we hold it, and our lawful basis</h2>
        <ul>
          <li>
            <b>To run the course</b> for the person using it: to sign them in, keep their place,
            save their progress and issue their certificate. For a school this is the
            school&rsquo;s instruction to us as its processor. For a family account it is
            performance of our contract with the account holder.
          </li>
          <li>
            <b>To run the licence</b>: how many places a school has bought and spent, which
            courses it runs, who its staff are. Performance of the contract.
          </li>
          <li>
            <b>To take payment</b> and keep the records tax law requires. Contract, and legal
            obligation.
          </li>
          <li>
            <b>To keep the service working</b>: error reports, and a count of how many people
            opened a page. Our legitimate interest in a service that works, balanced by keeping
            both as thin as they can be, as described below.
          </li>
          <li>
            <b>To answer you</b> when you write to us or send an enquiry from the schools page.
            Legitimate interest.
          </li>
        </ul>

        <h2>Who else sees it</h2>
        <p>
          Only the companies below, each doing one job under a contract that holds them to it.
          There are no others, and we do not add one without changing this table.
        </p>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Who</th>
                <th>What for</th>
                <th>Where</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Vercel</b>
                  <small>Hosting</small>
                </td>
                <td>
                  Runs the website. Everything passes through it in transit, and its server logs
                  hold request data briefly.
                  <small>Also counts page views, without cookies and without identifying anyone.</small>
                </td>
                <td>London</td>
              </tr>
              <tr>
                <td>
                  <b>Neon</b>
                  <small>Database</small>
                </td>
                <td>Stores everything described above.</td>
                <td>AWS London</td>
              </tr>
              <tr>
                <td>
                  <b>Resend</b>
                  <small>Email</small>
                </td>
                <td>
                  Sends email to adults: invitations, password resets, receipts, enquiry
                  notifications. Nothing is ever emailed to a pupil account.
                </td>
                <td>United States</td>
              </tr>
              <tr>
                <td>
                  <b>Stripe</b>
                  <small>Payments</small>
                </td>
                <td>
                  Takes card payments from adults. Card details go to Stripe directly and never
                  reach our servers.
                </td>
                <td>United States, EU</td>
              </tr>
              <tr>
                <td>
                  <b>Sentry</b>
                  <small>Error reporting</small>
                </td>
                <td>
                  Tells us when something breaks. Set to send no personal data, with a scrubber
                  that strips request bodies, cookies and anything typed on a private page before
                  the report leaves the browser or the server.
                </td>
                <td>European Union</td>
              </tr>
              <tr>
                <td>
                  <b>Anthropic</b>
                  <small>AI, adult courses only</small>
                </td>
                <td>
                  Powers the tutor and the marking of written answers on Cyber Pro (18+) and the
                  corporate courses. It receives the question or answer that adult learner typed.
                  No children&rsquo;s course calls it.
                </td>
                <td>United States</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Where a company above operates outside the UK, the transfer is made under the UK Addendum
          to the European Commission&rsquo;s standard contractual clauses, or another mechanism UK
          data protection law permits.
        </p>

        <h2>Where it is kept</h2>
        <p>
          Accounts, progress and licences live in a database in <b>London</b>, and the site runs in
          Vercel&rsquo;s London region. Error reports go to Sentry in the European Union. The
          exceptions are the three services above that operate from the United States.
        </p>

        <h2>How long we keep it</h2>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>What</th>
                <th>Kept for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A pupil account and its progress</td>
                <td>
                  Until the school deletes the pupil or asks us to. Deleting a pupil deletes the
                  account and the progress with it.
                </td>
              </tr>
              <tr>
                <td>A family account</td>
                <td>Until you ask us to delete it.</td>
              </tr>
              <tr>
                <td>The record that a licence place was used</td>
                <td>
                  Kept after a pupil is deleted, with no pupil attached to it. It is a count
                  against the school&rsquo;s licence and holds no personal data once the child is
                  gone.
                </td>
              </tr>
              <tr>
                <td>Payment and invoice records</td>
                <td>Six years, because tax law requires it. Held by us and by Stripe.</td>
              </tr>
              <tr>
                <td>Enquiries sent from the schools page</td>
                <td>
                  <Blank what="retention period to confirm" /> after we have answered.
                </td>
              </tr>
              <tr>
                <td>Error reports</td>
                <td>Ninety days, by Sentry&rsquo;s own retention.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Cookies and what the browser keeps</h2>
        <p>We set no advertising or tracking cookies. What is set:</p>
        <ul>
          <li>
            <b>A sign-in cookie</b>, so you stay signed in. Necessary for the service to work.
          </li>
          <li>
            <b>A pre-launch cookie</b>, while the site sits behind a password before launch. It
            records nothing but the fact that the password was entered.
          </li>
          <li>
            <b>Local storage in the browser</b>, to remember where a learner had got to in a
            lesson and small preferences such as whether sound is muted. It stays on that device.
          </li>
        </ul>
        <p>
          Page views are counted by our host without cookies and without identifying the visitor.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask for a copy of what we hold, ask us to correct it, ask us to delete it, ask
          for it in a portable form, or object to our processing it. We answer within one month.
        </p>
        <p>
          <b>If the data is a pupil&rsquo;s, ask the school.</b> The school is the controller, and
          it can act on most of this itself: a teacher can correct a name, clear a forgotten
          picture password, or delete a pupil and their progress. Where the school needs us, we
          help.
        </p>
        <p>
          If you are unhappy with how we have handled something, you can complain to the
          Information Commissioner&rsquo;s Office at <a href="https://ico.org.uk">ico.org.uk</a>.
          We would rather you told us first.
        </p>

        <h2>If something goes wrong</h2>
        <p>
          If personal data is lost or exposed, we tell the school or organisation whose data it is
          without undue delay, and tell the ICO and the people affected where the law requires it.
        </p>

        <h2>Changes</h2>
        <p>
          When we change what we do with data we change this page and the date at the top. A
          material change to a school&rsquo;s processing is told to the school, not just posted
          here.
        </p>

        <footer className="note">
          Related: <Link href="/safeguarding">how we keep children safe</Link> &middot;{" "}
          <Link href="/schools/data-protection">the school data protection pack</Link> &middot;{" "}
          <Link href="/terms">terms</Link>
        </footer>
      </div>
    </main>
  );
}
