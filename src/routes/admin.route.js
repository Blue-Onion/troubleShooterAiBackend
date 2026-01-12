import { assigningIssue, decidingIssue, decidingStaff } from "#src/controllers/admin.controller.js";
import express from "express";

const router = express.Router();
router.post("/decide-issue", decidingIssue);
router.post("/decide-staff", decidingStaff);
router.post("/assign-issue", assigningIssue);
export default router;