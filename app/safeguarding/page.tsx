import type { Metadata } from "next";
import Link from "next/link";
import { Blank } from "@/app/components/legal/DraftNotice";
import "@/app/components/legal/legal.css";

/**
 * The safeguarding statement, written for a designated safeguarding lead.
 *
 * WHY IT EXISTS. A school buying anything a child signs into asks for this
 * before it asks about price, and we had nothing. Worse, the honest answer
 * was spread across the codebase as design decisions nobody outside could
 * see: no messaging models in the schema, first names only, hashed picture
 * passwords, a staff console that deliberately cannot open a named
 * child&rsquo;s progress. All of that is a safeguarding posture; it just
 * had never been written down.
 *
 * EVERY CLAIM IS CHECKABLE IN THE PRODUCT. The absence of chat is the
 * absence of a table. The first-name rule is the shape of ChildProfile.
 * The staff limit is a real limit in /admin. Nothing here is aspiration,
 * because a DSL who finds one soft claim stops believing the rest.
 *
 * The one thing it does not do is speak for the school. A school&rsquo;s
 * own policy, its DSL and its reporting route are the school&rsquo;s, and
 * this says where ours stops and theirs begins.
 */
export const metadata: Metadata = {
  title: "Safeguarding | AlgorithmX",
  description:
    "How AlgorithmX is built to keep children safe: no messaging, no uploads, first names only, and what a school controls.",
};

const UPDATED = "13 November 2026";

export default function SafeguardingPage() {
  return (
    <main className="axlegal">
      <div className="wrap">
        <p className="back">
          <Link href="/schools">Back to AlgorithmX for schools</Link>
        </p>

        <h1>Safeguarding</h1>
        <p className="lede">
          Written for a designated safeguarding lead. It says what the platform does, what it
          cannot do by design, what the school controls, and where to send a concern.
        </p>
        <p className="asof">Last updated {UPDATED}.</p>

        <h2>The short version</h2>
        <div className="pledge">
          <p>
            <b>A child cannot be contacted through AlgorithmX. By anyone.</b>
          </p>
          <p>
            There is no chat, no messaging, no comments, no friend list, no public profile and no
            way to search for another learner. These are not features we have turned off. They do
            not exist in the product, which is why they cannot be turned on by a setting, a
            mistake or an update.
          </p>
        </div>

        <h2>Who the courses are for</h2>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Ages</th>
                <th>What it covers</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Cyber Heroes</b>
                </td>
                <td>6 to 9</td>
                <td>
                  Passwords, private information, who to trust online, scams, kindness online.
                </td>
              </tr>
              <tr>
                <td>
                  <b>Cyber Explorers</b>
                </td>
                <td>10 to 13</td>
                <td>Investigating real-looking incidents: phishing, fake accounts, pressure online.</td>
              </tr>
              <tr>
                <td>
                  <b>Cyber Ops</b>
                </td>
                <td>14 to 17</td>
                <td>
                  Defensive security practice on simulated systems. Nothing on it reaches a real
                  computer belonging to anybody.
                </td>
              </tr>
              <tr>
                <td>
                  <b>Cyber Pro</b>
                </td>
                <td>18 and over</td>
                <td>Career-level security training. Not sold to schools for pupils.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>What a child can and cannot do</h2>
        <ul>
          <li>
            <b>They sign in with a group code and three pictures they choose</b>, not an email
            address and not a typed password. Nothing in a lesson asks a child to say, write or
            type a password in front of anybody.
          </li>
          <li>
            <b>They are a first name.</b> No surname, no email, no photograph. A pupil
            account&rsquo;s internal address cannot receive mail, so a pupil cannot be emailed,
            by us or by anyone.
          </li>
          <li>
            <b>They cannot upload anything.</b> No photographs, no video, no files.
          </li>
          <li>
            <b>They type almost nothing.</b> Lessons are played by choosing and tapping. The
            exception is Cyber Ops, for 14 to 17s, where a learner picks a short callsign and
            writes up findings in their own portfolio. That text is theirs and their
            teacher&rsquo;s; no other learner can see it.
          </li>
        </ul>

        <h2>What the school controls</h2>
        <p>
          Everything about who is in a group, from the school&rsquo;s own portal, without asking
          us:
        </p>
        <ul>
          <li>add and remove pupils, and remove a pupil deletes their account and their work;</li>
          <li>clear a forgotten picture password so a child can choose again;</li>
          <li>end a group&rsquo;s year, which stops everyone in it signing in that same minute;</li>
          <li>see how a pupil is getting on, and nothing that lets a teacher change their work.</li>
        </ul>
        <p>
          Each school also gives us a safeguarding contact when it is set up, so we know who to
          write to if we ever need to.
        </p>

        <h2>What our own staff can see</h2>
        <p>
          Our staff console shows a school, its groups, how many pupils are in them and how many
          licence places are spent. <b>It has no route to a named child&rsquo;s progress</b>,
          deliberately: that belongs to their teacher. Access to the console is limited to named
          AlgorithmX staff accounts.
        </p>
        <p>
          <Blank what="owner to state the staff vetting position, for example whether staff who may access pupil data are DBS checked" />
        </p>

        <h2>Disclosures, and what we cannot see</h2>
        <p>
          <b>A child has no way to send us a message</b>, so the platform cannot receive a
          disclosure and must never be relied on as a route for one. If something a child writes
          in Cyber Ops gives a teacher cause for concern, it is visible to that teacher in the
          school&rsquo;s own portal, and the school&rsquo;s safeguarding procedure applies exactly
          as it would to anything else a pupil wrote at school.
        </p>

        <h2>Lessons that touch difficult ground</h2>
        <p>
          The courses teach children to recognise pressure, manipulation and people who are not
          who they say they are. That is the subject. Two decisions follow from it:
        </p>
        <ul>
          <li>
            <b>We name no helpline and no number.</b> Where a lesson tells a child that help
            exists, it teaches the idea of a child line service: free, at any hour, and you do not
            have to tell anyone you are calling. <b>The number is the school&rsquo;s to supply</b>,
            because only the school knows which country it is in, and a wrong number in a
            safeguarding lesson is worse than no number. The teacher pack says where to put it on
            the board.
          </li>
          <li>
            <b>Every lesson is scripted and fixed.</b> There is no AI talking to a child, no
            generated dialogue and no open web inside a lesson, so what a class sees this week is
            what you can read in the teacher pack beforehand.
          </li>
        </ul>

        <h2>Raising a concern with us</h2>
        <p>
          If you believe a child is at risk, follow your own safeguarding procedure first. Your
          designated safeguarding lead and the local authority come before us.
        </p>
        <p>
          For anything about the platform itself, including content you want changed, write to{" "}
          <a href="mailto:safeguarding@algorithmx.co.uk">safeguarding@algorithmx.co.uk</a>. We
          aim to answer within <Blank what="response time to commit to" /> working days, and
          sooner where a child is at risk.
        </p>

        <h2>What this is not</h2>
        <p>
          We are a supplier of lessons, not a filtering or monitoring service. We do not watch
          what a child does on their device, we do not scan their browsing, and we hold no
          responsibility under your filtering and monitoring duties. What happens inside our
          lessons is ours; everything around them is the school&rsquo;s.
        </p>

        <footer className="note">
          Related: <Link href="/privacy">privacy notice</Link> &middot;{" "}
          <Link href="/schools/data-protection">school data protection pack</Link> &middot;{" "}
          <Link href="/terms">terms</Link>
        </footer>
      </div>
    </main>
  );
}
