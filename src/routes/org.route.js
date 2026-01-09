import { gettingAllOrg, gettingOrg, creatingOrg, joiningOrg, deletingOrg, leavingOrg } from "#src/controllers/org.controller.js";
import { authenticate } from "#src/middleware/auth.middleware.js";
import express from "express"

const router=express.Router();
router.use(authenticate)

router.get("/get-org/:id", gettingOrg);

router.delete("/delete-org/:id", deletingOrg);

router.get("/get-org", gettingAllOrg);

router.post("/create-org",creatingOrg);

router.post("/join-org/:id", joiningOrg);

router.delete("/leave-org/:id", leavingOrg);
export default router
