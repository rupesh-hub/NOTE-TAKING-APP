import express from "express";
const router = express.Router();
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";
import { profile, changeProfilePicture, updateProfile, changePasswordRequest, changePassword, fetchByEmail  } from "../controller/user.controller.js";

router.get("/profile", authenticationMiddleware, profile);

router.put(
  "/change-profile-picture",
  authenticationMiddleware,
  changeProfilePicture
);

router.put("/update-profile", authenticationMiddleware, updateProfile);

router.get(
  "/change-password-request",
  authenticationMiddleware,
  changePasswordRequest
);
router.put("/change-password", authenticationMiddleware, changePassword);

router.get("/:email", fetchByEmail);

export default router;
