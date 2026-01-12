import { assignIssue, decideIssue, decideRequest } from "#src/services/admin.service.js";
import logger from "#src/utils/logger.js";
import {
    assigningIssueSchema,
  decideIssueSchema,
  decideStaffSchema,
} from "#src/validations/admin.validation.js";

export const decidingIssue = async (req, res) => {
  const userId = req.body.userId;
  const orgId = req.body.orgId;
  try {
    const { id, decision, priority } = decideIssueSchema.parse(req.body);
    const verdict = await decideIssue(userId, orgId, id, decision, priority);
    return res.status(200).json({
      success: true,
      message: "Issue decided successfully",
      data: verdict,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(error.status || 400).json({
      success: false,
      message: error.message,
    });
  }
};
export const decidingStaff = async (req, res) => {
  const userId = req.body.userId;
  const orgId = req.body.orgId;
  try {
    const { id, decision } = decideStaffSchema.parse(req.body);
    const verdict = await decideRequest(userId, orgId, id, decision);
    return res.status(200).json({
      success: true,
      message: "Staff decided successfully",
      data: verdict,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(error.status || 400).json({
      success: false,
      message: error.message,
    });
  }
};
export const assigningIssue = async (req, res) => {
  const userId = req.body.userId;
  const orgId = req.body.orgId;
  try {
    const { id, staffId } = assigningIssueSchema.parse(req.body);
    const verdict = await assignIssue(userId, orgId, id, staffId);
    return res.status(200).json({
      success: true,
      message: "Issue assigned successfully",
      data: verdict,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(error.status || 400).json({
      success: false,
      message: error.message,
    });
  }
};
