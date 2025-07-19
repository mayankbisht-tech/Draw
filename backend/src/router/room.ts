import express from "express";
import Room from "../model/room";

const router = express.Router();

// Get all shapes for a room
router.get("/:roomId", async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ shapes: room.shapes });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Save new shape to room
router.post("/:roomId", async (req, res) => {
  const { type, props } = req.body;
  try {
    let room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      room = new Room({ roomId: req.params.roomId, shapes: [] });
    }
    room.shapes.push({ type, props });
    await room.save();
    res.json({ message: "Shape saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save shape" });
  }
});

export default router;
