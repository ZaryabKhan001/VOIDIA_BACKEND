import express from "express";
import {
  handleAddNew,
  handleGetAllBlogsOfUser,
  handleUpdate,
  handleDelete,
  handleReaction,
  handleAddComment,
} from "../../controllers/blog.controller.js";

import {
  createBlogValidation,
  getBlogValidation,
  commentValidation,
} from "../../validations/blogValidations.js";

import { upload } from "../../middlewares/multer.middleware.js";

const router = express.Router();

//validations
const withBlogValidation = [createBlogValidation];

const withImageUpload = [upload.single("coverImage")];

const withBlogIdValidation = [getBlogValidation];

const withCommentValidation = [getBlogValidation, commentValidation];

//routes
router.post("/", withImageUpload, withBlogValidation, handleAddNew);

router.get("/userBlogs", handleGetAllBlogsOfUser);

router.put(
  "/:id",
  withImageUpload,
  withBlogIdValidation,
  withBlogValidation,
  handleUpdate
);

router.delete("/:id", withBlogIdValidation, handleDelete);

router.patch("/:id/reaction", withBlogIdValidation, handleReaction);

router.post("/:id/comments", ...withCommentValidation, handleAddComment);

export default router;
