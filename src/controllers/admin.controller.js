import { assignIssue, decideIssue, decideRequest, getPendingApplicants } from "#src/services/admin.service.js";
import logger from "#src/utils/logger.js";
import {
    assigningIssueSchema,
  decideIssueSchema,
  decideStaffSchema,
} from "#src/validations/admin.validation.js";


export const decidingIssue = async (req, res) => {
  const userId = req.user?.id;
  const orgId = req.params?.orgId;
  if (!userId) {
    return res.status(400).json({
      error: "Missing user ID",
    });
  }
  if (!orgId) {
    return res.status(400).json({
      error: "Missing organization ID",
    });
  }

  try {
    const { id, decision, priority } = decideIssueSchema.parse(req.body);

    const verdict = await decideIssue(userId, orgId, id, decision, priority);
    return res.status(200).json({
      success: true,
      message: "Issue decided successfully",
      data: verdict,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      const JsonErr = JSON.parse(error.message);
      return res.status(400).json({
        error: JsonErr.map((err) => {
          return err.message;
        }),
      });
    }
    res.status(error.status || 500).json({ error: error.message });
  }
};
export const decidingStaff = async (req, res) => {
    const userId = req.user?.id;
    const orgId = req.params?.orgId;
    if (!userId) {
        return res.status(400).json({
          error: "Missing user ID",
        });
      }
      if (!orgId) {
        return res.status(400).json({
          error: "Missing organization ID",
        });
      }
  try {
    const { id, decision } = decideStaffSchema.parse(req.body);
    const verdict = await decideRequest(userId, orgId, id, decision);
    return res.status(200).json({
      
      message: "Staff decided successfully",
      data: verdict,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      const JsonErr = JSON.parse(error.message);
      return res.status(400).json({
        error: JsonErr.map((err) => {
          return err.message;
        }),
      });
    }
    res.status(error.status || 500).json({ error: error.message });
  }
};
export const assigningIssue = async (req, res) => {
    const userId = req.user?.id;
    const orgId = req.params?.orgId;
    if (!userId) {
        return res.status(400).json({
          error: "Missing user ID",
        });
      }
      if (!orgId) {
        return res.status(400).json({
          error: "Missing organization ID",
        });
      }
  try {
    const { id, staffId } = assigningIssueSchema.parse(req.body);
    const verdict = await assignIssue(userId, orgId, id, staffId);
    return res.status(200).json({
      
      message: "Issue assigned successfully",
      data: verdict,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      const JsonErr = JSON.parse(error.message);
      return res.status(400).json({
        error: JsonErr.map((err) => {
          return err.message;
        }),
      });
    }
    res.status(error.status || 500).json({ error: error.message });
  }
};
export const pendingApplicants = async (req, res) => {
    const userId = req.user?.id;
    const orgId = req.params?.orgId;
    if (!userId) {
      return res.status(400).json({
        error: "Missing user ID",
      });
    }
    if (!orgId) {
      return res.status(400).json({
        error: "Missing organization ID",
      });
    }
    
  try {
    const verdict = await getPendingApplicants(userId, orgId);
    return res.status(200).json({
      
      message: "Pending applicants fetched successfully",
      data: verdict,
    });
  } catch (error) {
    logger.error(error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
};
