import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://future-blink.netlify.app",
}));
app.use(express.json());

// Routes
app.use("/api", apiRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Future Blink API is running 🚀" });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
