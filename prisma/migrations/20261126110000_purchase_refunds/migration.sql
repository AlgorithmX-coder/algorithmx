-- AlterTable
ALTER TABLE "SeatPurchase" ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "refundedPence" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refundedSeats" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PlacePurchase" ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "refundedPence" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refundedPlaces" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ConsumerPurchase" ADD COLUMN     "refundedPence" INTEGER NOT NULL DEFAULT 0;

