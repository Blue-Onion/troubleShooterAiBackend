import { gettingAllOrg, gettingOrg, creatingOrg, joiningOrg } from "#src/controllers/org.controller.js";
import { authenticate } from "#src/middleware/auth.middleware.js";
import express from "express"

const router=express.Router();
router.use(authenticate)
router.get("/get-org/:id", gettingOrg);
router.get("/get-org", gettingAllOrg);
router.post("/create-org",creatingOrg);
router.post("/join-org", joiningOrg);
export default router
