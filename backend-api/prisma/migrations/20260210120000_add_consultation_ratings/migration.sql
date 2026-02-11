-- CreateTable
CREATE TABLE "consultation_ratings" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "raterRole" "Role" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultation_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consultation_ratings_consultationId_idx" ON "consultation_ratings"("consultationId");

-- CreateIndex
CREATE INDEX "consultation_ratings_raterRole_idx" ON "consultation_ratings"("raterRole");

-- CreateIndex
CREATE UNIQUE INDEX "consultation_ratings_consultationId_raterRole_key" ON "consultation_ratings"("consultationId", "raterRole");

-- AddForeignKey
ALTER TABLE "consultation_ratings" ADD CONSTRAINT "consultation_ratings_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
