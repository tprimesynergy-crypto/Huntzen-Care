-- AlterTable
ALTER TABLE "practitioners" ADD COLUMN "companyId" TEXT;

-- CreateIndex
CREATE INDEX "practitioners_companyId_idx" ON "practitioners"("companyId");

-- AddForeignKey
ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
