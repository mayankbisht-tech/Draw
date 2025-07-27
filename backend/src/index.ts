import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { URL } from 'url';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import path from 'path'; 

import authRouter from "./router/auth";
import roomRouter from "./router/room";
import { prisma } from "../../packages/db/src"; 

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: "https://draw-three-lovat.vercel.app"
};
app.use(cors(corsOptions));

const wss = new WebSocketServer({ noServer: true });
const JWT_SECRET = process.env.JWT_SECRET || '';

interface ExtendedWebSocket extends WebSocket {
  roomId: string;
  firstname?: string;
  lastname?: string;
  userId: string;
}

const onlineUsersMap = new Map<string, Set<ExtendedWebSocket>>();
app.use(cors({
  origin: ['http://localhost:5173', 'https://excelidraw-ncsy.onrender.com', 'https://draw-three-lovat.vercel.app'], // Ensure Vercel frontend is included here too
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.set('wss', wss);
app.set('onlineUsersMap', onlineUsersMap);

app.use("/api/auth", authRouter);
app.use("/api/room", roomRouter);
const frontendPath = path.join(__dirname, '..', '..', '..', '..', 'client', 'dist'); 
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


function broadcastOnlineUsersInRoom(roomId: string) {
  const clientsInRoom = onlineUsersMap.get(roomId);
  if (!clientsInRoom) return;

  const usersList = Array.from(clientsInRoom).map(client => ({
    firstname: client.firstname || 'Guest',
    lastname: client.lastname || '',
    userId: client.userId,
  }));

  const message = JSON.stringify({
    type: 'online_users_update',
    users: usersList,
  });

  clientsInRoom.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function broadcastToRoom(roomId: string, message: string, excludeSender: ExtendedWebSocket) {
    const clientsInRoom = onlineUsersMap.get(roomId);
    if (!clientsInRoom) return;

    clientsInRoom.forEach(client => {
        if (client !== excludeSender && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || "", `http://${request.headers.host}`);
  const roomId = url.searchParams.get('roomId');

  if (!roomId) {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
    return;
  }
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', async (ws: WebSocket, req) => {
  const extendedWs = ws as ExtendedWebSocket;

  try {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const roomId = url.searchParams.get('roomId');
    const token = url.searchParams.get('token');

    if (!roomId) {
      extendedWs.close(1008, "Room ID is required");
      return;
    }

    extendedWs.roomId = roomId;
    extendedWs.userId = uuidv4();

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { firstname: string, lastname?: string, id: string };
        extendedWs.firstname = decoded.firstname;
        extendedWs.lastname = decoded.lastname;
        extendedWs.userId = decoded.id;
      } catch (jwtError) {
        console.error("Invalid or expired token:", jwtError);
        extendedWs.close(1008, "Invalid authentication token");
        return;
      }
    }
    
    extendedWs.send(JSON.stringify({
        type: 'user_info',
        firstname: extendedWs.firstname || 'Guest',
        lastname: extendedWs.lastname || '',
        userId: extendedWs.userId
    }));

    if (!onlineUsersMap.has(roomId)) {
      onlineUsersMap.set(roomId, new Set());
    }
    onlineUsersMap.get(roomId)?.add(extendedWs);
    broadcastOnlineUsersInRoom(roomId);

    try {
      const roomFromDb = await prisma.room.findUnique({
        where: { roomId },
        include: { shapes: true },
      });
      if (roomFromDb && roomFromDb.shapes.length > 0) {
        const normalizedShapes = roomFromDb.shapes.map(shape => ({
            id: shape.id,
            type: shape.type,
            ...shape.props as object
        }));
        extendedWs.send(JSON.stringify({ type: 'init', shapes: normalizedShapes }));
      }
    } catch (dbError) {
      console.error(`Failed to fetch initial shapes for room ${roomId}:`, dbError);
    }

    extendedWs.on('message', function incoming(message: string) {
      broadcastToRoom(extendedWs.roomId, message, extendedWs);
    });

    extendedWs.on('close', () => {
      console.log(`User ${extendedWs.userId} disconnected from room ${extendedWs.roomId}`);
      onlineUsersMap.get(extendedWs.roomId)?.delete(extendedWs);
      broadcastOnlineUsersInRoom(extendedWs.roomId);
    });

    extendedWs.on('error', (error) => {
      console.error(`WebSocket error in room ${extendedWs.roomId}:`, error);
    });

  } catch (error) {
    console.error("Critical error during WebSocket connection setup:", error);
    extendedWs.close(1011, "Internal server error");
  }
});

const PORT = 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL database.");
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
