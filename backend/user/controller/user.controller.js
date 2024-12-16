import { User } from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import {
  sendResetPasswordEmail,
  sendResetSuccessEmail,
} from "../../mailtrap/email.js";
import { profileUpload } from "../../multer/multer.configuration.js";
import path from "path";
import { Project } from "../../project/model/project.model.js";
import { Collaborator } from "../../collaborator/model/collaborator.model.js";
import { deleteFile } from "../../multer/file-management.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "profiles");

export const profile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized user." });
    }

    const profile = await User.findOne({ email: user.email });

    if (!profile) {
      res
        .status(404)
        .success(false)
        .message("User not exists database.")
        .timestamp(new Date());
    }

    // Fetch projects created by the user
    const createdProjects = await Project.find({ createdBy: user.userId })
      .select("title description status createdAt")
      .exec();

    // Fetch projects where the user is a collaborator
    const collaboratorData = await Collaborator.findOne({ userId: user.userId })
      .populate({
        path: "projects",
        select: "title description status createdAt",
      })
      .exec();

    const collaboratedProjects = collaboratorData?.projects || [];

    // Return combined response
    return res.status(200).json({
      success: true,
      data: {
        profile: {
          userId: profile.userId,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          name: profile.firstName + " " + profile.lastName,
          profile: `${process.env.CONTEXT_PATH}/uploads/profiles/${profile.profile}`,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
        createdProjects,
        collaboratedProjects,
      },
    });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const changePasswordRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const name = user.firstName + " " + user.lastName;

    await sendResetPasswordEmail(
      user.email,
      name,
      `${process.env.CLIENT_URL}/home/users/change-password/${user.resetPasswordToken}`
    );

    res.status(200).json({
      success: true,
      message: "Reset password link sent successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while resetting password.",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is missing.",
      });
    }

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password, and new password are missing.",
      });
    }

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    // Check if token has expired
    if (Date.now() > user.resetPasswordExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Token has expired. Please request a new password reset.",
      });
    }

    // Verify old password
    const isOldPasswordValid = await bcryptjs.compare(
      oldPassword,
      user.password
    );
    if (!isOldPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    // Verify old password
    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password can not be same.",
      });
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update user's password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;

    // Save user
    await user.save();

    // Send success email
    const name = `${user.firstName} ${user.lastName}`;
    await sendResetSuccessEmail(user.email, name);

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting the password.",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, middleName, lastName } = req.body;
    const { email } = req.user;

    // Validate request body
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: firstName, lastName.",
      });
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { firstName, middleName, lastName, updatedAt: new Date()},
      { new: true } // Return updated document
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "Profile update success.",
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: updatedUser.firstName + " " + updatedUser.lastName,
        email: updatedUser.email,
        profile: updatedUser.profile
          ? `/api/v1.0.0/uploads/profiles/${updatedUser.profile}`
          : null,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile.",
    });
  }
};

export const changeProfilePicture = async (req, res) => {
  profileUpload(req, res, async (error) => {
    try {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user) {
        if (req.file) deleteFile(path.join(UPLOAD_DIR, req.file.filename));
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Delete old profile picture if it exists
      if (user.profile) {
        const oldFilePath = path.join(UPLOAD_DIR, user.profile);
        deleteFile(oldFilePath);
      }

      // Save the new profile picture path
      user.profile = req.file.filename;
      user.updatedAt = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile picture updated successfully.",
        profile: user.profile
          ? `/api/v1.0.0/uploads/profiles/${user.profile}`
          : null,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({
        success: false,
        message: "Server error while changing profile picture.",
      });
    }
  });
};

export const fetchByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.json({
      success: true,
      user: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        profile: user.profile
          ? `/api/v1.0.0/uploads/profiles/${user.profile}`
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user by email.",
    });
  }
};
