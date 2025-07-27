import express, { Request, Response } from "express";
import { WebSocket, WebSocketServer } from "ws";
import { prisma } from "../../../packages/db/src"; 

interface ExtendedWebSocket extends WebSocket {
  roomId: string;
  firstname?: string;
  lastname?: string;
  userId: string;
}

const router = express.Router();

router.get("/:roomId", async (req: Request<{ roomId: string }>, res: Response) => {
  try {
    const room = await prisma.room.findUnique({
      where: { roomId: req.params.roomId },
      include: { shapes: true }, 
    });

    if (!room) {
      return res.json({ shapes: [] });
    }

    const normalizedShapes = room.shapes.map(shape => ({
        id: shape.id,
        type: shape.type,
        ...(shape.props as object) 
    }));

    res.json({ shapes: normalizedShapes });
  } catch (err) {
    console.error("Failed to get room data:", err);
    res.status(500).json({ error: "Server error while fetching room data" });
  }
});

router.post("/:roomId", async (req: Request<{ roomId: string }>, res: Response) => {
  const { roomId } = req.params;
  const shapeData = req.body; 
  if (!shapeData || !shapeData.id || !shapeData.type) {
    return res.status(400).json({ message: "Invalid shape data. 'id' and 'type' are required." });
  }

  try {
    const room = await prisma.room.upsert({
      where: { roomId: roomId },
      update: {}, 
      create: { roomId: roomId }, 
      select: { id: true },
    });

    const { id: shapeId, type, ...props } = shapeData;

    const stringifiedProps = JSON.stringify(props);

    console.log(`[Room Router POST] Processing shape for Room ID: ${roomId}`);
    console.log(`[Room Router POST] Received shapeData: ${JSON.stringify(shapeData)}`);
    console.log(`[Room Router POST] Extracted shapeId: ${shapeId}, type: ${type}`);
    console.log(`[Room Router POST] Stringified props: ${stringifiedProps}`);

    await prisma.shape.upsert({
      where: { id: shapeId }, 
      update: { type: type, props: stringifiedProps }, 
      create: { 
        id: shapeId, 
        type: type, 
        props: stringifiedProps, 
        roomId: room.id
      },
    });

    const wss: WebSocketServer = req.app.get("wss");
    const onlineUsersMap: Map<string, Set<ExtendedWebSocket>> = req.app.get("onlineUsersMap");
    
    const clientsInRoom = onlineUsersMap.get(roomId);
    if (clientsInRoom) {
      const broadcastMessage = JSON.stringify({
        type: 'shape',
        shape: shapeData,
      });
      clientsInRoom.forEach((client: ExtendedWebSocket) => {
        // Ensure the client is open before sending
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastMessage);
        }
      });
    }

    return res.status(200).json(shapeData);
  } catch (err) {
    console.error("Failed to save or broadcast shape:", err);
    res.status(500).json({ error: "Failed to process shape.", details: (err as Error).message });
  }
});

export default router;
