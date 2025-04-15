import express from "express";
import {
  handleGetAllBlogs,
  handleGetBlog,
  handleGetAllComments,
} from "../../controllers/blog.controller.js";
import { getBlogValidation } from "../../validations/blogValidations.js";

const router = express.Router();

router.get("/", handleGetAllBlogs);
router.get("/blog/:id", getBlogValidation, handleGetBlog);
router.get("/:id/comments", getBlogValidation, handleGetAllComments);

export default router;
