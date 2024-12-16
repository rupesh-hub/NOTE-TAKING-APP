import express from "express";

import {
  authenticate,
  logout,
  register,
  verifyEmail,
  forgetPassword,
  resetPassword,
  checkAuthentication
} from "../controller/auth.controller.js";

import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/authenticate", authenticate);
router.post("/logout", authenticationMiddleware, logout);
router.post("/verify-email", verifyEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.get(
  "/check-authentication",
  authenticationMiddleware,
  checkAuthentication
);

export default router;
