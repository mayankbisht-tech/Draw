"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const _db_1 = require("@db");
const router = express_1.default.Router();
router.get("/:roomId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield _db_1.prisma.room.findUnique({
            where: { roomId: req.params.roomId },
            include: { shapes: true },
        });
        if (!room) {
            return res.json({ shapes: [] });
        }
        const normalizedShapes = room.shapes.map(shape => (Object.assign({ id: shape.id, type: shape.type }, shape.props)));
        res.json({ shapes: normalizedShapes });
    }
    catch (err) {
        console.error("Failed to get room data:", err);
        res.status(500).json({ error: "Server error while fetching room data" });
    }
}));
router.post("/:roomId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    const shapeData = req.body;
    if (!shapeData || !shapeData.id || !shapeData.type) {
        return res.status(400).json({ message: "Invalid shape data. 'id' and 'type' are required." });
    }
    try {
        const room = yield _db_1.prisma.room.upsert({
            where: { roomId: roomId },
            update: {},
            create: { roomId: roomId },
            select: { id: true },
        });
        const { id: shapeId, type } = shapeData, props = __rest(shapeData, ["id", "type"]);
        yield _db_1.prisma.shape.upsert({
            where: { id: shapeId },
            update: { type: type, props: props },
            create: { id: shapeId, type: type, props: props, roomId: room.id },
        });
        const wss = req.app.get("wss");
        const onlineUsersMap = req.app.get("onlineUsersMap");
        const clientsInRoom = onlineUsersMap.get(roomId);
        if (clientsInRoom) {
            const broadcastMessage = JSON.stringify({
                type: 'shape',
                shape: shapeData,
            });
            clientsInRoom.forEach((client) => {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    client.send(broadcastMessage);
                }
            });
        }
        return res.status(200).json(shapeData);
    }
    catch (err) {
        console.error("Failed to save or broadcast shape:", err);
        res.status(500).json({ error: "Failed to process shape." });
    }
}));
exports.default = router;
