import { assigningIssue, decidingIssue, decidingStaff } from "#src/controllers/admin.controller.js";
import { authenticate } from "#src/middleware/auth.middleware.js";
import express from "express";
const router = express.Router();
router.use(authenticate)
router.post("/:orgId/decide-issue", decidingIssue);
router.post("/:orgId/decide-staff", decidingStaff);
router.post("/:orgId/assign-issue", assigningIssue);
export default router;