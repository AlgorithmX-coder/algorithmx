-- A firm created by card checkout remembers its Stripe Checkout session, so
-- a webhook delivered twice creates nothing twice. Additive and safe to
-- apply early.
ALTER TABLE "Organisation" ADD COLUMN "stripeCheckoutSessionId" TEXT;
CREATE UNIQUE INDEX "Organisation_stripeCheckoutSessionId_key" ON "Organisation"("stripeCheckoutSessionId");
