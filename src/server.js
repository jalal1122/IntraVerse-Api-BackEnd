import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Load environment variables from .env file
dotenv.config();


// get the port from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

// connect to MongoDB using the connectDB function
connectDB()
.then(() => {
    // listen on the specified port
    // and log a message to the console
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
