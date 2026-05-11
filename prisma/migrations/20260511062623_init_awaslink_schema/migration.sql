-- CreateTable
CREATE TABLE "scan_logs" (
    "id" UUID NOT NULL,
    "message_content" TEXT NOT NULL,
    "extracted_urls" JSONB,
    "message_risk_score" DOUBLE PRECISION,
    "url_risk_score" DOUBLE PRECISION,
    "final_status" VARCHAR(50) NOT NULL,
    "ai_reasons" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");
