import { ApiResponse } from "../services/ApiResponse.js";
import { ApiError } from "../services/ApiError.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateVerificationCode } from "../services/generateVerificationCode.js";
import { generateToken } from "../services/generateToken.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordSuccessEmail,
} from "../mailTrap/email.js";
import crypto from "node:crypto";
import { validationResult } from "express-validator";

export const handleSignup = async (req, res) => {
  const { email, password, name } = req.body;

  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json(new ApiError(400, result.array()));
  }

  try {
    const isUserAlreadyExists = await User.findOne({ email });

    if (isUserAlreadyExists) {
      return res
        .status(401)
        .json(new ApiError(401, "User with Same Email Already Exists"));
    }
    const hashedPassword = await bcryptjs.hash(String(password), 10);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = Date.now() + 24 * 60 * 60 * 1000;

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      verificationToken: verificationCode,
      verificationTokenExpiresAt: verificationCodeExpiry,
    });

    const user = await newUser.save();

    if (!user) {
      return res.status(401).json(new ApiError(401, "Error User SignUp"));
    }

    const token = generateTokenAndSetCookie(res, user._id);

    // await sendVerificationEmail(user.email, user.verificationToken);

    if (!token) {
      console.log("Error Generating and setting Token");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          userId: user._id,
          name: user.name,
          email: user.email,
        },
        "User SignUp Successfully."
      )
    );
  } catch (error) {
    console.log("Error SignUp", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error, Error User SignUp"));
  }
};

export const handleVerifyEmail = async (req, res) => {
  const { code } = req.body;

  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json(new ApiError(400, result.array()));
  }

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json(new ApiError(400, "Invalid or Expired Verification Code."));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    const updatedUser = await user.save();

    if (!updatedUser) {
      return res.status(403).json(new ApiError(403, "Error Verifying User"));
    }

    await sendWelcomeEmail(user.email, user.name);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          ...updatedUser._doc,
          password: undefined,
        },
        "Verification Successfull"
      )
    );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error Verification Email"));
  }
};

export const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json(new ApiError(400, result.array()));
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json(new ApiError(401, "User not Found"));
    }

    const isPasswordValid = await bcryptjs.compare(
      String(password),
      user.password
    );

    if (!isPasswordValid) {
      return res.status(403).json(new ApiError(403, "Invalid Password."));
    }

    const token = generateToken(user._id);

    user.lastLogin = new Date();
    const updatedUser = await user.save();
    if (!updatedUser) {
      return res
        .status(401)
        .json(new ApiError(401, "Error Updating Last Login."));
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          ...updatedUser._doc,
          password: undefined,
          token: token,
        },
        "Login Successfully"
      )
    );
  } catch (error) {
    console.log("Error in Logging User", error);
    return res.status(500).json(new ApiError(500, "Error in Logging User"));
  }
};

export const handleLogout = async (req, res) => {
  try {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User Logout Successfully"));
  } catch (error) {
    console.log("Error in Logging Out User", error);
    return res.status(500).json(new ApiError(500, "User Logout Error"));
  }
};

export const handleForgotPassword = async (req, res) => {
  const { email } = req.body;

  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json(new ApiError(400, result.array()));
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json(new ApiError(401, "User Not Found."));
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    const updatedUser = await user.save();

    if (!updatedUser) {
      return res
        .status(402)
        .json(
          new ApiError(
            402,
            "Error Saving Reset token and reset token expiry in DB."
          )
        );
    }

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, "Password Reset Link Sent to your Email.")
      );
  } catch (error) {
    console.log("Error Forgot Password", error);
    return res.status(500).json(new ApiError(500, "Error Forgot Password."));
  }
};

export const handleResetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json(new ApiError(400, result.array()));
  }

  try {
    const user = await User.findOne({ resetPasswordToken: token });

    if (!user) {
      return res.status(401).json(new ApiError(401, "User not Found."));
    }

    if (user.resetPasswordExpiresAt < Date.now()) {
      return res
        .status(401)
        .json(new ApiError(401, "Reset Password Token is Expired."));
    }

    const hashedPassword = await bcryptjs.hash(String(password), 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    const updatedUser = await user.save();

    if (!updatedUser) {
      return res
        .status(401)
        .json(new ApiError(401, "Error in reset new Password saving."));
    }

    await sendPasswordSuccessEmail(user.email);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          ...updatedUser._doc,
          password: undefined,
        },
        "Password Reset Successfully."
      )
    );
  } catch (error) {
    console.log("Error in Reset Password", error);
    return res.status(500).json(new ApiError(500, "Error in Reset Password."));
  }
};

export const handleCheckAuth = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    console.log(user);
    if (!user) {
      return res.status(401).json(new ApiError(401, "User Not Found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User Authenticated"));
  } catch (error) {
    console.log("Error in checking Authentication");
    return res
      .status(500)
      .json(new ApiError(500, "Error in checking Authentication"));
  }
};
