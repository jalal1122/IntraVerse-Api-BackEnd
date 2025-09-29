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

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", // Automatically determine the resource type
      folder: "IntraVerse", // Specify the folder in Cloudinary where the file will be stored
    });

    // If the upload is successful, return the result
    if (!result || !result.secure_url) {
      throw new ApiError(500, "Failed to upload file to Cloudinary");
    }

    // try {
    //   fs.unlinkSync(filePath); // Delete the local file after upload
    // } catch (error) {
    //   console.error("Error deleting local file:", error);
    // }

    console.log("File uploaded to Cloudinary successfully:", result.secure_url);

    return result; // Return the result of the upload
  } catch (error) {
    // try {
    //   fs.unlinkSync(filePath); // Delete the local file if an error occurs
    // } catch (err) {
    //   console.error("Error deleting local file:", err);
    // }

    // If an error occurs, throw an ApiError with a 500 status code and a message
    throw new ApiError(500, "Failed to upload file to Cloudinary", error);
  }
};

const uploadMultipleOnCloudinary = async (filePaths) => {
  try {
    console.log("Attempting to upload file to Cloudinary:", filePath);

    // Configure Cloudinary with api keys and secrets from environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadPromises = filePaths.map(async (filePath) => {
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          resource_type: "auto", // Automatically determine the resource type
          folder: "IntraVerse",
          quality: "auto", // Automatically determine the quality
          quality: "auto",
          fetch_format: "auto",
        });

        return {
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
          original_filename: result.original_filename,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          filePath,
        };
      }
    });

    const results = await Promise.all(uploadPromises);

    // Separate successful and failed uploads
    const successful = results.filter((result) => result.success);
    const failed = results.filter((result) => !result.success);

    if (successful.length === 0) {
      throw new ApiError(500, "All file uploads failed");
    }

    return {
      successful,
      failed,
      totalUploaded: successful.length,
      totalFailed: failed.length,
    };
  } catch (error) {
    throw new ApiError(
      error.status || 500,
      error.message ||
        "An error occurred while uploading multiple files to Cloudinary"
    );
  }
};

export { uploadOnCloudinary, uploadMultipleOnCloudinary };
