import express, { Request, Response } from "express";
import { WebSocket, WebSocketServer } from "ws";
import { prisma } from "../../../packages/db/src/index";

interface ExtendedWebSocket extends WebSocket {
  roomId: string;
}
const getWss = (req: Request): WebSocketServer => {
  return req.app.get("wss");
};

const router = express.Router();


router.get("/:roomId", async (req: Request<{ roomId: string }>, res: Response) => {
  try {
    const room = await prisma.room.findUnique({
      where: { roomId: req.params.roomId },
      include: {
        shapes: true,
      },
    });

    if (!room) {
      return res.json({ shapes: [] });
    }

    res.json({ shapes: room.shapes });
  } catch (err) {
    console.error("Failed to get room data:", err);
    res.status(500).json({ error: "Server error while fetching room data" });
  }
});


router.post("/:roomId", async (req: Request<{ roomId: string }>, res: Response) => {
  const { type, props } = req.body;
  const { roomId } = req.params;

  if (!type || !props) {
    return res.status(400).json({ error: "Shape 'type' and 'props' are required." });
  }

  try {
    const room = await prisma.room.update({
      where: { roomId },
      data: {
        shapes: {
          create: { type, props },
        },
      },
      include: { shapes: true },
    });

    const newShape = room.shapes[room.shapes.length - 1];

    const wss = getWss(req);
    if (wss && newShape) {
      wss.clients.forEach((client) => {
        if ('roomId' in client && client.roomId === roomId && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ event: "shape-drawn", data: newShape }));
        }
      });
    }
    return res.status(201).json(newShape);

  } catch (err: any) {
    if (err.code === 'P2025') {
      try {
        const newRoom = await prisma.room.create({
          data: {
            roomId,
            shapes: {
              create: { type, props },
            },
          },
          include: { shapes: true },
        });

        const newShape = newRoom.shapes[0];
        return res.status(201).json(newShape);

      } catch (createErr) {
        console.error("Failed to create room and shape:", createErr);
        return res.status(500).json({ error: "Failed to create room and save shape" });
      }
    }

    console.error("Failed to save shape:", err);
    res.status(500).json({ error: "Failed to save shape" });
  }
});

export default router;