/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `reportedById` on the `Issue` table. All the data in the column will be lost.
  - Added the required column `reportedByMembershipId` to the `Issue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_reportedById_fkey";

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "assignedToId",
DROP COLUMN "reportedById",
ADD COLUMN     "assignedToMembershipId" TEXT,
ADD COLUMN     "reportedByMembershipId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_reportedByMembershipId_fkey" FOREIGN KEY ("reportedByMembershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_assignedToMembershipId_fkey" FOREIGN KEY ("assignedToMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
