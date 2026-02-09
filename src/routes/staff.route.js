import { authenticate } from "#src/middleware/auth.middleware.js";
import express from "express";
const router = express.Router();
router.get("/:orgId/getStaffs", (req, res) => {
    res.send("Staff")
})
router.get("/:orgId/getStaff/:id", (req, res) => {
    res.send("Staff")
})
router.get("/:orgId/getIssues", (req, res) => {
    res.send("Staff")
})
router.get("/:orgId/getIssue/:id", (req, res) => {
    res.send("Staff")
})

router.use(authenticate)
export default router