import { db } from "#src/lib/prisma.js";
import logger from "#src/utils/logger.js";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
  logger.error("Missing GOOGLE_API_KEY or GEMINI_API_KEY environment variable");
  // Ensure the process exits or handles this gracefully depending on startup requirements
  // For now, we will log the error. In a strict environment, we might want to throw or exit.
}

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
});
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
    const staff = await db.membership.findUnique({
      where: { id: staffId, organizationId: orgId },
    });
    if (!staff) {
      const error = new Error("Staff not found");
      error.status = 404;
      throw error;
    }
    return staff;
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
        where: {
          organizationId: orgId,
          role: "STAFF",
          jobCategoryId: categoryId,
        },
      });
    } else {
      staffs = await db.membership.findMany({
        where: { organizationId: orgId, role: "STAFF" },
      });
    }
    if (staffs.length === 0 && categoryId.length != 0) {
      const error = new Error("Staff not found in this category");
      error.status = 404;
      throw error;
    }
    if (staffs.length === 0 && categoryId.length == 0) {
      const error = new Error("Staff not found");
      error.status = 404;
      throw error;
    }
    return staffs;
  } catch (error) {
    logger.error("Error getting staff:", error);
    throw error;
  }
};
export const getAssingedIssue = async (orgId, staffId, id) => {
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
  if (!id) {
    const error = new Error("Issue id is required");
    error.status = 400;
    throw error;
  }
  try {
    const issues = await db.issue.findUnique({
      where: { organizationId: orgId, assignedToMembershipId: staffId, id: id },
    });
    if (!issues) {
      const error = new Error("Issue not found");
      error.status = 404;
      throw error;
    }
    return issues;
  } catch (error) {
    logger.error("Error getting assinged issues:", error);
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
      where: { organizationId: orgId, assignedToMembershipId: staffId },
    });
    return issues;
  } catch (error) {
    logger.error("Error getting assinged issues:", error);
    throw error;
  }
};
export const setIssueStatus = async (orgId, staffId, id, status) => {
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
  if (!id) {
    const error = new Error("Issue id is required");
    error.status = 400;
    throw error;
  }
  if (!status) {
    const error = new Error("Status is required");
    error.status = 400;
    throw error;
  }
  const validStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    const error = new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    );
    error.status = 400;
    throw error;
  }

  try {
    const issues = await db.issue.update({
      where: { organizationId: orgId, assignedToMembershipId: staffId, id: id },
      data: {
        status: status,
        staffVerdict: status,
      },
    });
    return issues;
  } catch (error) {
    logger.error("Error setting issue status:", error);
    throw error;
  }
};
export const getAiSuggestion = async (orgId, staffId, id) => {
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
  if (!id) {
    const error = new Error("Issue id is required");
    error.status = 400;
    throw error;
  }
  try {
    const issue = await db.issue.findFirst({
      where: {
        id: id,
        organizationId: orgId,
        assignedToMembershipId: staffId,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!issue) {
      const error = new Error("Issue not found");
      error.status = 404;
      throw error;
    }

    // Sanitize inputs to prevent prompt injection
    // (Basic sanitization - in production use a more robust library if needed)
    const safeTitle = JSON.stringify(issue.title);
    const safeDescription = JSON.stringify(issue.description);

    const prompt = `
        You are a senior ${issue.category.name} engineer.
        
        Analyze the following issue and respond ONLY in valid JSON.
        
        Issue Title:
        ${safeTitle}
        
        Issue Description:
        ${safeDescription}
        
        Return the response strictly in this format:
        
        {
          "summary": "short explanation of the problem",
          "possible_causes": ["cause 1", "cause 2"],
          "solution_steps": ["step 1", "step 2", "step 3"],
          "tools_or_technologies": ["tool 1", "tool 2"],
          "confidence": 0.0
        }
        
        Rules:
        - Return ONLY JSON.
        - Do NOT include markdown.
        - Do NOT include explanations outside JSON.
        - confidence must be between 0 and 1.
        `;
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });
    const response = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!response) {
      const error = new Error("AI suggestion not found");
      error.status = 404;
      throw error;
    }
    const cleanedText = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const aiSuggestion = JSON.parse(cleanedText);
    return aiSuggestion;
  } catch (error) {
    logger.error("Error getting ai suggestion:", error);
    throw error;
  }
};
