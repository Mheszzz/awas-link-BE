/*
  Warnings:

  - You are about to drop the column `ai_reasons` on the `scan_logs` table. All the data in the column will be lost.
  - You are about to drop the column `extracted_urls` on the `scan_logs` table. All the data in the column will be lost.
  - You are about to drop the column `url_risk_score` on the `scan_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "scan_logs" DROP COLUMN "ai_reasons",
DROP COLUMN "extracted_urls",
DROP COLUMN "url_risk_score";
