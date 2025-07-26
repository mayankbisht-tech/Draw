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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const url_1 = require("url");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const auth_1 = __importDefault(require("./router/auth"));
const room_1 = __importDefault(require("./router/room"));
const index_1 = require("../../packages/db/src/index");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ noServer: true });
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const onlineUsersMap = new Map();
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'https://excelidraw-ncsy.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.set('wss', wss);
app.set('onlineUsersMap', onlineUsersMap);
app.use("/api/auth", auth_1.default);
app.use("/api/room", room_1.default);
function broadcastOnlineUsersInRoom(roomId) {
    const clientsInRoom = onlineUsersMap.get(roomId);
    if (!clientsInRoom)
        return;
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
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(message);
        }
    });
}
function broadcastToRoom(roomId, message, excludeSender) {
    const clientsInRoom = onlineUsersMap.get(roomId);
    if (!clientsInRoom)
        return;
    clientsInRoom.forEach(client => {
        if (client !== excludeSender && client.readyState === ws_1.WebSocket.OPEN) {
            client.send(message);
        }
    });
}
server.on('upgrade', (request, socket, head) => {
    const url = new url_1.URL(request.url || "", `http://${request.headers.host}`);
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
wss.on('connection', (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const extendedWs = ws;
    try {
        const url = new url_1.URL(req.url || "", `http://${req.headers.host}`);
        const roomId = url.searchParams.get('roomId');
        const token = url.searchParams.get('token');
        if (!roomId) {
            extendedWs.close(1008, "Room ID is required");
            return;
        }
        extendedWs.roomId = roomId;
        extendedWs.userId = (0, uuid_1.v4)();
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                extendedWs.firstname = decoded.firstname;
                extendedWs.lastname = decoded.lastname;
                extendedWs.userId = decoded.id;
            }
            catch (jwtError) {
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
        (_a = onlineUsersMap.get(roomId)) === null || _a === void 0 ? void 0 : _a.add(extendedWs);
        broadcastOnlineUsersInRoom(roomId);
        try {
            const roomFromDb = yield index_1.prisma.room.findUnique({
                where: { roomId },
                include: { shapes: true },
            });
            if (roomFromDb && roomFromDb.shapes.length > 0) {
                const normalizedShapes = roomFromDb.shapes.map(shape => (Object.assign({ id: shape.id, type: shape.type }, shape.props)));
                extendedWs.send(JSON.stringify({ type: 'init', shapes: normalizedShapes }));
            }
        }
        catch (dbError) {
            console.error(`Failed to fetch initial shapes for room ${roomId}:`, dbError);
        }
        extendedWs.on('message', function incoming(message) {
            broadcastToRoom(extendedWs.roomId, message, extendedWs);
        });
        extendedWs.on('close', () => {
            var _a;
            console.log(`User ${extendedWs.userId} disconnected from room ${extendedWs.roomId}`);
            (_a = onlineUsersMap.get(extendedWs.roomId)) === null || _a === void 0 ? void 0 : _a.delete(extendedWs);
            broadcastOnlineUsersInRoom(extendedWs.roomId);
        });
        extendedWs.on('error', (error) => {
            console.error(`WebSocket error in room ${extendedWs.roomId}:`, error);
        });
    }
    catch (error) {
        console.error("Critical error during WebSocket connection setup:", error);
        extendedWs.close(1011, "Internal server error");
    }
}));
const PORT = 3000;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield index_1.prisma.$connect();
            console.log("Connected to PostgreSQL database.");
            server.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
            });
        }
        catch (err) {
            console.error("Failed to start server:", err);
            process.exit(1);
        }
    });
}
startServer();
