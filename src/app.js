import express from "express";
import postsRouter from "./routes/posts.route.js";
import userRouter from "./routes/user.route.js";
import commentRouter from "./routes/comments.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import ApiError from "./utils/ApiError.js";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import Rss from "rss";
import Post from "./models/posts.models.js";

// initialize express app
const app = express();

// Configure CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://intraaverse.netlify.app",
      "https://intraverse.me",
    ], // Vite dev server ports
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Middleware to parse JSON, URL-encoded data and enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sitemap generation
app.get("/sitemap.xml", async (req, res) => {
  try {
    const posts = await Post.find(); // fetch from MongoDB or your DB
    const links = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/about", changefreq: "monthly", priority: 0.7 },
      ...posts.map((p) => ({
        url: `/post/${p._id}`,
        changefreq: "weekly",
        priority: 0.8,
      })),
    ];

    const stream = new SitemapStream({
      hostname: "https://intraverse.me",
    });
    res.writeHead(200, { "Content-Type": "application/xml" });
    const xml = await streamToPromise(Readable.from(links).pipe(stream));
    res.end(xml.toString());
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// RSS feed generation
app.get("/rss.xml", async (req, res) => {
  const feed = new Rss({
    title: "IntraVerse Blog",
    description: "Latest articles from IntraVerse Blog",
    feed_url: "https://intraverse.me/rss.xml",
    site_url: "https://intraverse.me",
    language: "en",
  });

  let posts = [];
  try {
    posts = await Post.find(); // fetch from MongoDB or your DB
  } catch (err) {
    console.error(err);
  }

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.content,
      url: `https://intraverse.me/post/${post._id}`,
      date: post.createdAt,
    });
  });

  res.set("Content-Type", "application/rss+xml");
  res.send(feed.xml({ indent: true }));
});

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
