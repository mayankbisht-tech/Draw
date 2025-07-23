import express from "express";
import {prisma} from "../../../packages/db/src/index"; // Adjust based on your project
const router = express.Router();

// GET shapes for a room
router.get("/:roomId", async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { roomId: req.params.roomId },
      include: { shapes: true,
        chats: true  
       }, 

    });

    if (!room) return res.status(404).json({ message: "Room not found" });

    res.json({ shapes: room.shapes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new shape to a room
router.post("/:roomId", async (req, res) => {
  const { type, props } = req.body;
  try {
    const existingRoom = await prisma.room.findUnique({
      where: { roomId: req.params.roomId },
    });

    if (!existingRoom) {
      await prisma.room.create({
        data: {
          roomId: req.params.roomId,
          shapes: [{ type, props }],
        },
      });
    } else {
      await prisma.room.update({
        where: { roomId: req.params.roomId },
        data: {
          shapes: [...(existingRoom.shapes as any[]), { type, props }],
        },
      });
    }

    res.json({ message: "Shape saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save shape" });
  }
});

export default router;
