import Blog from "../models/blog.model.js";
import Comment from "../models/comment.model.js";
import { ApiError } from "../services/ApiError.js";
import { ApiResponse } from "../services/ApiResponse.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

async function handleAddNew(req, res) {
  const result = validationResult(req);
  const { title, content } = req.body;
  if (!result.isEmpty()) {
    return res.status(400).json(new ApiError(400, result.array()));
  }

  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    return res.status(400).json(new ApiError(400, "Cover Image is Required"));
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage) {
    return res.status(401).json(new ApiError(401, "Image upload Error"));
  }

  try {
    const newBlog = await Blog.create({
      title,
      content,
      createdBy: req.userId,
      coverImage: coverImage.secure_url,
    });

    const response = await newBlog.save();
    if (!response) {
      return res
        .status(401)
        .json(new ApiError(401, "Unable to Create Blog in Database."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, response, "Blog Added Successfully"));
  } catch (error) {
    console.log("Error Adding Blog", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error, Error Adding Blog"));
  }
}

async function handleGetAllBlogs(req, res) {
  try {
    const response = await Blog.find({}).populate(
      "createdBy",
      "name email createdAt"
    );

    if (!response) {
      return res
        .status(401)
        .json(new ApiError(401, "Unable to get All Blog Posts."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, response, "All Blogs Fetched Successfully."));
  } catch (error) {
    console.log("Error getting all Blogs", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Internal Server Error, Error Getting All Blogs")
      );
  }
}

async function handleGetAllBlogsOfUser(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User Id is required"));
    }

    const response = await Blog.find({ createdBy: userId });

    if (!response) {
      return res
        .status(401)
        .json(new ApiError(401, "Unable to fetch blogs of user"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, response, "User Blogs fetched Successfully."));
  } catch (error) {
    console.log("Error in getting all blogs of specific user");
    return res
      .status(500)
      .json(new ApiError(500, "Error in getting all blogs of specific user"));
  }
}

async function handleGetBlog(req, res) {
  const { id } = req.params;

  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json(new ApiError(400, result.array()));
  }

  try {
    const response = await Blog.findById(id)
      .populate("createdBy", "name email createdAt")
      .populate("comments");

    if (!response) {
      return res
        .status(401)
        .json(new ApiError(401, "Unable to get Blog Details."));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, response, "Blog Details Fetched Successfully.")
      );
  } catch (error) {
    console.log("Error getting Blog details", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Internal Server Error, Error Getting Blog Details")
      );
  }
}

async function handleUpdate(req, res) {
  try {
    const { id } = req.params;
    const { title, content, coverImage } = req.body;

    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json(new ApiError(400, result.array()));
    }

    if (!id) {
      return res
        .status(400)
        .json(new ApiError(400, "Bad Request for updating Post"));
    }
    let newCoverImageUrl = coverImage;

    if (req.file) {
      const coverImageLocalPath = req.file.path;
      const uploadedImage = await uploadOnCloudinary(coverImageLocalPath);

      if (!uploadedImage) {
        return res.status(401).json(new ApiError(401, "Image upload error"));
      }

      newCoverImageUrl = uploadedImage.secure_url;
    }

    if (!newCoverImageUrl) {
      return res.status(400).json(new ApiError(400, "Cover Image is Required"));
    }

    const updatedPost = await Blog.findByIdAndUpdate(
      id,
      { title, content, coverImage: newCoverImageUrl },
      { new: true }
    );

    if (!updatedPost) {
      return res
        .status(401)
        .json(new ApiError(401, "Unable to update post in the database."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedPost, "Successfully updated post."));
  } catch (error) {
    console.log("Error in post updation", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error, error in blog updation"));
  }
}

async function handleDelete(req, res) {
  const { id } = req.params;

  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json(new ApiError(400, result.array()));
  }

  if (
    !id ||
    typeof id !== "string" ||
    id.trim().length !== 24 ||
    !mongoose.Types.ObjectId.isValid(id.trim())
  ) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Invalid ID format. Must be a 24-character hex string."
        )
      );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const objectId = new mongoose.Types.ObjectId(id.trim());

    const blog = await Blog.findById(objectId).session(session);
    if (!blog) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json(new ApiError(404, "Blog not found, unable to delete"));
    }

    await Comment.deleteMany({ _id: { $in: blog.comments } }).session(session);

    const deletedBlog = await Blog.findByIdAndDelete(objectId).session(session);

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(new ApiResponse(200, deletedBlog, "Successfully Deleted Post."));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in Post Deletion:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error, Error in Blog Deletion"));
  }
}

async function handleReaction(req, res) {
  const { id } = req.params;
  const { type } = req.body; // 'like' or 'dislike'
  const userId = req.userId;

  if (!["like", "dislike"].includes(type)) {
    return res.status(400).json(new ApiError(400, "Invalid reaction type"));
  }

  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json(new ApiError(404, "Blog Not Found"));

    const hasLiked = blog.likedBy.includes(userId);
    const hasDisliked = blog.dislikedBy.includes(userId);

    if (type === "like") {
      if (hasLiked) {
        blog.likes -= 1;
        blog.likedBy = blog.likedBy.filter((uid) => uid.toString() !== userId);
      } else {
        if (hasDisliked) {
          blog.disLikes -= 1;
          blog.dislikedBy = blog.dislikedBy.filter(
            (uid) => uid.toString() !== userId
          );
        }
        blog.likes += 1;
        blog.likedBy.push(userId);
      }
    }

    if (type === "dislike") {
      if (hasDisliked) {
        blog.disLikes -= 1;
        blog.dislikedBy = blog.dislikedBy.filter(
          (uid) => uid.toString() !== userId
        );
      } else {
        if (hasLiked) {
          blog.likes -= 1;
          blog.likedBy = blog.likedBy.filter(
            (uid) => uid.toString() !== userId
          );
        }
        blog.disLikes += 1;
        blog.dislikedBy.push(userId);
      }
    }

    const updatedBlog = await blog.save();
    return res
      .status(200)
      .json(new ApiResponse(200, updatedBlog, `${type} updated`, updatedBlog));
  } catch (error) {
    console.error(`Error in ${type} post:`, error);
    return res.status(500).json(new ApiError(500, `Error in ${type} post.`));
  }
}

async function handleAddComment(req, res) {
  const { content } = req.body;
  const { id } = req.params;

  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json(new ApiError(400, result.array()));
  }

  try {
    const newComment = new Comment({
      content: content,
      blogId: id,
      createdBy: req.userId,
    });
    const comment = await newComment.save();

    if (!comment) {
      return res
        .status(401)
        .json(new ApiError(401, "Unable to add Comment in  Database."));
    }

    const newBlog = await Blog.findByIdAndUpdate(id, {
      $push: { comments: comment._id },
    });

    if (!newBlog) {
      return res
        .status(401)
        .json(
          new ApiError(
            401,
            "Unable to update Comment in Blog Section Database."
          )
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Successfully added comment."));
  } catch (error) {
    console.log("Error in Adding Comment");
    return res
      .status(500)
      .json(
        new ApiError(500, "Internal Server Error, Error in Adding Comment")
      );
  }
}

async function handleGetAllComments(req, res) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json(new ApiError(400, result.array()));
  }

  try {
    const comments = await Comment.find({ blogId: req.params.id })
      .sort({ _id: -1 })
      .populate("createdBy");

    if (!comments) {
      return res
        .status(401)
        .json(new ApiError(401, "Unable to get all Comments from Database."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Successfully fetched comments."));
  } catch (error) {
    console.log("Error in getting all Comments");
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          "Internal Server Error, Error in getting all Comments"
        )
      );
  }
}

export {
  handleAddNew,
  handleUpdate,
  handleDelete,
  handleGetAllBlogs,
  handleAddComment,
  handleGetAllComments,
  handleGetBlog,
  handleGetAllBlogsOfUser,
  handleReaction,
};
