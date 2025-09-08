import asyncHandler from "../utils/asyncHandler.js";
import Comment from "../models/comments.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Create a new comment
const makeComment = asyncHandler(async (req, res) => {
  // get the postId from params
  const postId = req.params.postId;

  // if the postId is not present, return an error
  if (!postId) {
    throw new ApiError(400, "Post ID is required");
  }

  // get the user Name from the request body
  const {userName} = req.body;

  // if the userName is not present, return an error
  if (!userName) {
    throw new ApiError(400, "User Name is required");
  }

  // get the comment text from the request body
  const { text } = req.body;

  // if the text is not present, return an error
  if (!text) {
    throw new ApiError(400, "Comment text cannot be empty");
  }

  // create a new comment
  const comment = await Comment.create({
    postId,
    userName,
    text,
  });

  //   if the comment is not created, return an error
  if (!comment) {
    throw new ApiError(500, "Failed to create comment");
  }

  // now respond with the created comment
  res
    .status(201)
    .json(new ApiResponse(201, "Comment created successfully", comment));
});

// Get all comments for a post
const getComments = asyncHandler(async (req, res) => {
  // get the postId from params
  const postId = req.params.postId;

  // if the postId is not present, return an error
  if (!postId) {
    throw new ApiError(400, "Post ID is required");
  }

  // get all comments for the post
  const comments = await Comment.find({ postId })
    .sort({ createdAt: -1 }); // sort comments by createdAt in descending order

  // if no comments found, return an empty array
  if (!comments || comments.length === 0) {
    return res.status(200).json(new ApiResponse(200, "No comments found", []));
  }

  // respond with the comments
  res
    .status(200)
    .json(new ApiResponse(200, "Comments retrieved successfully", comments));
});

export { makeComment, getComments };
