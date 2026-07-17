-- AlterTable
ALTER TABLE "ProductDefinition" ADD COLUMN     "refinement_history" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "Transaction" (
    "transaction_id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "buyer_email" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "download_token" TEXT,
    "downloaded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_download_token_key" ON "Transaction"("download_token");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ProductDefinition"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;