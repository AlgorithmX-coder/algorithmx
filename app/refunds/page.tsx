import { DraftLegalPage, Mail, Section, draftMetadata } from "@/app/components/legal/DraftLegalPage";

/* DRAFT for the solicitor. Consumer rules from the Consumer Contracts
 * (Information, Cancellation and Additional Charges) Regulations 2013 for
 * digital content not on a tangible medium. Business refunds follow each
 * order's own terms. Refunds are issued through Stripe to the original
 * payment method (app/lib/refund.ts). Note for the owner: the consent step
 * this page describes is not built yet; there is no consumer checkout. */

export const metadata = draftMetadata("Refunds and cancellations", "Your right to cancel a course and how refunds work.");

export default function RefundsPage() {
  return (
    <DraftLegalPage title="Refunds and cancellations" updated="November 2026">
      <Section title="Buying for yourself or your family">
        <p>
          When you buy a course for yourself or your family, the law gives you 14 days from the day you buy to
          change your mind and cancel, for a full refund.
        </p>
        <p>
          Our courses are digital content you can start straight away. If you choose to start a course within those
          14 days, we will first ask you to confirm that you want to start now and that you understand you will lose
          the right to cancel once you do. Your right to cancel ends when the course starts.
        </p>
        <p>
          If you have not started the course, email <Mail to="support" /> within the 14 days from the email address
          you bought with, and tell us you want to cancel. You do not have to give a reason.
        </p>
      </Section>

      <Section title="If something is wrong with a course">
        <p>
          Your rights under the Consumer Rights Act 2015 are not affected. If a course does not work as described,
          email <Mail to="support" /> and we will put it right, or, if we cannot, refund you in full or in part.
        </p>
      </Section>

      <Section title="Schools, organisations and firms">
        <p>
          Places and seats bought by a school, organisation or firm are covered by the terms of that order. For a
          question about an order or a refund, email <Mail to="admissions" /> with your organisation&rsquo;s name.
        </p>
      </Section>

      <Section title="How refunds are paid">
        <p>
          Every refund goes back to the card or payment method you paid with. We cannot send it to a different card
          or account. We start the refund within 14 days of agreeing it; your bank may then take a few working days to
          show it on your statement.
        </p>
      </Section>
    </DraftLegalPage>
  );
}
