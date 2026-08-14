-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('free', 'starter', 'creator', 'pro');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('pending', 'active', 'cancelled', 'expired', 'past_due');

-- AlterTable
ALTER TABLE "ProductDefinition" ADD COLUMN     "full_content" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "PlanTier" NOT NULL DEFAULT 'free';

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan" "PlanTier" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "billing_period" TEXT NOT NULL DEFAULT 'monthly',
    "flutterwave_subscription_id" TEXT,
    "flutterwave_plan_id" TEXT,
    "flutterwave_tx_ref" TEXT,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "generations_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_user_id_key" ON "Subscription"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_flutterwave_subscription_id_key" ON "Subscription"("flutterwave_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRecord_user_id_period_start_key" ON "UsageRecord"("user_id", "period_start");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

