import { body } from "express-validator";

export const nameValidation = body("name")
  .notEmpty()
  .withMessage("Name is Required");

export const emailValidation = body("email")
  .notEmpty()
  .withMessage("Email is required")
  .bail()
  .isEmail()
  .withMessage("Please Enter a Valid Email Address");

export const passwordValidation = body("password")
  .notEmpty()
  .withMessage("Password is required")
  .bail()
  .isLength({ min: 6 })
  .withMessage("Password must be atleast 6 characters long");

export const titleValidation = body("title")
  .notEmpty()
  .withMessage("Title is required")
  .bail()
  .isLength({ min: 3 })
  .withMessage("Title must be at least 3 characters long");

export const contentValidation = body("content")
  .notEmpty()
  .withMessage("Content is required")
  .bail()
  .isLength({ min: 10 })
  .withMessage("Content must be atleast 10 characters long.");
