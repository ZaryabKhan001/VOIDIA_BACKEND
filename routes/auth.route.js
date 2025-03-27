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

const router = express.Router();

router.get("/check-auth", verifyToken, handleCheckAuth);

router.post("/signup", handleSignup);

router.post("/verify-email", handleVerifyEmail);

router.post("/login", handleLogin);

router.post("/logout", handleLogout);

router.post("/forgot-password", handleForgotPassword);

router.post("/reset-password/:token", handleResetPassword);

export default router;
