import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import http from "http";

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });
console.log(`WebSocket server running on ws://localhost:${PORT}`);

const rooms: Map<string, Set<WebSocket & { id?: string; roomId?: string }>> = new Map();

const sendJson = (ws: WebSocket, data: any) => {
  ws.send(JSON.stringify(data));
};

wss.on("connection", (ws: WebSocket & { id?: string; roomId?: string }) => {
  ws.id = uuidv4();

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "join-room") {
        const { roomId } = data;
        ws.roomId = roomId;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }

        rooms.get(roomId)!.add(ws);
        console.log(`Client ${ws.id} joined room ${roomId}`);
      }

      if (data.type === "draw" && ws.roomId) {
        const clientsInRoom = rooms.get(ws.roomId);
        clientsInRoom?.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            sendJson(client, {
              type: "draw",
              shape: data.shape,
            });
          }
        });
      }
    } catch (err) {
      console.error("Invalid message", err);
    }
  });

  ws.on("close", () => {
    if (ws.roomId && rooms.has(ws.roomId)) {
      rooms.get(ws.roomId)!.delete(ws);
      if (rooms.get(ws.roomId)!.size === 0) {
        rooms.delete(ws.roomId);
      }
    }
  });
});
