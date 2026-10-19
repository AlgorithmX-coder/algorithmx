import type { Metadata } from "next";
import Link from "next/link";
import CorporateSubpage from "../CorporateSubpage";

/**
 * /corporate/terms - the terms on which a firm buys seats on AI Cleared
 * and AI Fluent. DRAFT: written for the solicitor's review and held on
 * this branch until the reviewed text replaces it. The page is linked from
 * the buy page above the pay button once it ships.
 */
export const metadata: Metadata = {
  title: "Terms for firms | AI Cleared by AlgorithmX",
  description: "The terms on which a firm buys seats on AI Cleared and AI Fluent: the licence, payment, what a certificate attests, data, and how either side ends it.",
  alternates: { canonical: "https://algorithmx.io/corporate/terms" },
  robots: { index: false },
};

export default function CorporateTermsPage() {
  return (
    <CorporateSubpage
      eyebrow="// Terms · seats for firms"
      title={<>The terms on which a firm <span className="corp-sub-grad">buys seats.</span></>}
      lede="These terms apply when a firm buys seats on AI Cleared or AI Fluent from AlgorithmX Ltd, by card on this site or by invoice. They are written to be read in ten minutes. Where they and an order or a signed agreement differ, the signed agreement wins."
      asOf="5 October 2026"
      mapsHeading="// The short version"
      maps={[
        "A seat is one named person for one year on one course; seats come in packs of ten and are not transferable once claimed.",
        "You pay up front, by card or within 30 days of an invoice; prices exclude VAT where VAT applies.",
        "A certificate says the holder completed the course and passed its assessments on a date; it is not a guarantee of anyone's future conduct.",
        "We process your people's data only to run the course for you, under the data processing agreement.",
      ]}
      sections={[
        {
          heading: "1. Who these terms are between",
          body: (
            <>
              <p>AlgorithmX Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;), a company registered in England and Wales, and the firm named on the order or on the buy page (&ldquo;you&rdquo;, &ldquo;the firm&rdquo;). The person who pays or who is named as the admin confirms they are entitled to bind the firm.</p>
              <p>These terms cover the corporate courses only: AI Cleared and AI Fluent. The consumer courses on this site have <Link href="/terms">their own terms</Link>.</p>
            </>
          ),
        },
        {
          heading: "2. What you are buying",
          body: (
            <>
              <p>A <strong>seat</strong> is a licence for one named member of your staff to take one course for twelve months from the day the seat is claimed, with the course&rsquo;s practice sandbox, its register entry and, on completion, its certificate. Seats are sold in packs of ten, for ten to 249 people; larger firms buy on a separate agreement.</p>
              <p>A seat is claimed when the person your admin invites signs in through their invite link. Until it is claimed, your admin may invite a different person to it. Once claimed it belongs to that person for its term and cannot be moved to someone else. An AI Fluent seat can be claimed only by a person who holds a valid AI Cleared certificate.</p>
              <p>The courses are provided as they stand on the day, in the browser, with no installation. We keep them current with the AI tools they teach and may change their content, screens and simulators at any time without reducing what a seat includes.</p>
            </>
          ),
        },
        {
          heading: "3. Price and payment",
          body: (
            <>
              <p>The price per seat per year is the one published on the corporate page on the day you buy: for ten to 49 seats and from 50 seats, for each course. Prices exclude VAT, which is added where it applies and shown on the invoice. A card payment is taken by Stripe on its secure page; an invoice is payable within 30 days of its date.</p>
              <p>Payment buys the seats; your firm and its admin invite are created when payment clears. Seats are not refundable once a person has claimed one, except where these terms say otherwise. Unclaimed seats bought by card may be refunded within fourteen days of purchase on request.</p>
              <p>If an invoice is unpaid 30 days after it is due we may pause new invites until it is paid; people already in the course carry on.</p>
            </>
          ),
        },
        {
          heading: "4. Your admin, your profile, your people",
          body: (
            <>
              <p>Your admin invites your staff, sees your register and your certificates, edits your firm profile (your approved tools, your data class names, who staff should ask) and nudges people who have not finished. The profile is read by the courses: what your people are taught about approved tools is what your admin put there, and keeping it accurate is your responsibility.</p>
              <p>You confirm that the people you invite are your staff or contractors, that you have told them their progress and certificate are visible to you, and that you have a lawful basis for giving us their work email and name.</p>
            </>
          ),
        },
        {
          heading: "5. What a certificate means",
          body: (
            <>
              <p>A certificate records that the named person completed every module of the named course and passed its assessments on the date shown, and carries a serial that anyone can check on our verify page for a year from issue. It attests to what the person did in the course. It does not warrant how they will behave afterwards, and it is not a legal or regulatory opinion on your firm&rsquo;s compliance with anything.</p>
              <p>We may withdraw a certificate obtained by someone other than the named person or by breaking the rules of the course. We tell your admin when we do.</p>
            </>
          ),
        },
        {
          heading: "6. The practice sandbox and the AI model",
          body: (
            <>
              <p>Every practice exercise uses invented firms, people and figures. Your people must not type real client, employee or firm data into the sandbox; the course stops a send that looks like real personal data, but the responsibility is theirs and yours. What they type is sent to our AI model provider to grade and to reply, under the terms set out in the <Link href="/corporate/dpa">data processing agreement</Link> and on the <Link href="/corporate/security">security page</Link>.</p>
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
              <p>We aim to keep the courses available at all times and fix faults promptly, but we do not promise uninterrupted service. Support is by email to <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a>; we answer within two working days. If the courses are unavailable for more than five working days in a licence year through our fault, we extend every affected seat by the time lost.</p>
            </>
          ),
        },
        {
          heading: "9. Our content, your use of it",
          body: (
            <>
              <p>The courses, their text, simulators, question banks and certificates are ours. A seat gives the named person the right to use them for their own learning during the term. Nobody may copy, record, resell or build a competing course from them, and screenshots of practice screens may be shared inside your firm but not published.</p>
              <p>A learner&rsquo;s own prompts saved to their playbook are theirs; we hold them only to show them back to that person.</p>
            </>
          ),
        },
        {
          heading: "10. Liability",
          body: (
            <>
              <p>Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot be limited by law. Otherwise our total liability to you under or in connection with these terms in any twelve-month period is limited to the fees you paid us in that period, and neither of us is liable to the other for loss of profit, business or data, or for any indirect or consequential loss.</p>
            </>
          ),
        },
        {
          heading: "11. Ending the agreement",
          body: (
            <>
              <p>A seat ends twelve months after it is claimed unless renewed. You may stop inviting people at any time; seats already claimed run their term. We may end the agreement on written notice if an invoice is sixty days overdue, if the courses are used in breach of section 9, or if your firm does something that puts our other customers or us at legal risk, and in that case we refund any seat not yet claimed.</p>
              <p>When the agreement ends we delete your firm&rsquo;s data on your written request as the data processing agreement describes; until you ask, we keep it so a renewal picks up where it left off.</p>
            </>
          ),
        },
        {
          heading: "12. Changes, law and the rest",
          body: (
            <>
              <p>We may change these terms for future purchases by publishing a new version here with its date; a purchase is governed by the version published on the day it was made. These terms are governed by the law of England and Wales and its courts have exclusive jurisdiction. If a clause is found unenforceable the rest stands. Notices to us go to <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a>; notices to you go to your admin&rsquo;s email.</p>
            </>
          ),
        },
      ]}
    />
  );
}
