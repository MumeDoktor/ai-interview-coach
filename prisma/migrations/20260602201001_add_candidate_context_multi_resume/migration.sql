-- DropIndex
DROP INDEX "Resume_userId_key";

-- AlterTable
ALTER TABLE "JobAnalysis" ADD COLUMN     "candidateContext" TEXT;
