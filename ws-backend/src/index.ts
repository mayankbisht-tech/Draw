import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import url from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import RoomModel from "./model/roomModel";

dotenv.config();

mongoose.connect(process.env.DATABASE_URL!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket Server started on ws://localhost:8080");

const rooms: Record<string, Set<WebSocket>> = {};

wss.on("connection", async (ws, req) => {
  const { query } = url.parse(req.url || "", true);
  const token = query.token as string;
  const roomId = query.roomId as string;

  if (!token || !roomId) {
    ws.close();
    return;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    if (!rooms[roomId]) rooms[roomId] = new Set();
    rooms[roomId].add(ws);
    console.log(`User ${user.id} joined room ${roomId}`);

    const roomData = await RoomModel.findOne({ roomId });
    if (roomData) {
      ws.send(JSON.stringify({
        type: "load_previous_shapes",
        shapes: (roomData as any).shapes || [],
      }));
    }

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "draw_shape") {
          await RoomModel.updateOne(
            { roomId },
            { $push: { shapes: data.shape } },
            { upsert: true }
          );

          rooms[roomId].forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "draw_shape", shape: data.shape }));
            }
          });

        } else if (data.type === "delete_shape") {
          await RoomModel.updateOne(
            { roomId },
            { $pull: { shapes: { id: data.shapeId } } }
          );

          rooms[roomId].forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "delete_shape", shapeId: data.shapeId }));
            }
          });
        }
      } catch (error) {
        console.error(" Error handling message:", error);
      }
    });

    ws.on("close", () => {
      rooms[roomId].delete(ws);
      console.log(` User ${user.id} left room ${roomId}`);
    });

  } catch (err) {
    console.error(" JWT validation failed:", err);
    ws.close();
  }
});
