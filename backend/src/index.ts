import { prisma } from "../../packages/db/src/index"; 


import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("PostgreSQL connection error:", err);
    process.exit(1);
  }
}

startServer();
