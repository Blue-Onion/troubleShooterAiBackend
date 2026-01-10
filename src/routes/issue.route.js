import { creatingIssue, gettingAiDesc, gettingIssues } from "#src/controllers/issue.controller.js";
import { authenticate } from "#src/middleware/auth.middleware.js";
import express from "express";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
const router=express.Router();

router.use(authenticate)
router.post(
    "/create-issue/:orgId",

    creatingIssue
  )
router.get(
    "/get-issues/:orgId",
    gettingIssues
  )
router.get(
    "/get-issue/:orgId/:issueId",
    gettingIssues
  )
router.post(
    "/get-ai-desc/:orgId",
    upload.single("image"),
    gettingAiDesc
    )
export default router
