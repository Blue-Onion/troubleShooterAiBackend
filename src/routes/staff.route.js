import {
  getAiSuggestioning,
  getingStaff,
  getingStaffById,
  settingIssueStatus,
  gettingAssingedIssues,
} from "#src/controllers/staff.controller.js";
import { authenticate } from "#src/middleware/auth.middleware.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get("/", getingStaff);
router.get("/:staffId", getingStaffById);
router.get("/:staffId/issues", gettingAssingedIssues);
router.post("/:staffId/issues/:id/status", settingIssueStatus);
router.get("/:staffId/issues/:id/ai-suggestion", getAiSuggestioning);

export default router;
