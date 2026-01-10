import { creatingIssue, gettingIssues } from "#src/controllers/issue.controller.js";
import { authenticate } from "#src/middleware/auth.middleware.js";
import express from "express";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
const router=express.Router();

router.use(authenticate)
router.post(
    "/create-issue/:orgId",
    upload.single("image"),   
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
export default router
