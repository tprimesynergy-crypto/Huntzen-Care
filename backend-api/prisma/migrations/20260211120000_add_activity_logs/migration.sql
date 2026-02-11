-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "actor_email" TEXT NOT NULL,
    "actor_role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_actor_user_id_idx" ON "activity_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_idx" ON "activity_logs"("entity_type");
