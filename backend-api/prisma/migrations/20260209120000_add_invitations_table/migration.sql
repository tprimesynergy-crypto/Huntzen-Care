-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "email" TEXT,
    "singleUse" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "created_by_user_id" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "used_by_user_id" TEXT,
    "auto_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_companyId_idx" ON "invitations"("companyId");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_created_by_user_id_idx" ON "invitations"("created_by_user_id");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_used_by_user_id_fkey" FOREIGN KEY ("used_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
