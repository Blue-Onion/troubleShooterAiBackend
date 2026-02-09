import {
  getAiSuggestioning,
  getingStaff,
  getingStaffById,
  settingIssueStatus,
} from "#src/controllers/staff.controller.js";
import { authenticate } from "#src/middleware/auth.middleware.js";
import { getAssingedIssues } from "#src/services/staff.service.js";
import express from "express";
const router = express.Router();
router.use(authenticate);
router.get("/getStaffs", getingStaff);
router.get("/getStaff/:id", getingStaffById);
router.get("/:staffId/getIssues", getAssingedIssues);
router.post("/:staffId/setIssueStatus/:id", settingIssueStatus);
router.get("/:staffId/getAiSuggestion/:id", getAiSuggestioning);

export default router;
