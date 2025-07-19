import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import url from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import RoomModel from "./model/roomModel";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// WebSocket server on port 8080
const wss = new WebSocketServer({ port: 8080 });
console.log("🌐 WebSocket Server started on port 8080");

const rooms: { [roomId: string]: Set<any> } = {};

wss.on("connection", async (ws, req) => {
  const { query } = url.parse(req.url || "", true);
  const token = query.token as string;
  const roomId = query.roomId as string;

  // ❌ Invalid token or room
  if (!token || !roomId) {
    ws.close();
    return;
  }

  try {
    // ✅ Verify token
    const user = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // ✅ Join room
    if (!rooms[roomId]) rooms[roomId] = new Set();
    rooms[roomId].add(ws);
    console.log(`👤 User ${user.id} joined room ${roomId}`);

    // ✅ Send previous shapes to this user
    const roomData = await RoomModel.findOne({ roomId });
    if (roomData) {
      ws.send(
        JSON.stringify({
          type: "load_previous_shapes",
          shapes: (roomData as any).shapes || [],
        })
      );
    }

    // 🔁 Handle messages from this user
    ws.on("message", async (message) => {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case "draw_shape":
          // Save to DB
          await RoomModel.updateOne(
            { roomId },
            { $push: { shapes: data.shape } },
            { upsert: true }
          );

          // Broadcast to other users
          rooms[roomId].forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({ type: "draw_shape", shape: data.shape }));
            }
          });
          break;

        case "delete_shape":
          // Delete from DB
          await RoomModel.updateOne(
            { roomId },
            { $pull: { shapes: { id: data.shapeId } } }
          );

          // Notify others
          rooms[roomId].forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({ type: "delete_shape", shapeId: data.shapeId }));
            }
          });
          break;
      }
    });

    // 🧹 On user disconnect
    ws.on("close", () => {
      rooms[roomId].delete(ws);
      console.log(`❌ User ${user.id} left room ${roomId}`);
    });

  } catch (err) {
    console.error("JWT validation failed:", err);
    ws.close();
  }
});
