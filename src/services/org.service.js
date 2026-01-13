import { db } from "#src/lib/prisma.js";
import logger from "#src/utils/logger.js";

export const getOrg = async (userId, orgId) => {
  if (!userId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  if (!orgId) {
    const error = new Error("Invalid id");
    error.status = 400;
    throw error;
  }
  try {
    const membership = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!membership) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }
    if (!membership.organization) {
      const error = new Error("Organization not found");
      error.status = 404;
      throw error;
    }

    return membership.organization;
  } catch (error) {
    logger.error("Error getting organization:", error);
    throw error;
  }
};
export const getOrgs = async (userId) => {
  if (!userId) throw new Error("Unauthorized");
  const orgs = await db.membership.findMany({
    where: {
      userId,
    },
    include: {
      organization: true,
    },
  });
  return { orgs: orgs.map((org) => org.organization), count: orgs.length };
};
export const createOrg = async (userId, data) => {
  if (!userId) throw new Error("Unauthorized");
  if (!data?.name) throw new Error("Organization name is required");

  const {
    name,
    description = "",
    address = "",
    slug,
    jobCategories = [],
    issueCategories = [],
  } = data;

  const finalSlug =
    slug ?? name.toLowerCase().trim().replace(/\s+/g, "-").replace(/-+/g, "-");

  try {
    return await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name,
          description,
          address,
          slug: finalSlug,
        },
      });

      if (jobCategories.length) {
        await tx.jobCategory.createMany({
          data: jobCategories.map(({ name }) => ({
            name,
            organizationId: org.id,
          })),
        });
      }

      if (issueCategories.length) {
        await tx.issueCategory.createMany({
          data: issueCategories.map(({ name }) => ({
            name,
            organizationId: org.id,
          })),
        });
      }

      await tx.membership.create({
        data: {
          userId,
          organizationId: org.id,
          role: "ADMIN",
          status:"ACCEPTED",
        },
      });

      return org;
    });
  } catch (error) {
    logger.error("Error creating organization:", error);
    throw error;
  }
};
export const joinOrg = async (userId, orgId, data) => {
  if (!userId) throw new Error("Unauthorized");
  if (!orgId) throw new Error("Invalid id");

  const { role, job } = data;

  try {
    if (role === "STAFF") {
      if (!job) throw new Error("Job category is required");

      return db.$transaction(async (tx) => {
        const jobCategory = await tx.jobCategory.findUnique({
          where: {
            name_organizationId: {
              name: job,
              organizationId: orgId,
            },
          },
        });

        if (!jobCategory) {
          throw new Error("Invalid job category");
        }

        return tx.membership.create({
          data: {
            userId,
            organizationId: orgId,
            role,
            jobCategoryId: jobCategory.id,
          },
        });
      });
    }

    return db.membership.create({
      data: {
        userId,
        organizationId: orgId,
        role,
      },
    });
  } catch (error) {
    logger.error("Error joining organization:", error);
    throw error;
  }
};

export const leaveOrg = async (userId, orgId) => {
  if (!userId) throw new Error("Unauthorized");
  if (!orgId) throw new Error("Invalid id");

  try {
    return db.$transaction(async (tx) => {
      const membership = await tx.membership.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: orgId,
          },
        },
      });

      if (!membership) throw new Error("Not a member of this organization");
      if (membership.role === "ADMIN") {
        const adminCount = await tx.membership.count({
          where: {
            organizationId: orgId,
            role: "ADMIN",
          },
        });

        if (adminCount <= 1) {
          throw new Error("Organization must have at least one admin");
        }
      }

      return await tx.membership.delete({
        where: {
          userId_organizationId: {
            userId,
            organizationId: orgId,
          },
        },
      });
    });
  } catch (error) {
    logger.error("Error leaving organization:", error);
    throw error;
  }
};
export const deleteOrg = async (userId, orgId) => {
  if (!userId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  if (!orgId) {
    const error = new Error("Invalid id");
    error.status = 400;
    throw error;
  }
  try {
    return await db.$transaction(async (tx) => {
      const orgIndex = await tx.organization.findUnique({
        where: { id: orgId },
      });

      if (!orgIndex) {
        const error = new Error("Organization not found");
        error.status = 404;
        throw error;
      }

      const membership = await tx.membership.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: orgId,
          },
        },
      });

      if (!membership) {
        const error = new Error("Forbidden");
        error.status = 403;
        throw error;
      }
      if (membership.role !== "ADMIN") {
        const error = new Error("Only admin can delete organization");
        error.status = 403;
        throw error;
      }

      return await tx.organization.delete({
        where: { id: orgId },
      });
    });
  } catch (error) {
    logger.error("Error deleting organization:", error);
    throw error;
  }
};
