-- AlterEnum
ALTER TYPE "Specialty" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "practitioners" ADD COLUMN "customSpecialty" TEXT;
