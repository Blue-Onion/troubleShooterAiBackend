import { db } from "#src/lib/prisma.js";
import logger from "#src/utils/logger.js";
export const getAllIssue = async (userId, orgId) => {
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
  const issueCategory = await db.issueCategory.findMany({
    where: {
      organizationId: orgId,
    },
  });
  if (issueCategory.length === 0) {
    const error = new Error(
      "Invalid organization id or no issue category for this organization found"
    );
    error.status = 404;
    throw error;
  }
  const issue = await db.issue.findMany({
    where: {
      organizationId: orgId,
    },
  });

  issueCategory.forEach((item) => {
    item.issue = [];
  });
  issue.map((issue)=>{
    issueCategory.find((item)=>{
      if(item.id===issue.categoryId){
        item.issue.push(issue)
      }
    })
  })
  
  return {issueByCategory:issueCategory,issues:issue,count:issue.length};
};
export const getIssue = async (userId, orgId, issueId) => {
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
  if (!issueId) {
    const error = new Error("Invalid id");
    error.status = 400;
    throw error;
  }
  const issue = await db.issue.findUnique({
    where: {
      id: issueId,
      organizationId: orgId,
    },
  });
  if (!issue) {
    const error = new Error(
      "Invalid issue id or no issue for this organization found"
    );
    error.status = 404;
    throw error;
  }
  return issue;
};

export const createIssue = async (userId, orgId, data) => {
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
  const { name, description, categoryId, imgUrl } = data;

  try {
    const issueCategory = await db.issueCategory.findMany({
      where: {
        organizationId: orgId,
      },
    });
    if (issueCategory.length === 0) {
      const error = new Error(
        "Invalid organization id or no issue category for this organization found"
      );
      error.status = 404;
      throw error;
    }
    const issue = await db.issue.create({
      data: {
        title: name,
        description: description,
        priority: "MEDIUM",

        categoryId: categoryId,
        imageUrl: imgUrl,
        organizationId: orgId,
        reportedById: userId,
      },
    });
    return issue;
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
};
export const getIssueCategory = async (userId, orgId) => {
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
    const issueCategory = await db.issueCategory.findMany({
      where: {
        organizationId: orgId,
      },
    });
    if (issueCategory.length === 0) {
      const error = new Error(
        "Invalid organization id or no issue category for this organization found"
      );
      error.status = 404;
      throw error;
    }
    return { category: issueCategory };
  } catch (error) {
    logger.error(error.message);
  }
};
