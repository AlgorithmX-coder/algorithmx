-- Has this organisation actually paid?
--
-- Until now the console answered by elimination: not revoked and not on a
-- trial meant "Paid (manual)". A school is onboarded on a licence the day it
-- agrees to buy, which is often weeks before the invoice is settled, so every
-- unpaid school was reported as paid. These two columns record the answer
-- instead of inferring it.
--
-- Both are nullable with no default, so every existing row starts as "not
-- paid yet" and nothing is silently claimed to have been paid. Stripe
-- customers are unaffected: paidState() reads stripeCustomerId first.
ALTER TABLE "Organisation" ADD COLUMN "paidAt" TIMESTAMP(3);
ALTER TABLE "Organisation" ADD COLUMN "paidById" TEXT;
