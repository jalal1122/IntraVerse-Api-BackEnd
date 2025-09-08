import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  // get the token from cookies or headers
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // if no token is provided, throw an error
  if (!token) {
    throw new ApiError(401, "Access token is required");
  }

  // verify the token
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  // find the user by id
  const user = await User.findById(decoded.id).select(
    "-password -refreshToken"
  );

  // if user is not found, throw an error
  if (!user) {
    throw new ApiError(401, "Invalid access token");
  }

  // attach user to request object
  req.user = user;

  // proceed to the next middleware
  next();
});

export default authMiddleware;
