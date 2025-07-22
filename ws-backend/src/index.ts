import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import url from 'url';

type Shape = {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  x2?: number;
  y2?: number;
  points?: { x: number; y: number }[];
};

const server = http.createServer();
const wss = new WebSocketServer({ server });

const rooms: Record<string, WebSocket[]> = {};
const roomShapes: Record<string, Shape[]> = {};

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const query = url.parse(req.url || '', true).query;
  const roomId = query.roomId as string;

  if (!rooms[roomId]) {
    rooms[roomId] = [];
    roomShapes[roomId] = [];
  }
  rooms[roomId].push(ws);

  // Send existing shapes
  ws.send(JSON.stringify({ type: 'init', shapes: roomShapes[roomId] }));

  ws.on('message', (message: string) => {
    const data = JSON.parse(message);
    const { type } = data;

    if (type === 'shape') {
      roomShapes[roomId].push(data.shape);
      rooms[roomId].forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'shape', shape: data.shape }));
        }
      });
    } else if (type === 'delete') {
      const idToDelete = data.id;
      roomShapes[roomId] = roomShapes[roomId].filter(s => s.id !== idToDelete);
      rooms[roomId].forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'delete', id: idToDelete }));
        }
      });
    }
  });

  ws.on('close', () => {
    rooms[roomId] = rooms[roomId].filter(client => client !== ws);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
