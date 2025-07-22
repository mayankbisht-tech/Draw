"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const ws_1 = __importStar(require("ws"));
const url_1 = __importDefault(require("url"));
const server = http_1.default.createServer();
const wss = new ws_1.WebSocketServer({ server });
const rooms = {};
const roomShapes = {};
wss.on('connection', (ws, req) => {
    const query = url_1.default.parse(req.url || '', true).query;
    const roomId = query.roomId;
    if (!rooms[roomId]) {
        rooms[roomId] = [];
        roomShapes[roomId] = [];
    }
    rooms[roomId].push(ws);
    // Send existing shapes
    ws.send(JSON.stringify({ type: 'init', shapes: roomShapes[roomId] }));
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const { type } = data;
        if (type === 'shape') {
            roomShapes[roomId].push(data.shape);
            rooms[roomId].forEach(client => {
                if (client.readyState === ws_1.default.OPEN) {
                    client.send(JSON.stringify({ type: 'shape', shape: data.shape }));
                }
            });
        }
        else if (type === 'delete') {
            const idToDelete = data.id;
            roomShapes[roomId] = roomShapes[roomId].filter(s => s.id !== idToDelete);
            rooms[roomId].forEach(client => {
                if (client.readyState === ws_1.default.OPEN) {
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
