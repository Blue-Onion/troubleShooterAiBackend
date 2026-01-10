import { db } from "#src/lib/prisma.js";
import logger from "#src/utils/logger.js";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
const ai = new GoogleGenAI({});
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
  issue.map((issue) => {
    issueCategory.find((item) => {
      if (item.id === issue.categoryId) {
        item.issue.push(issue);
      }
    });
  });

  return { issueByCategory: issueCategory, issues: issue, count: issue.length };
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
    throw error;
  }
};
export const getAiDesc = async (userId, orgId, image) => {
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
  if (!image) {
    const error = new Error("No image uploaded");
    error.status = 400;
    throw error;
  }

  try {
    const { category } = await getIssueCategory(userId, orgId);
    if (category.length === 0) {
      const error = new Error(
        "Invalid organization id or no issue category for this organization found"
      );
      error.status = 404;
      throw error;
    }
    const buffer = fs.readFileSync(image.path);
    const bs64str = buffer.toString("base64");
    const prompt = `
    You are an AI assistant helping generate issue reports from images.
    
    Analyze the provided image carefully and infer the issue shown.
    
    You MUST return a JSON object that strictly follows this schema:
    
    {
      "name": string | null,
      "description": string,
      "categoryId": string,
      "imgUrl": null
    }
    
    Rules:
    - "description" must clearly explain the problem shown in the image.
    - "name" should be a short title (max 100 characters). If unsure, return null.
    - "categoryId" MUST be selected ONLY from the issue categories provided below.
    - Choose the most relevant category based on the image context.
    - Do NOT invent categories.
    - Do NOT include explanations, markdown, or extra text.
    - Output ONLY valid JSON.
    
    Available issue categories:
    ${JSON.stringify(category, null, 2)}
    
    Return only the JSON object.
    `;
    const contents = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: bs64str,
        },
      },
      { text: prompt },
    ];

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    const response=result.candidates[0].content.parts[0].text;
    const cleanedText=response.replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
    const issue=JSON.parse(cleanedText)
    
    return issue


  } catch (error) {
    logger.error(error.message);
    throw error;
  }
};
