-- DropForeignKey
ALTER TABLE "JobCategory" DROP CONSTRAINT "JobCategory_organizationId_fkey";

-- AddForeignKey
ALTER TABLE "JobCategory" ADD CONSTRAINT "JobCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
