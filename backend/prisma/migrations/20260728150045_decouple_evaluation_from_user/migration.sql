/*
  Warnings:

  - You are about to drop the column `evaluatorId` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Evaluation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_evaluatorId_fkey";

-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_protocolId_fkey";

-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_studentId_fkey";

-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "evaluatorId",
DROP COLUMN "studentId";

-- CreateIndex
CREATE INDEX "Evaluation_protocolId_idx" ON "Evaluation"("protocolId");

-- CreateIndex
CREATE INDEX "Evaluation_date_idx" ON "Evaluation"("date");

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
