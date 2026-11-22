import type { Metadata } from "next";
import Link from "next/link";
import CorporateSubpage from "../CorporateSubpage";
import { DraftBanner, SolicitorNote } from "../SolicitorNote";

/**
 * /corporate/terms - the terms on which a firm buys Cyber Secured seats.
 * DRAFT: written for the solicitor's review and held on this branch until
 * the reviewed text replaces it. Every "FOR THE SOLICITOR" note is a point
 * the solicitor and the owner decide; the text around it describes what
 * the product and the code do today (2026-11-10), not a legal decision.
 * Nothing public links here until the reviewed text lands.
 */
export const metadata: Metadata = {
  title: "Terms for firms | Cyber Secured by AlgorithmX",
  description: "The terms on which a firm buys Cyber Secured seats: what a seat opens, price, VAT and payment, the team register, data, and how either side ends it.",
  alternates: { canonical: "https://algorithmx.io/corporate/terms" },
  robots: { index: false },
};

export default function CorporateTermsPage() {
  return (
    <CorporateSubpage
      eyebrow="// Terms · Cyber Secured seats for firms · DRAFT"
      title={<>The terms on which a firm <span className="corp-sub-grad">buys seats.</span></>}
      lede="These terms apply when a firm, organisation or school buys Cyber Secured seats from AlgorithmX Ltd, by card on this site or on a quote. They are written to be read in ten minutes. Where they and a signed agreement differ, the signed agreement wins."
      asOf="10 November 2026 (draft)"
      mapsHeading="// The short version"
      maps={[
        "A seat is one named person for one year, and opens all three courses: AI Cleared, AI Fluent and Cyber Awareness, in any order.",
        "Team rate under 50 seats, £99 a seat; Firm rate from 50 seats, £85 a seat; VAT added on top.",
        "There are no certificates: what each person finishes appears on your firm's team register.",
        "We process your people's data only to run the courses for you, under the data processing agreement.",
      ]}
      sections={[
        {
          heading: "1. Who these terms are between",
          body: (
            <>
              <DraftBanner>This page is a draft for legal review. It describes the product as it is sold on 10 November 2026. Each note marked &ldquo;FOR THE SOLICITOR&rdquo; is a decision still to be made, and is removed when the reviewed text replaces this draft.</DraftBanner>
              <p>AlgorithmX Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;), a company registered in England and Wales, and the firm, organisation or school named on the order or on the buy page (&ldquo;you&rdquo;, &ldquo;the firm&rdquo;). The person who pays or who is named as the admin confirms they are entitled to bind the firm.</p>
              <p>These terms cover Cyber Secured, the product we sell to organisations. The courses we sell to individuals have <Link href="/terms">their own terms</Link>, and their consumer prices include VAT; nothing in these terms applies to them.</p>
              <SolicitorNote>Insert the company number and registered office. Confirm these terms are business to business only, and what applies if a sole trader or a very small buyer pays by card on the buy page (the checkout does not ask whether the buyer is a business).</SolicitorNote>
            </>
          ),
        },
        {
          heading: "2. What you are buying",
          body: (
            <>
              <p>A <strong>seat</strong> is a licence for one named member of your staff to use Cyber Secured for twelve months. One seat opens three courses: <strong>AI Cleared</strong> (using AI tools safely at work), <strong>AI Fluent</strong> (getting real work out of them) and <strong>Cyber Awareness</strong> (eight modules on the attacks aimed at staff). The person may take them in any order; none is a prerequisite for another. Each seat also includes the team register for your admin and every short quarterly Threat Briefing module for Cyber Awareness, added to every seat the day it is released.</p>
              <SolicitorNote>Decide whether the quarterly Threat Briefing is a contractual commitment (a new module every quarter) or a stated intention (&ldquo;we aim to release&rdquo;). The sales pages say one follows each quarter.</SolicitorNote>
              <p>A seat is claimed when the person your admin invites signs in through their invite link. Until it is claimed, your admin may remove the invite from the register and invite someone else instead. Once claimed, the seat belongs to that person; your admin cannot move it to someone else from the register.</p>
              <SolicitorNote>Decide the seat reassignment policy when a member of staff leaves. What the system does today: a claimed seat cannot be moved by the admin; the admin can ask us to remove the person, and after removal the seat stays counted as used on the register (the person&rsquo;s data is deleted, the seat is not freed). Options include: no reassignment; reassignment of a seat whose holder leaves within a set period; or a set number of reassignments a year.</SolicitorNote>
              <SolicitorNote>Decide when the twelve months start: on payment, or on each seat&rsquo;s claim. Today the system records the purchase date and each seat&rsquo;s invite and claim dates, but nothing ends a person&rsquo;s access after twelve months; that would have to be built to match whatever these terms say.</SolicitorNote>
              <p>The courses are provided as they stand on the day, in the browser, with no installation. We keep them current with the AI tools and attacks they teach and may change their content, screens and simulators at any time without reducing what a seat includes.</p>
            </>
          ),
        },
        {
          heading: "3. Price, VAT and payment",
          body: (
            <>
              <p>The price is per seat, per year, and depends on how many seats are in the order:</p>
              <ul>
                <li><strong>Team</strong>, fewer than 50 seats: £99 a seat.</li>
                <li><strong>Firm</strong>, 50 seats or more: £85 a seat.</li>
              </ul>
              <p>The whole order is charged at the rate its own seat count earns. Prices exclude VAT; VAT is added on top at the rate that applies (20% in the United Kingdom today) and shown on the invoice.</p>
              <p>Orders of 10 to 249 seats are paid by card on this site; payment is taken by Stripe on its secure page, and Stripe issues the invoice. Orders of more than 249 seats, and any order on other terms, are by quote and a separate agreement, payable within 30 days of the invoice date unless the quote says otherwise.</p>
              <p>A firm that already holds seats may buy more at any time. Extra seats are charged at the published rate on the day of that purchase, and the rate is set by the number of seats in that purchase, not by the total the firm will then hold. We may also adjust a firm&rsquo;s seat count by agreement, for example to correct an order.</p>
              <SolicitorNote>Decide how extra seats bought part way through a year line up with the firm&rsquo;s existing seats: a full twelve months of their own, or ending with the existing seats at a pro-rata price. The checkout today charges a full year at the published rate and does not pro-rate.</SolicitorNote>
              <p>Payment buys the seats; the firm and its admin invite are created when the card payment clears.</p>
              <SolicitorNote>Decide the refund policy. The earlier draft proposed: no refund once a seat is claimed, and unclaimed seats bought by card refundable on request within fourteen days of purchase. The system today lets AlgorithmX staff refund a payment by hand; it has no automatic refund rule.</SolicitorNote>
              <SolicitorNote>Decide the late payment terms for quoted orders (interest, and whether we may pause new invites while an invoice is overdue; the earlier draft proposed pausing invites 30 days after the due date, with people already in the course carrying on).</SolicitorNote>
            </>
          ),
        },
        {
          heading: "4. Your admin, your register, your people",
          body: (
            <>
              <p>Your admin invites your staff, removes invites that have not been claimed, edits your firm profile (your approved AI tools, your names for your data classes, who staff should ask) and sends reminders, under the admin&rsquo;s name, to people who have not finished. The firm profile is read by the courses: what your people are taught about approved tools is what your admin put there, and keeping it accurate is your responsibility.</p>
              <p>The <strong>team register</strong> shows your admin, for each person: their name and work email, their team and desk, whether their seat is claimed, how far they have got on each course, module by module, and when they were last active. It can be downloaded as a CSV file. It does not show what anyone typed in a practice, their practice scores, or anything in their private AI Fluent playbook.</p>
              <p>You confirm that the people you invite are your staff or contractors, that you have told them their progress is visible to you, and that you have a lawful basis for giving us their work email and name.</p>
            </>
          ),
        },
        {
          heading: "5. What the register records",
          body: (
            <>
              <p>Cyber Secured does not issue certificates. When a person finishes a module or a course, it appears on your firm&rsquo;s team register with the date. The register records what the person did in the course. It does not warrant how they will behave afterwards, and it is not a legal or regulatory opinion on your firm&rsquo;s compliance with anything.</p>
              <p>Certificates issued for AI Cleared or AI Fluent before Cyber Secured replaced those courses as separate products stay checkable on our verify page by their serial until the expiry date shown on them, unless the firm or the holder asks for their removal.</p>
              <SolicitorNote>Confirm the wording on what the register attests, and whether existing certificate holders need any notice now that no new certificates are issued. Note: when a person is deleted at their firm&rsquo;s request, the system deletes their certificate with their account, so it stops verifying.</SolicitorNote>
            </>
          ),
        },
        {
          heading: "6. The practice sandbox and the AI model",
          body: (
            <>
              <p>AI Cleared and AI Fluent include practice exercises in which a person writes to a copy of an AI tool. Every practice uses invented firms, people and figures. Your people must not type real client, employee or firm data into a practice; the course stops a send that looks like real personal data, but the responsibility is theirs and yours.</p>
              <p>What they type in a practice is sent to our AI model provider to grade it and to reply, and is not kept by us once the reply is shown; we keep the verdict and score. The details are in the <Link href="/corporate/dpa">data processing agreement</Link> and on the <Link href="/corporate/security">security page</Link>. Cyber Awareness does not use the AI model.</p>
              <p>Each person has a daily allowance of AI model calls. Past it, the course carries on with its built-in grading and scripted replies until the next day.</p>
              <p>The courses teach your people to use AI tools safely and well. They do not make us responsible for how your people use any AI tool outside the course.</p>
            </>
          ),
        },
        {
          heading: "7. Data protection",
          body: (
            <>
              <p>For your people&rsquo;s data we are your processor and you are the controller. The <Link href="/corporate/dpa">data processing agreement</Link> is part of these terms and sets out what we process, where, through whom, for how long, and how a person&rsquo;s data is deleted on your written request. Our <Link href="/corporate/security">security page</Link> describes the measures in place.</p>
            </>
          ),
        },
        {
          heading: "8. Availability and support",
          body: (
            <>
              <p>We aim to keep the courses available at all times and fix faults promptly, but we do not promise uninterrupted service. Support is by email to <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a>.</p>
              <SolicitorNote>Decide the service commitments, if any. The earlier draft proposed: a reply to support emails within two working days, and every affected seat extended by the time lost if the courses are unavailable for more than five working days in a licence year through our fault.</SolicitorNote>
            </>
          ),
        },
        {
          heading: "9. Our content, your use of it",
          body: (
            <>
              <p>The courses, their text, simulators, question banks and briefings are ours. A seat gives the named person the right to use them for their own learning during the term. Nobody may copy, record, resell or build a competing course from them, and screenshots of practice screens may be shared inside your firm but not published.</p>
              <p>A prompt a learner chooses to save to their AI Fluent playbook is theirs; we hold it only to show it back to that person, and your admin does not see it.</p>
            </>
          ),
        },
        {
          heading: "10. Liability",
          body: (
            <>
              <p>Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot be limited by law. Otherwise our total liability to you under or in connection with these terms in any twelve-month period is limited to the fees you paid us in that period, and neither of us is liable to the other for loss of profit, business or data, or for any indirect or consequential loss.</p>
              <SolicitorNote>Decide the liability cap and the exclusions. The text above is the earlier draft&rsquo;s proposal (a cap of the fees paid in the previous twelve months); consider whether data protection breaches carry a separate cap, and whether the cap should be mutual.</SolicitorNote>
            </>
          ),
        },
        {
          heading: "11. Renewal and ending the agreement",
          body: (
            <>
              <p>Seats run for the twelve months described in section 2. You may stop inviting people at any time; seats already claimed run their term.</p>
              <SolicitorNote>Decide renewal. Today every card purchase is a one-off payment: there is no subscription, nothing renews automatically, and no reminder is sent before a year ends. Choose between renewal by a new order (what the system supports now) and automatic renewal (which would need notice before each renewal and a subscription to be built).</SolicitorNote>
              <p>We may end the agreement on written notice if an invoice is sixty days overdue, if the courses are used in breach of section 9, or if your firm does something that puts our other customers or us at legal risk. We can close a firm&rsquo;s access at once in those cases; closing access deletes nothing, so it can be restored exactly as it was.</p>
              <SolicitorNote>Decide the termination grounds and what is refunded when we end the agreement (the earlier draft refunded seats not yet claimed), and whether the firm may end the agreement for convenience.</SolicitorNote>
              <p>When the agreement ends we delete your firm&rsquo;s data on your written request as the data processing agreement describes; until you ask, we keep it so a renewal picks up where it left off.</p>
            </>
          ),
        },
        {
          heading: "12. Changes, law and the rest",
          body: (
            <>
              <p>We may change these terms for future purchases by publishing a new version here with its date; a purchase is governed by the version published on the day it was made. These terms are governed by the law of England and Wales and its courts have exclusive jurisdiction. If a clause is found unenforceable the rest stands. Notices to us go to <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a>; notices to you go to your admin&rsquo;s email.</p>
              <SolicitorNote>Confirm how these terms are accepted. The buy page says &ldquo;By paying you accept the terms for firms and the data processing agreement&rdquo; above the pay button; there is no tick box, and nothing records which version a buyer accepted beyond the purchase date. Decide whether that is enough, and how quoted orders accept them.</SolicitorNote>
            </>
          ),
        },
      ]}
    />
  );
}
