import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { type Shape } from "../authentication/types";

const degToRad = (degrees: number) => degrees * (Math.PI / 180);
class Complex {
    re: number;
    im: number;
    constructor(re: number, im: number) { this.re = re; this.im = im; }
    add(other: Complex): Complex { return new Complex(this.re + other.re, this.im + other.im); }
    subtract(other: Complex): Complex { return new Complex(this.re - other.re, this.im - other.im); }
    multiply(other: Complex): Complex { return new Complex(this.re * other.re - this.im * other.im, this.re * other.re + this.im * other.re); }
    static fromPolar(magnitude: number, angleRadians: number): Complex { return new Complex(magnitude * Math.cos(angleRadians), magnitude * Math.sin(angleRadians)); }
    get magnitude(): number { return Math.sqrt(this.re * this.re + this.im * this.im); }
    get angle(): number { return Math.atan2(this.im, this.re); }
}
type Tool = "pencil" | "rectangle" | "circle" | "line" | "eraser" | "text";
interface ChatMessage {
    id: string;
    senderId: string;
    senderFirstName: string;
    senderLastName: string;
    text: string;
    timestamp: number;
}
const API_BASE_URL = "https://excelidraw-ncsy.onrender.com";
const WS_BASE_URL = "wss://excelidraw-ncsy.onrender.com";
const getShapeCenter = (shape: Shape): { x: number; y: number } => {
    let centerX = 'x' in shape ? shape.x : 0;
    let centerY = 'y' in shape ? shape.y : 0;
    if (shape.type === 'rectangle' && shape.width != null) { centerX = shape.x + shape.width / 2; centerY = shape.y + shape.height / 2; }
    else if (shape.type === 'circle') { centerX = shape.x; centerY = shape.y; }
    else if (shape.type === 'line' && shape.x2 != null) { centerX = (shape.x + shape.x2) / 2; centerY = (shape.y + shape.y2) / 2; }
    else if (shape.type === 'pencil' && shape.points && Array.isArray(shape.points) && shape.points.length > 0) {
        const minX = Math.min(...shape.points.map(p => p.x));
        const minY = Math.min(...shape.points.map(p => p.y));
        const maxX = Math.max(...shape.points.map(p => p.x));
        const maxY = Math.max(...shape.points.map(p => p.y));
        centerX = minX + (maxX - minX) / 2;
        centerY = minY + (maxY - minY) / 2;
    }
    else if (shape.type === 'text' && shape.fontSize != null && shape.text != null) {
        const approxWidth = shape.text.length * (shape.fontSize * 0.5);
        centerX = shape.x + approxWidth / 2;
        centerY = shape.y - shape.fontSize / 2;
    }
    return { x: centerX, y: centerY };
};
const getLocalMouseCoordinates = (coords: { x: number; y: number }, shape: Shape, ctx: CanvasRenderingContext2D) => {
    ctx.save();
    const { x: shapeCenterX, y: shapeCenterY } = getShapeCenter(shape);
    ctx.translate(shapeCenterX + (shape.offsetX || 0), shapeCenterY + (shape.offsetY || 0));
    ctx.rotate(shape.rotation || 0);
    ctx.scale(shape.scale || 1, shape.scale || 1);
    ctx.translate(-shapeCenterX, -centerY);
    const invTransform = ctx.getTransform().inverse();
    ctx.restore();
    return { x: coords.x * invTransform.a + coords.y * invTransform.c + invTransform.e, y: coords.x * invTransform.b + coords.y * invTransform.d + invTransform.f };
};

export default function Imp() {
    const navigate = useNavigate();
    const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
    const { roomId } = useParams<{ roomId: string }>();
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentDrawingShapeId, setCurrentDrawingShapeId] = useState<string | null>(null);
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
    const [isTransforming, setIsTransforming] = useState(false);
    const [lineDragHandle, setLineDragHandle] = useState<'start' | 'end' | 'body' | null>(null);
    const transformStartPointRef = useRef<{ x: number; y: number } | null>(null);
    const initialShapeStateRef = useRef<Shape | null>(null);
    const initialGestureStateRef = useRef<{ distance: number, angle: number } | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [textInputPosition, setTextInputPosition] = useState<{ x: number; y: number } | null>(null);
    const [textInputValue, setTextInputValue] = useState('');
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const startPointRef = useRef<{ x: number; y: number } | null>(null);
    const ws = useRef<WebSocket | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
    const [userInfo, setUserInfo] = useState<{ firstname: string; lastname?: string; userId: string } | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Array<{ firstname: string; lastname?: string; userId: string }>>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [wsConnected, setWsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const generateId = useCallback(() => (crypto.randomUUID ? crypto.randomUUID() : `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`), []);

    useEffect(() => {
        if (!roomId) return;
        const token = localStorage.getItem('token');
        const connectWebSocket = () => {
            const socket = new WebSocket(`${WS_BASE_URL}/?roomId=${roomId}${token ? `&token=${token}` : ''}`);
            ws.current = socket;
            socket.onopen = () => {
                console.log("WebSocket connected.");
                setWsConnected(true);
            };
            socket.onclose = () => {
                console.log("WebSocket disconnected.");
                setWsConnected(false);
            };
            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
                setWsConnected(false);
            };
            socket.onmessage = async (event) => {
                let messageData: string;
                if (event.data instanceof Blob) { messageData = await event.data.text(); } else { messageData = event.data; }
                try {
                    const data = JSON.parse(messageData);
                    switch (data.type) {
                        case 'init':
                            setShapes((data.shapes || []).map((shape: any) => ({
                                ...shape,
                                offsetX: shape.offsetX ?? 0,
                                offsetY: shape.offsetY ?? 0,
                                rotation: shape.rotation ?? 0,
                                scale: shape.scale ?? 1
                            })));
                            break;
                        case 'shape':
                            setShapes((prev) => {
                                const i = prev.findIndex(s => s.id === data.shape.id);
                                if (i !== -1) {
                                    const u = [...prev];
                                    u[i] = { ...data.shape, offsetX: data.shape.offsetX ?? 0, offsetY: data.shape.offsetY ?? 0, rotation: data.shape.rotation ?? 0, scale: data.shape.scale ?? 1 };
                                    return u;
                                }
                                return [...prev, { ...data.shape, offsetX: data.shape.offsetX ?? 0, offsetY: data.shape.offsetY ?? 0, rotation: data.shape.rotation ?? 0, scale: data.shape.scale ?? 1 }];
                            });
                            break;
                        case 'delete':
                            setShapes((prev) => prev.filter((s) => s.id !== data.id));
                            break;
                        case 'user_info':
                            setUserInfo({ firstname: data.firstname, lastname: data.lastname, userId: data.userId });
                            break;
                        case 'online_users_update':
                            setOnlineUsers(data.users || []);
                            break;
                        case 'chat_message':
                            setMessages((prev) => [...prev, data.message]);
                            break;
                        default:
                            console.warn("Unknown message type:", data.type);
                    }
                } catch (error) {
                    console.error("Failed to parse message:", error, "Raw message:", messageData);
                }
            };
        };
        connectWebSocket();
        return () => ws.current?.close(1000);
    }, [roomId, generateId]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !canvas.getContext) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach((shape) => {
            ctx.save();
            const { x: centerX, y: centerY } = getShapeCenter(shape);
            ctx.translate(centerX + (shape.offsetX || 0), centerY + (shape.offsetY || 0));
            ctx.rotate(shape.rotation || 0);
            ctx.scale(shape.scale || 1, shape.scale || 1);
            ctx.translate(-centerX, -centerY);
            ctx.strokeStyle = shape.id === selectedShapeId ? "cyan" : "white";
            ctx.lineWidth = 2;
            try {
                if (shape.type === 'pencil' && shape.points && Array.isArray(shape.points) && shape.points.length > 0) {
                    ctx.beginPath();
                    ctx.moveTo(shape.points[0].x, shape.points[0].y);
                    for (let i = 1; i < shape.points.length; i++) {
                        ctx.lineTo(shape.points[i].x, shape.points[i].y);
                    }
                    ctx.stroke();
                } else if (shape.type === 'rectangle' && shape.width != null && shape.height != null) {
                    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                } else if (shape.type === 'circle' && shape.radius != null) {
                    ctx.beginPath();
                    ctx.arc(shape.x, shape.y, Math.abs(shape.radius), 0, 2 * Math.PI);
                    ctx.stroke();
                } else if (shape.type === 'line' && shape.x2 != null && shape.y2 != null) {
                    ctx.beginPath();
                    ctx.moveTo(shape.x, shape.y);
                    ctx.lineTo(shape.x2, shape.y2);
                    ctx.stroke();
                    if (shape.id === selectedShapeId) {
                        const r = 6 / (shape.scale || 1);
                        ctx.fillStyle = "white";
                        ctx.beginPath();
                        ctx.arc(shape.x, shape.y, r, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(shape.x2, shape.y2, r, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                } else if (shape.type === 'text' && shape.fontSize != null && shape.text != null) {
                    ctx.font = `${shape.fontSize}px ${shape.fontFamily || 'Arial'}`;
                    ctx.fillStyle = shape.color || "white";
                    ctx.textBaseline = 'alphabetic';
                    ctx.fillText(shape.text, shape.x, shape.y);
                    if (shape.id === selectedShapeId) {
                        const metrics = ctx.measureText(shape.text);
                        ctx.strokeStyle = "yellow";
                        ctx.lineWidth = 1;
                        ctx.strokeRect(shape.x, shape.y - shape.fontSize, metrics.width, shape.fontSize);
                    }
                }
            } catch (error) {
                console.error(`Error rendering shape ${shape.id}:`, error, shape);
            }
            ctx.restore();
        });
    }, [shapes, canvasDimensions, selectedShapeId]);

    useEffect(() => {
        const updateCanvasDimensions = () => {
            const sidebarWidth = collapsed ? 80 : 256;
            setCanvasDimensions({
                width: window.innerWidth - sidebarWidth - 40,
                height: window.innerHeight - 80 - 40
            });
        };
        updateCanvasDimensions();
        window.addEventListener('resize', updateCanvasDimensions);
        return () => window.removeEventListener('resize', updateCanvasDimensions);
    }, [collapsed]);

    const saveShapeToServer = useCallback(async (shape: Shape) => {
        if (!roomId) return;
        try {
            await fetch(`${API_BASE_URL}/api/room/${roomId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shape)
            });
        } catch (error) {
            console.error("Failed to save shape:", error);
        }
    }, [roomId]);

    const deleteShapeFromServer = useCallback(async (shapeId: string) => {
        if (!shapeId) return;
        try {
            await fetch(`${API_BASE_URL}/api/room/shape/${shapeId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error("Failed to delete shape from server:", error);
        }
    }, []);

    const broadcastData = useCallback((data: object) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(data));
        } else {
            console.warn("WebSocket not open. Message not sent:", data);
        }
    }, []);

    // No changes to getCoords or hitTest
    const getCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };
    const hitTest = useCallback((x: number, y: number, shape: Shape, ctx: CanvasRenderingContext2D): boolean => {
        if (!shape) return false;
        const localMouse = getLocalMouseCoordinates({ x, y }, shape, ctx);
        const tol = 10 / (shape.scale || 1);
        switch (shape.type) {
            case 'rectangle': if (typeof shape.width !== 'number' || typeof shape.height !== 'number') return false; return localMouse.x >= shape.x - tol && localMouse.x <= shape.x + shape.width + tol && localMouse.y >= shape.y - tol && localMouse.y <= shape.y + shape.height + tol;
            case 'circle': if (typeof shape.radius !== 'number') return false; return Math.hypot(localMouse.x - shape.x, localMouse.y - shape.y) <= shape.radius + tol;
            case 'line': { if (typeof shape.x2 !== 'number' || typeof shape.y2 !== 'number') return false; const { x: x1, y: y1, x2, y2 } = shape; const dStart = Math.hypot(localMouse.x - x1, localMouse.y - y1); const dEnd = Math.hypot(localMouse.x - x2, localMouse.y - y2); if (dStart < tol || dEnd < tol) return true; const len = Math.hypot(x2 - x1, y2 - y1); if (len === 0) return dStart < tol; let t = ((localMouse.x - x1) * (x2 - x1) + (localMouse.y - y1) * (y2 - y1)) / (len * len); t = Math.max(0, Math.min(1, t)); const closestX = x1 + t * (x2 - x1); const closestY = y1 + t * (y2 - y1); const distToLine = Math.hypot(localMouse.x - closestX, localMouse.y - closestY); return distToLine < tol; }
            case 'pencil': { if (!shape.points || !Array.isArray(shape.points) || shape.points.length < 2) return false; for (let i = 0; i < shape.points.length - 1; i++) { const p1 = shape.points[i]; const p2 = shape.points[i + 1]; if (typeof p1.x !== 'number' || typeof p1.y !== 'number' || typeof p2.x !== 'number' || typeof p2.y !== 'number') continue; const lenSq = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2; if (lenSq === 0) continue; let t = ((localMouse.x - p1.x) * (p2.x - p1.x) + (localMouse.y - p1.y) * (p2.y - p1.y)) / lenSq; t = Math.max(0, Math.min(1, t)); const closestX = p1.x + t * (p2.x - p1.x); const closestY = p1.y + t * (p2.y - p1.y); const distToSegment = Math.hypot(localMouse.x - closestX, localMouse.y - closestY); if (distToSegment <= tol) return true; } return false; }
            case 'text': { if (typeof shape.fontSize !== 'number' || typeof shape.text !== 'string') return false; const textWidth = ctx.measureText(shape.text).width; return (localMouse.x >= shape.x - tol && localMouse.x <= shape.x + textWidth + tol && localMouse.y >= shape.y - shape.fontSize - tol && localMouse.y <= shape.y + tol); }
            default: return false;
        }
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => { e.preventDefault(); const coords = getCoords(e); const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d")!; const clickedShape = shapes.slice().reverse().find(shape => hitTest(coords.x, coords.y, shape, ctx)); if (clickedShape) { if (selectedTool === 'eraser') { setShapes(prev => prev.filter(s => s.id !== clickedShape.id)); broadcastData({ type: 'delete', id: clickedShape.id }); deleteShapeFromServer(clickedShape.id); return; } setSelectedShapeId(clickedShape.id); initialShapeStateRef.current = { ...clickedShape }; setIsTransforming(true); if ('touches' in e && e.touches.length === 2) { const t1 = e.touches[0]; const t2 = e.touches[1]; const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY); const angle = Math.atan2(t1.clientY - t2.clientY, t1.clientX - t2.clientX); initialGestureStateRef.current = { distance, angle }; } else { transformStartPointRef.current = coords; if (clickedShape.type === 'line' && clickedShape.x2 != null && clickedShape.y2 != null) { const localMouse = getLocalMouseCoordinates(coords, clickedShape, ctx); const handleRadius = 15 / (clickedShape.scale || 1); if (Math.hypot(localMouse.x - clickedShape.x, localMouse.y - clickedShape.y) < handleRadius) { setLineDragHandle('start'); } else if (Math.hypot(localMouse.x - clickedShape.x2, localMouse.y - clickedShape.y2) < handleRadius) { setLineDragHandle('end'); } else { setLineDragHandle('body'); } } } return; } setSelectedShapeId(null); if (selectedTool === 'eraser') return; if (selectedTool === 'text') { setIsTyping(true); setTextInputPosition({ x: coords.x + canvas.getBoundingClientRect().left, y: coords.y + canvas.getBoundingClientRect().top }); setTextInputValue(''); setCurrentDrawingShapeId(null); return; } setIsDrawing(true); startPointRef.current = coords; const newShapeId = generateId(); const defaultTransform = { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 }; let newShape: Shape; switch (selectedTool) { case 'pencil': newShape = { id: newShapeId, type: 'pencil', points: [coords], x: coords.x, y: coords.y, ...defaultTransform }; break; case 'rectangle': newShape = { id: newShapeId, type: 'rectangle', x: coords.x, y: coords.y, width: 0, height: 0, ...defaultTransform }; break; case 'circle': newShape = { id: newShapeId, type: 'circle', x: coords.x, y: coords.y, radius: 0, ...defaultTransform }; break; case 'line': newShape = { id: newShapeId, type: 'line', x: coords.x, y: coords.y, x2: coords.x, y2: coords.y, ...defaultTransform }; break; default: return; } setCurrentDrawingShapeId(newShapeId); setShapes(prev => [...prev, newShape]); }, [selectedTool, shapes, hitTest, deleteShapeFromServer, broadcastData, generateId]);
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => { e.preventDefault(); const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d")!; let updatedShape: Shape | null = null; if (isTransforming && selectedShapeId && initialShapeStateRef.current) { const initialShape = initialShapeStateRef.current; setShapes(prev => prev.map(s => { if (s.id === selectedShapeId) { updatedShape = { ...s }; if ('touches' in e && e.touches.length === 2) { const t1 = e.touches[0]; const t2 = e.touches[1]; const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY); const currentAngle = Math.atan2(t1.clientY - t2.clientY, t1.clientX - t2.clientX); if (initialGestureStateRef.current) { updatedShape.scale = (initialShape.scale || 1) * (currentDist / initialGestureStateRef.current.distance); updatedShape.rotation = (initialShape.rotation || 0) + (currentAngle - initialGestureStateRef.current.angle); } } else if (updatedShape.type === 'line' && lineDragHandle && lineDragHandle !== 'body') { const localMouse = getLocalMouseCoordinates(getCoords(e), initialShape, ctx); if (lineDragHandle === 'start') { updatedShape.x = localMouse.x; updatedShape.y = localMouse.y; } else { updatedShape.x2 = localMouse.x; updatedShape.y2 = localMouse.y; } } else { const coords = getCoords(e); const altPressed = 'altKey' in e && e.altKey; const shiftPressed = 'shiftKey' in e && e.shiftKey; if (altPressed) { const center = getShapeCenter(initialShape); if (transformStartPointRef.current) { const startVec = new Complex(transformStartPointRef.current.x - center.x, transformStartPointRef.current.y - center.y); const currentVec = new Complex(coords.x - center.x, coords.y - center.y); updatedShape.rotation = (initialShape.rotation || 0) + (currentVec.angle - startVec.angle); } } else if (shiftPressed && updatedShape.type !== 'line') { const center = getShapeCenter(initialShape); if (transformStartPointRef.current) { const initialDist = Math.hypot(transformStartPointRef.current.x - center.x, transformStartPointRef.current.y - center.y); const currentDist = Math.hypot(coords.x - center.x, coords.y - center.y); if (initialDist > 0) { updatedShape.scale = (initialShape.scale || 1) * (currentDist / initialDist); } } } else { if (transformStartPointRef.current) { const deltaX = coords.x - transformStartPointRef.current.x; const deltaY = coords.y - transformStartPointRef.current.y; updatedShape.offsetX = (initialShape.offsetX || 0) + deltaX; updatedShape.offsetY = (initialShape.offsetY || 0) + deltaY; } } } return updatedShape; } return s; })); } else if (isDrawing && currentDrawingShapeId) { setShapes(prev => prev.map(s => { if (s.id === currentDrawingShapeId) { updatedShape = { ...s }; const start = startPointRef.current!; const currentCoords = getCoords(e); switch (updatedShape.type) { case 'pencil': if (updatedShape.points && Array.isArray(updatedShape.points)) { updatedShape.points.push(currentCoords); } else { updatedShape.points = [currentCoords]; } break; case 'rectangle': updatedShape.x = Math.min(start.x, currentCoords.x); updatedShape.y = Math.min(start.y, currentCoords.y); updatedShape.width = Math.abs(start.x - currentCoords.x); updatedShape.height = Math.abs(start.y - currentCoords.y); break; case 'circle': updatedShape.radius = Math.hypot(currentCoords.x - start.x, currentCoords.y - start.y) / 2; updatedShape.x = (start.x + currentCoords.x) / 2; updatedShape.y = (start.y + currentCoords.y) / 2; break; case 'line': updatedShape.x2 = currentCoords.x; updatedShape.y2 = currentCoords.y; break; default: break; } return updatedShape; } return s; })); } if (updatedShape) { broadcastData({ type: 'shape', shape: updatedShape }); } }, [isDrawing, isTransforming, selectedShapeId, lineDragHandle, broadcastData]);
    const handleEndDrawing = useCallback(() => { const finalShapeId = isDrawing ? currentDrawingShapeId : selectedShapeId; if (finalShapeId) { const finalShape = shapes.find(s => s.id === finalShapeId); if (finalShape) { saveShapeToServer(finalShape); } } setIsDrawing(false); setIsTransforming(false); setLineDragHandle(null); setCurrentDrawingShapeId(null); setSelectedShapeId(null); initialGestureStateRef.current = null; }, [isDrawing, shapes, saveShapeToServer, currentDrawingShapeId, selectedShapeId]);
    const handleTextInputBlur = useCallback(() => { if (isTyping && textInputValue.trim() !== '' && textInputPosition && canvasRef.current) { const newShapeId = currentDrawingShapeId || generateId(); const canvasRect = canvasRef.current.getBoundingClientRect(); const newTextShape: Shape = { id: newShapeId, type: 'text', x: textInputPosition.x - canvasRect.left, y: textInputPosition.y - canvasRect.top, text: textInputValue, fontSize: 24, fontFamily: 'Arial', color: 'white', offsetX: 0, offsetY: 0, rotation: 0, scale: 1, }; setShapes(prev => { const existingIndex = prev.findIndex(s => s.id === newShapeId); if (existingIndex !== -1) { const updatedShapes = [...prev]; updatedShapes[existingIndex] = newTextShape; return updatedShapes; } return [...prev, newTextShape]; }); saveShapeToServer(newTextShape); broadcastData({ type: 'shape', shape: newTextShape }); } setIsTyping(false); setTextInputPosition(null); setTextInputValue(''); setCurrentDrawingShapeId(null); }, [isTyping, textInputValue, textInputPosition, currentDrawingShapeId, generateId, saveShapeToServer, broadcastData]);

    const handleSendMessage = () => {
        if (inputValue.trim() === '' || !userInfo) return;

        const messagePayload = {
            type: 'chat_message',
            message: {
                id: generateId(), 
                senderId: userInfo.userId,
                senderFirstName: userInfo.firstname,
                senderLastName: userInfo.lastname || '',
                text: inputValue,
                timestamp: Date.now()
            }
        };

        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(messagePayload));
            setInputValue(''); // Clear input after sending
        } else {
            console.warn("WebSocket not open. Chat message not sent.");
        }
    };
    
    return (
        <div style={{ display: 'flex', height: '100vh', background: '#333', color: 'white' }}>
            <Sidebar collapsed={collapsed} backgroundColor="#222" style={{ height: '100%', borderRight: '1px solid #444' }}>
                <Menu>
                    <MenuItem onClick={() => setCollapsed(!collapsed)} style={{ textAlign: 'center', padding: '10px 0' }}>{collapsed ? 'Expand' : 'Collapse'}</MenuItem>
                    <hr style={{ borderColor: '#444' }} />
                    <MenuItem active={selectedTool === "pencil"} onClick={() => setSelectedTool("pencil")}>Pencil</MenuItem>
                    <MenuItem active={selectedTool === "rectangle"} onClick={() => setSelectedTool("rectangle")}>Rectangle</MenuItem>
                    <MenuItem active={selectedTool === "circle"} onClick={() => setSelectedTool("circle")}>Circle</MenuItem>
                    <MenuItem active={selectedTool === "line"} onClick={() => setSelectedTool("line")}>Line</MenuItem>
                    <MenuItem active={selectedTool === "text"} onClick={() => setSelectedTool("text")}>Text</MenuItem>
                    <MenuItem active={selectedTool === "eraser"} onClick={() => setSelectedTool("eraser")}>Eraser</MenuItem>
                    <SubMenu label="Online Users">
                        {onlineUsers.length > 0 ? (onlineUsers.map(user => (<MenuItem key={user.userId}>{user.firstname} {user.lastname} {user.userId === userInfo?.userId ? '(You)' : ''}</MenuItem>))) : (<MenuItem disabled>No other users online</MenuItem>)}
                    </SubMenu>
                </Menu>
            </Sidebar>
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
                <h1 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>Drawing Board - Room: {roomId}</h1>
                <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #444', position: 'relative' }}>
                    <canvas ref={canvasRef} width={canvasDimensions.width} height={canvasDimensions.height} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleEndDrawing} onMouseLeave={handleEndDrawing} onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleEndDrawing} style={{ background: '#282c34', display: 'block', border: '1px solid #555' }} />
                    {isTyping && textInputPosition && (<input type="text" value={textInputValue} onChange={(e) => setTextInputValue(e.target.value)} onBlur={handleTextInputBlur} autoFocus style={{ position: 'absolute', left: textInputPosition.x, top: textInputPosition.y, background: 'rgba(0,0,0,0.7)', color: 'white', border: '1px solid #00bcd4', padding: '5px', fontSize: '24px', minWidth: '50px', outline: 'none', transform: 'translate(-50%, -50%)', zIndex: 1000 }} onKeyDown={(e) => { if (e.key === 'Enter') { handleTextInputBlur(); } }} />)}
                </div>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', height: '200px', border: '1px solid #444', padding: '10px', background: '#222' }}>
                    <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '10px', paddingRight: '10px' }}>
                        {messages.map((msg) => (<div key={msg.id} style={{ marginBottom: '5px' }}><strong style={{ color: '#00bcd4' }}>{msg.senderFirstName}{msg.senderLastName ? ` ${msg.senderLastName}` : ''}:</strong> {msg.text}<span style={{ fontSize: '0.8em', color: '#aaa', marginLeft: '10px' }}>{new Date(msg.timestamp).toLocaleTimeString()}</span></div>))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." style={{ flexGrow: 1, padding: '8px', border: '1px solid #555', borderRadius: '4px', background: '#333', color: 'white', marginRight: '10px' }} />
                        <button onClick={handleSendMessage} disabled={!wsConnected} style={{ padding: '8px 15px', background: wsConnected ? '#007bff' : '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: wsConnected ? 'pointer' : 'not-allowed' }}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}