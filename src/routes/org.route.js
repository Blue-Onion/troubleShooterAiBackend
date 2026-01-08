import { gettingAllOrg, gettingOrg, creatingOrg, joiningOrg } from "#src/controllers/org.controller.js";
import express from "express"

const router=express.Router();

router.get("/get-all-org", gettingAllOrg);
router.get("/get-org/:id", gettingOrg);
router.post("/create-org", creatingOrg);
router.post("/join-org/:id", joiningOrg);

export default router