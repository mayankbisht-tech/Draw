import express, { Request, Response } from "express";
import { prisma } from "../../../packages/db/src"; // Ensure this path is correct

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
        
        return res.status(200).json({ success: true, shape: shapeData });
    } catch (err) {
        console.error("Failed to save shape:", err);
        res.status(500).json({ error: "Failed to process shape.", details: (err as Error).message });
    }
});

router.delete("/shape/:shapeId", async (req: Request<{ shapeId: string }>, res: Response) => {
    const { shapeId } = req.params;
    try {
        await prisma.shape.delete({
            where: { id: shapeId },
        });
        res.status(204).send();
    } catch (err) {
        console.error("Failed to delete shape:", err);
        if (err instanceof prisma.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return res.status(404).json({ error: "Shape not found." });
        }
        res.status(500).json({ error: "Server error while deleting shape" });
    }
});


export default router;