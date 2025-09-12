import express from "express";
import postsRouter from "./routes/posts.route.js";
import userRouter from "./routes/user.route.js";
import commentRouter from "./routes/comments.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import ApiError from "./utils/ApiError.js";

// initialize express app
const app = express();

// Configure CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "https://intraaverse.netlify.app"], // Vite dev server ports
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Middleware to parse JSON, URL-encoded data and enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// default home route to test the server
app.get("/", (req, res) => {
  res.send("Welcome to my IntraVerse API");
});

// use the router middleware for handling routes
app.use("/api", postsRouter);
app.use("/api/user", userRouter);
app.use("/api/comments", commentRouter);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      errors: err.errors || null,
    });
  }

  console.error(err);
  res.status(500).json({
    status: 500,
    message: err.message || "Internal Server Error",
    errors: err.errors || null,
  });
});

export default app;
