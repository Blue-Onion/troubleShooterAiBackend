import {
  getAiSuggestion,
  getAssingedIssues,
  getStaff,
  getStaffById,
  setIssueStatus,
} from "#src/services/staff.service.js";
import logger from "#src/utils/logger.js";

export const getingStaffById = async (req, res) => {
  try {
    const { orgId, staffId } = req.params;
    const staff = await getStaffById(orgId, staffId);
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    logger.error("Error getting staff by id:", error);
    return res.status(error.status || 500).json({
      error: error.message,
    });
  }
};
export const getingStaff = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { categoryId = "" } = req.query;
    const staff = await getStaff(orgId, categoryId);
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    logger.error("Error getting staff by id:", error);
    return res.status(error.status || 500).json({
      error: error.message,
    });
  }
};
export const gettingAssingedIssues = async (req, res) => {
  try {
    const { orgId, staffId } = req.params;
    const staff = await getAssingedIssues(orgId, staffId);
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    logger.error("Error getting assinged issues:", error);
    return res.status(error.status || 500).json({
      error: error.message,
    });
  }
};
export const settingIssueStatus = async (req, res) => {
  try {
    const { orgId, staffId, id } = req.params;
    const { status } = req.body;
    const staff = await setIssueStatus(orgId, staffId, id, status);
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    logger.error("Error setting issue status:", error);
    return res.status(error.status || 500).json({
      error: error.message,
    });
  }
};
export const getAiSuggestioning = async (req, res) => {
  try {
    const { orgId, staffId, id } = req.params;
    const staff = await getAiSuggestion(orgId, staffId, id);
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    logger.error("Error getting ai suggestion:", error);
    return res.status(error.status || 500).json({
      error: error.message,
    });
  }
};
