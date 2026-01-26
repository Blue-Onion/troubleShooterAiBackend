import express from "express";
import {
  register,
  login,
  logout,
  getMe,
} from "#controllers/auth.controller.js";
import { authenticate } from "#middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
