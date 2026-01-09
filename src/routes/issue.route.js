import { authenticate } from "#src/middleware/auth.middleware.js";
import express from "express";

const router=express.Router();

router.use(authenticate)