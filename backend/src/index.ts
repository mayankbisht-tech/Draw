import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { URL } from 'url';

import authRouter from "./router/auth";
import roomRouter from "./router/room"; 
import { prisma } from "../../packages/db/src/index"; 

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ noServer: true });

interface ExtendedWebSocket extends WebSocket {
  roomId: string;
}
server.on('upgrade', (request, socket, head) => {
  console.log('Parsing upgrade request...');
  const url = new URL(request.url || "", `http://${request.headers.host}`);
  const roomId = url.searchParams.get('roomId');

  if (!roomId) {
    console.log('Upgrade request rejected: No roomId provided.');
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
    return;
  }
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});


wss.on('connection', async (ws: ExtendedWebSocket, req) => {
  try {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const roomId = url.searchParams.get('roomId');

    if (!roomId) {
      console.log("Connection failed post-upgrade: No roomId found.");
      ws.close(1008, "Room ID is required");
      return;
    }

    ws.roomId = roomId;
    console.log(`Client successfully connected to room: ${roomId}`);

    const room = await prisma.room.findUnique({
      where: { roomId },
      include: { shapes: true },
    });

    if (room && room.shapes.length > 0) {
      console.log(`Sending ${room.shapes.length} existing shapes to new client in room ${roomId}`);
      ws.send(JSON.stringify({ type: 'init', shapes: room.shapes }));
    }

    ws.on('message', (message: string) => {
      wss.clients.forEach(client => {
        const extendedClient = client as ExtendedWebSocket;
        if (extendedClient.roomId === ws.roomId && extendedClient !== ws && extendedClient.readyState === WebSocket.OPEN) {
          extendedClient.send(message);
        }
      });
    });

    ws.on('close', () => {
      console.log(`Client disconnected from room: ${ws.roomId}`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error in room ${ws.roomId}:`, error);
    });

  } catch (error) {
    console.error("Error during WebSocket connection setup:", error);
    ws.close(1011, "Internal server error");
  }
});

app.set('wss', wss);

app.use(cors({
  origin: ['http://localhost:5173', 'https://excelidraw-ncsy.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/room", roomRouter);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL database.");

    server.listen(PORT, () => {
      console.log(` running on https://excelidraw-ncsy.onrender.com/:${PORT}`);
    });
  } catch (err) {
    console.error(" Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
