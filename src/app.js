import express from "express";
import dotenv from "dotenv";
import postsRouter from "./routes/posts.route.js";
import userRouter from "./routes/user.route.js";
import commentRouter from "./routes/comments.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import ApiError from "./utils/ApiError.js";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import Rss from "rss";
import Post from "./models/posts.models.js";
import nodemailer from "nodemailer";

// Load environment variables as early as possible
dotenv.config();

// initialize express app
const app = express();

// small security-hardening tweaks
app.disable("x-powered-by");
// if your app is behind a proxy (Vercel/Render/NGINX), enable this
app.set("trust proxy", 1);

// Configure CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://intraaverse.netlify.app",
      "https://intraverse.me",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// security headers and compression
app.use(helmet());
app.use(compression());

// request logging (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// simple rate limiting on API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to parse JSON, URL-encoded data and enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sitemap generation
app.get("/sitemap.xml", async (req, res) => {
  try {
    const SITE_URL = process.env.SITE_URL || "https://intraverse.me";
    const posts = await Post.find().select("_id updatedAt").lean();
    const links = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/about", changefreq: "monthly", priority: 0.7 },
      ...posts.map((p) => ({
        url: `/post/${p._id}`,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: p.updatedAt || undefined,
      })),
    ];

    const stream = new SitemapStream({
      hostname: SITE_URL,
    });
    res.writeHead(200, {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    });
    const xml = await streamToPromise(Readable.from(links).pipe(stream));
    res.end(xml.toString());
  } catch (err) {
    console.error(err);
    return res.status(500).end();
  }
});

// RSS feed generation
app.get("/rss.xml", async (req, res) => {
  const SITE_URL = process.env.SITE_URL || "https://intraverse.me";
  const feed = new Rss({
    title: "IntraVerse Blog",
    description: "Latest articles from IntraVerse Blog",
    feed_url: `${SITE_URL}/rss.xml`,
    site_url: SITE_URL,
    language: "en",
  });

  let posts = [];
  try {
    posts = await Post.find()
      .select("title content createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  } catch (err) {
    console.error(err);
  }

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.content,
      url: `${SITE_URL}/post/${post._id}`,
      date: post.createdAt,
    });
  });

  res.set({
    "Content-Type": "application/rss+xml",
    "Cache-Control": "public, max-age=3600",
  });
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

// Contact form route
app.use("/api/contact", apiLimiter, (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res
      .status(400)
      .json({ status: 400, message: "All fields are required" });
  }

  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Setup email data
  const mailOptions = {
    from: `"${name}" <${email}>`, // sender address
    to: process.env.SMTP_USER, // list of receivers
    subject: subject, // Subject line
    text: message, // plain text body
    html: `<p>${message}</p><br/><p>From: ${name} (${email})</p>`, // html body
  };

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal Server Error" });
    }
    console.log("Email sent successfully:", info);
    return res
      .status(200)
      .json({ status: 200, message: "Email sent successfully" });
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  return res.status(404).json({ status: 404, message: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      errors: err.errors || null,
    });
  }

  console.error(err);
  return res.status(500).json({
    status: 500,
    message: err.message || "Internal Server Error",
    errors: err.errors || null,
  });
});

export default app;
