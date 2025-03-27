import express from "express";
import {
  handleAddNew,
  handleUpdate,
  handleDelete,
  handleGetAllBlogs,
  handleAddLike,
  handleAddDislike,
  handleAddComment,
  handleGetAllComments,
  handleGetBlog,
  handleGetAllBlogsOfUser,
} from "../controllers/blog.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/", verifyToken, upload.single("coverImage"), handleAddNew);

router.get("/", handleGetAllBlogs);

router.get("/userBlogs", verifyToken, handleGetAllBlogsOfUser);

router.get("/blog/:id", handleGetBlog);

router.put("/:id", verifyToken, upload.single("coverImage"), handleUpdate);

router.delete("/:id", verifyToken, handleDelete);

router.patch("/:id/like", verifyToken, handleAddLike);

router.patch("/:id/dislike", verifyToken, handleAddDislike);

router.post("/:id/comments", verifyToken, handleAddComment);

router.get("/:id/comments", handleGetAllComments);

export default router;
