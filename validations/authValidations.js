import { body, param } from "express-validator";
import {
  nameValidation,
  emailValidation,
  passwordValidation,
} from "./commonValidations.js";

export const registerValidation = [
  nameValidation,
  emailValidation,
  passwordValidation,
];

export const verifyEmailValidation = body("code")
  .notEmpty()
  .withMessage("Verify Code is required");

export const forgotPasswordValidation = body("email")
  .notEmpty()
  .withMessage("Email is required")
  .bail()
  .isEmail()
  .withMessage("Please Provide a Valid Email Address");

export const newPasswordValidation = body("password")
  .notEmpty()
  .withMessage("Password is required")
  .bail()
  .isLength({ min: 6 })
  .withMessage("Password must be atleast 6 characters");

export const resetTokenValidation = param("token")
  .notEmpty()
  .withMessage("Token is required");

export const loginValidation = [emailValidation, passwordValidation];
