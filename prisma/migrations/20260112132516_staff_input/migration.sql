-- AlterEnum
ALTER TYPE "IssueStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "staffVerdict" TEXT,
ADD COLUMN     "staffVerdictAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
