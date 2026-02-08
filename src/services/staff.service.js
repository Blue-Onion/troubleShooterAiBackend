import { db } from "#src/lib/prisma.js";

export const getStaffById = async (orgId, staffId) => {
  if (!orgId) {
    const error = new Error("Organization id is required");
    error.status = 400;
    throw error;
  }
  if (!staffId) {
    const error = new Error("Staff id is required");
    error.status = 400;
    throw error;
  }
  try {
    
  } catch (error) {
    logger.error("Error getting staff:", error);
    throw error;
  }
};
export const getStaff = async (orgId, categoryId = "") => {
  if (!orgId) {
    const error = new Error("Organization id is required");
    error.status = 400;
    throw error;
  }
  try {
    let staffs;
    if (categoryId.length != 0) {
      staffs = await db.membership.findMany({
        where: { organizationId: orgId,role:"STAFF", jobCategoryId: categoryId },
      });
    }else{
        staffs = await db.membership.findMany({
          where: { organizationId: orgId,role:"STAFF" },
        });
    }
    return staffs;
  } catch (error) {
    logger.error("Error getting staff:", error);
    throw error;
  }
};
export const getAssingedIssues = async (orgId, staffId) => {
  if (!orgId) {
    const error = new Error("Organization id is required");
    error.status = 400;
    throw error;
  }
  if (!staffId) {
    const error = new Error("Staff id is required");
    error.status = 400;
    throw error;
  }
  try {
    const issues = await db.issue.findMany({
      where: { organizationId: orgId, assignedToId: staffId },
    });
    return issues;
  } catch (error) {
    logger.error("Error getting assinged issues:", error);
    throw error;
  }
};