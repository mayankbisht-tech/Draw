import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./router/auth";
import roomRoutes from "./router/room";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes); 
app.use("/api/room", roomRoutes);

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on https://draw-xgjp.onrender.com`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
