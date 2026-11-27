-- CreateTable
CREATE TABLE "ConsumerPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "amountPence" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "stripeSessionId" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "buyerEmail" TEXT NOT NULL,
    "waiverConsentAt" TIMESTAMP(3),
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "ConsumerPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerPurchase_stripeSessionId_key" ON "ConsumerPurchase"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerPurchase_paymentIntentId_key" ON "ConsumerPurchase"("paymentIntentId");

-- CreateIndex
CREATE INDEX "ConsumerPurchase_userId_idx" ON "ConsumerPurchase"("userId");

-- AddForeignKey
ALTER TABLE "ConsumerPurchase" ADD CONSTRAINT "ConsumerPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

