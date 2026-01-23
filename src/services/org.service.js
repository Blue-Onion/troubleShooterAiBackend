import { db } from "#src/lib/prisma.js";
import logger from "#src/utils/logger.js";
const randomHex = (len = 4) => {
  return [...crypto.getRandomValues(new Uint8Array(len / 2))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
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

  try {
    return await db.$transaction(async (tx) => {
      let finalSlug = slug;
      if (!finalSlug) {
        let baseSlug = name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/(^-|-$)/g, "");
        finalSlug = `${baseSlug}-${randomHex(4)}`;
      }

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
          status: "ACCEPTED",
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

  const { role, jobCategoryId } = data;

  try {
    if (role !== "MEMBER") {
      if (!jobCategoryId) throw new Error("Job category is required");

      return db.$transaction(async (tx) => {
        const jobCategory = await tx.jobCategory.findUnique({
          where: {
            id: jobCategoryId,
          },
        });

        if (!jobCategory) {
          throw new Error("Invalid job category");
        }

        // Ensure the job category belongs to the org
        if (jobCategory.organizationId !== orgId) {
          throw new Error("Job category does not belong to this organization");
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
      if (membership.role === "ADMIN") {
        const membership = await tx.membership.findUnique({
          where: {
            userId_organizationId: {
              userId,
              organizationId: orgId,
            },
          },
        });
        const adminCount = await tx.membership.count({
          where: {
            organizationId: orgId,
            role: "ADMIN",
          },
        });

        if (!membership) throw new Error("Not a member of this organization");

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
      const membership = await tx.membership.findUnique({
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
      if (membership.role !== "ADMIN") {
        const error = new Error("Only admin can delete organization");
        error.status = 403;
        throw error;
      }
      if (!membership.organization) {
        const error = new Error("Organization not found");
        error.status = 404;
        throw error;
      }

      await tx.issue.deleteMany({
        where: { organizationId: orgId },
      });

      return await tx.organization.delete({
        where: { id: orgId },
      });
    });
  } catch (error) {
    logger.error("Error deleting organization:", error);
    throw error;
  }
};
