import { db } from "#src/lib/prisma.js";
import logger from "#src/utils/logger.js";

const allowedMemberShipDecisions = ["ACCEPTED", "REJECTED", "SUSPENDED"];
const allowedIssueDecisions = [
  "PENDING",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];
const allowedPriority = ["LOW", "MEDIUM", "MEDIUM_HIGH", "HIGH"];

export const decideIssue = async (userId, orgId, id, decision, priority) => {
  try {
    if (!userId) {
      const error = new Error("Invalid id");
      error.status = 400;
      throw error;
    }
    if (!orgId) {
      const error = new Error("Invalid organization id");
      error.status = 400;
      throw error;
    }
    if (!priority) {
      const error = new Error("Invalid priority");
      error.status = 400;
      throw error;
    }
    if (!id) {
      const error = new Error("Invalid issue id");
      error.status = 400;
      throw error;
    }
    if (!allowedIssueDecisions.includes(decision)) {
      throw Object.assign(new Error("Invalid decision"), { status: 400 });
    }
    if (!allowedPriority.includes(priority)) {
      throw Object.assign(new Error("Invalid priority"), { status: 400 });
    }
    console.log(userId, orgId, id, decision, priority);

    const isAdmin = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: userId,
          organizationId: orgId,
        },
      },
    });
    console.log(isAdmin);

    if (isAdmin?.role !== "ADMIN") {
      const error = new Error("Only admin can update issues");
      error.status = 403;
      throw error;
    }
    const issue = await db.issue.findUnique({
      where: {
        id: id,
        organizationId: orgId,
      },
    });
    if (!issue) {
      const error = new Error("No issue found");
      error.status = 404;
      throw error;
    }
    const updatedIssue = await db.issue.update({
      where: { id },
      data: {
        status: decision,
        priority,
      },
    });
    return updatedIssue;
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
};
export const decideRequest = async (userId, orgId, id, decision) => {
  try {
    if (!userId) {
      const error = new Error("Invalid id");
      error.status = 400;
      throw error;
    }
    if (!orgId) {
      const error = new Error("Invalid organization id");
      error.status = 400;
      throw error;
    }
    if (!id) {
      const error = new Error("Invalid member id");
      error.status = 400;
      throw error;
    }
    const isDecisionAllowed = allowedMemberShipDecisions.includes(decision);
    if (!isDecisionAllowed) {
      const error = new Error("Invalid decision");
      error.status = 400;
      throw error;
    }
    const isAdmin = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: userId,
          organizationId: orgId,
        },
      },
    });
    if (isAdmin?.role !== "ADMIN") {
      const error = new Error("Only Admin can approve or reject");
      error.status = 403;
      throw error;
    }
    const memberShip = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: id,
          organizationId: orgId,
        },
      },
    });
    if (!memberShip) {
      const error = new Error("No membership found");
      error.status = 404;
      throw error;
    }
    const updatedMemberShip = await db.membership.update({
      where: {
        userId_organizationId: {
          userId: id,
          organizationId: orgId,
        },
      },
      data: {
        status: decision,
      },
    });
    return updatedMemberShip;
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
};
export const assignIssue = async (userId, orgId, issueId, staffId) => {
  if (!userId) {
    const error = new Error("Invalid id");
    error.status = 400;
    throw error;
  }
  if (!orgId) {
    const error = new Error("Invalid organization id");
    error.status = 400;
    throw error;
  }
  if (!issueId) {
    const error = new Error("Invalid issue id");
    error.status = 400;
    throw error;
  }
  if (!staffId) {
    const error = new Error("Invalid staff id");
    error.status = 400;
    throw error;
  }
  try {
    const isAdmin = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: userId,
          organizationId: orgId,
        },
      },
    });
    if (isAdmin?.role !== "ADMIN") {
      const error = new Error("Only Admin can assign issue");
      error.status = 403;
      throw error;
    }
    const issue = await db.issue.findUnique({
      where: {
        id: issueId,
        organizationId: orgId,
      },
    });
    if (!issue) {
      const error = new Error("No issue found");
      error.status = 404;
      throw error;
    }
    console.log(issue);
    const staff = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: staffId,
          organizationId: orgId,
        },
      },
    });
    console.log(staff);

    if (!staff) {
      const error = new Error("No staff found");
      error.status = 404;
      throw error;
    }
    const updatedIssue = await db.issue.update({
      where: {
        id: issueId,
      },
      data: {
        assignedToId: staffId,
      },
    });
    return updatedIssue;
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
};
export const getPendingApplicants = async (userId, orgId) => {
  try {
    if (!userId) {
      const error = new Error("Invalid id");
      error.status = 400;
      throw error;
    }
    if (!orgId) {
      const error = new Error("Invalid organization id");
      error.status = 400;
      throw error;
    }

    const isAdmin = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: userId,
          organizationId: orgId,
        },
      },
    });
    if (isAdmin?.role != "ADMIN") {
      const error = new Error(JSON.stringify({
        orgId:orgId,
        userId:userId,
        isAdmin:isAdmin
      }));
      error.status = 403;
      throw error;
    }
    const pendingApplicants = await db.membership.findMany({
      where: {
        organizationId: orgId,
        status: "PENDING",
      },
    });
    return pendingApplicants;
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
};
