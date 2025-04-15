import { body, param } from "express-validator";
import { titleValidation, contentValidation } from "./commonValidations.js";

export const createBlogValidation = [titleValidation, contentValidation];

export const getBlogValidation = param("id")
  .notEmpty()
  .withMessage("BlogId is required");

export const commentValidation = body("content")
  .notEmpty()
  .withMessage("Comment must not be empty");
