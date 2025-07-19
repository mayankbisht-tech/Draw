// backend/index.ts
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./router/auth";   // ✅ ensure correct path
import roomRoutes from "./router/room";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // ✅ e.g., /api/auth/login
app.use("/api/room", roomRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb+srv://<your-URI>")
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
