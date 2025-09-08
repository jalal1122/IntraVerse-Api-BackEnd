import { v2 as cloudinary } from "cloudinary";
import ApiError from "./ApiError.js";
import fs from "fs";

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (filePath) => {
  // using try catch to handle errors
  try {
    console.log("Attempting to upload file to Cloudinary:", filePath);

    // Configure Cloudinary with api keys and secrets from environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log("Cloudinary config:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? "***SET***" : "NOT SET",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "***SET***" : "NOT SET",
    });

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", // Automatically determine the resource type
      folder: "Blogify", // Specify the folder in Cloudinary where the file will be stored
    });

    // If the upload is successful, return the result
    if (!result || !result.secure_url) {
      throw new ApiError(500, "Failed to upload file to Cloudinary");
    }

    // Optionally, delete the file from the local filesystem after uploading
    try {
      fs.unlinkSync(filePath);
      console.log("File deleted from local filesystem successfully.", filePath);
    } catch (error) {
      console.error("Error deleting file from local filesystem:", error);
    }

    console.log("File uploaded to Cloudinary successfully:", result.secure_url);

    return result; // Return the result of the upload
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath); // Delete the file if it exists
        console.log("File deleted after upload failure:", filePath);
      } catch (deleteError) {
        console.error("Error deleting file after upload failure:", deleteError);
      }
    }
    // If an error occurs, throw an ApiError with a 500 status code and a message
    throw new ApiError(500, "Failed to upload file to Cloudinary", error);
  }
};

export default uploadOnCloudinary;
