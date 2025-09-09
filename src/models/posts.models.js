import mongoose, { Schema } from "mongoose";

// Define the schema for a blog post
// This schema includes fields for title, content, author, category, and tags
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.ObjectId, required: true, ref: "User" }, // Reference to the User model
    category: { type: String, required: true },
    tags: [String],
    isTrending: {
      type: Boolean,
      default: false,
    },
    comments: [{ type: Schema.ObjectId, ref: "Comment" }], // Reference
    image: {
      type: String,
      default:
        "https://www.shutterstock.com/image-vector/illustration-default-avatar-profile-placeholder-260nw-1757107944.jpg",
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Post model using the defined schema
const Post = mongoose.model("Post", postSchema);

// Middleware to populate the author field with username and email before saving
postSchema.pre("save", async function (next) {
  this.populate("author", "username email"); // Populate author field with username and email
  next();
});

// Export the Post model for use in other parts of the application
export default Post;
