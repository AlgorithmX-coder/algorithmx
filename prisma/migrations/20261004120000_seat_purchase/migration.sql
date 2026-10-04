-- CreateTable
CREATE TABLE "SeatPurchase" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "course" "CourseKey" NOT NULL,
    "seats" INTEGER NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeatPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeatPurchase_stripeCheckoutSessionId_key" ON "SeatPurchase"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "SeatPurchase_orgId_idx" ON "SeatPurchase"("orgId");

-- AddForeignKey
ALTER TABLE "SeatPurchase" ADD CONSTRAINT "SeatPurchase_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
