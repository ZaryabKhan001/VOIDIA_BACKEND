import express from "express";
import {
  handleSignup,
  handleVerifyEmail,
  handleLogin,
  handleLogout,
  handleForgotPassword,
  handleResetPassword,
  handleCheckAuth,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  newPasswordValidation,
  resetTokenValidation,
  forgotPasswordValidation,
} from "../validations/authValidations.js";

const router = express.Router();

// Protected Routes
router.get("/check-auth", verifyToken, handleCheckAuth);

// Public Routes
router.post("/signup", registerValidation, handleSignup);

router.post("/verify-email", verifyEmailValidation, handleVerifyEmail);

router.post("/login", loginValidation, handleLogin);

router.post("/logout", handleLogout);

router.post("/forgot-password", forgotPasswordValidation, handleForgotPassword);

router.post(
  "/reset-password/:token",
  newPasswordValidation,
  resetTokenValidation,
  handleResetPassword
);

export default router;
