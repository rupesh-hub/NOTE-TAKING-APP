import { User } from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateVerificationCode } from "../../util/generate-verification-code.js";
import { generateTokenAndSetCookie } from "../../util/generate-token-and-set-cookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendResetSuccessEmail,
} from "../../mailtrap/email.js";
import { profileUpload } from "../../multer/multer.configuration.js";
import path from "path";
import fs from "fs";
import multer from "multer";
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "profiles");

export const register = async (req, res) => {
  profileUpload(req, res, async (error) => {
    try {
      // Handle upload errors
      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: "File upload error: " + error.message,
        });
      } else if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      const {
        firstName,
        middleName = null,
        lastName,
        email,
        password,
        confirmPassword
      } = req.body;

      //validate password and confirm password

      // Validate required fields
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "All fields are required.",
        });
      }

      if(password != confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match.",
        });
      }

      // Check for existing email
      const isEmailAlreadyUsed = await User.findOne({ email });
      if (isEmailAlreadyUsed) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Email already in use.",
        });
      }

      // Hash the password
      const hashPassword = await bcryptjs.hash(password, 10);

      // Generate verification token
      const verificationToken = generateVerificationCode();

      // Create new user
      const user = new User({
        firstName,
        middleName,
        lastName,
        email,
        password: hashPassword,
        profile: req.file ? req.file.filename : null,
        verificationToken: verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      // Save the user in the database
      await user.save();

      // Send verification email
      const name = user.firstName + " " + user.lastName;
      //await sendVerificationEmail(user.email, name, verificationToken);

      // Generate token and set cookie
      const token = generateTokenAndSetCookie(res, user);
      console.log(token);

      // Respond with success
      res.status(201).json({
        success: true,
        message: "User registered successfully.",
        access_token: token,
        user: {
          ...user._doc,
          profile: user.profile ? `/uploads/profiles/${user.profile}` : null,
          password: undefined,
        },
      });
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  });
};

export const verifyEmail = async (req, res) => {
  const { token, email } = req.body;
  try {
    const user = await User.findOne({ email: email, verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token.",
      });
    }

    if (Date.now() > user.verificationTokenExpiresAt) {
      return res
        .status(400)
        .json({ success: false, message: "Verification token expired." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;
    await user.save();

    const name = user.firstName + " " + user.lastName;
    await sendWelcomeEmail(user.email, name);

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

export const authenticate = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });
    }
    const token = generateTokenAndSetCookie(res, user);

    user.lastLogin = new Date();
    await user.save();

    const response = {
      _id: user._id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      name: user.firstName + " " + user.lastName,
      email: user.email,
      profile: `/api/v1.0.0/uploads/profiles/${user.profile}`,
      lastLogin: user.lastLogin,
    };

    console.log(response);

    res.json({
      success: true,
      message: "Login successful",
      access_token: token,
      user: response,
    });
  } catch (error) {
    console.log(`Error in authentication: `, error.message);
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email });

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
      `${process.env.CLIENT_URL}/auth/reset-password/${user.resetPasswordToken}`
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

export const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or expired token." });
    }

    if (Date.now() > user.resetPasswordExpiresAt) {
      return res
        .status(400)
        .json({ success: false, message: "Token already expired." });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    const name = user.firstName + " " + user.lastName;

    await sendResetSuccessEmail(user.email, name);
    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while resetting password.",
    });
  }
};

export const checkAuthentication = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found." });
    }

    res.json({
      success: true,
      user: {
        ...user._doc, // Spread the user document
        password: undefined, // Remove sensitive data
        profile: user.profile ? `/api/v1.0.0/uploads/${user.profile}` : null, // Format profile URL
      },
    });
  } catch (error) {
    console.error("Error in checkAuthentication:", error); // Log the error for debugging
    res
      .status(500)
      .json({ success: false, message: "Server error while checking" });
  }
};
