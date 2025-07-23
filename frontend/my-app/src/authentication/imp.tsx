import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { type Shape } from "../authentication/types";

type Tool = "pencil" | "rectangle" | "circle" | "line" | "eraser";

export default function Imp() {
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const { roomId } = useParams<{ roomId: string }>();
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = new WebSocket(`ws://localhost:3000/?roomId=${roomId}`);
    ws.current = socket;

    socket.onopen = () => console.log("WebSocket connection established");
    socket.onclose = () => console.log("WebSocket connection closed");
    socket.onerror = (error) => console.error("WebSocket error:", error);

    socket.onmessage = async (event) => {
      let messageData: string;
      if (event.data instanceof Blob) {
        messageData = await event.data.text();
      } else {
        messageData = event.data;
      }
      
      try {
        const data = JSON.parse(messageData);
        switch (data.type) {
          case 'init':
            setShapes(data.shapes || []);
            break;
          case 'shape':
            setShapes((prev) => prev.find(s => s.id === data.shape.id) ? prev : [...prev, data.shape]);
            break;
          case 'delete':
            setShapes((prev) => prev.filter((s) => s.id !== data.id));
            break;
        }
      } catch (error) {
        console.error("Failed to parse incoming message:", error, "Original data:", messageData);
      }
    };

    return () => {
      socket.close();
    };
  }, [roomId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach(shape => {
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      if (shape.type === 'pencil' && shape.points && shape.points.length > 0) {
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
      } else if (shape.type === 'rectangle' && shape.width && shape.height) {
        ctx.rect(shape.x, shape.y, shape.width, shape.height);
        ctx.stroke();
      } else if (shape.type === 'circle' && shape.radius) {
        ctx.arc(shape.x, shape.y, Math.abs(shape.radius), 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shape.type === 'line' && shape.x2 != null && shape.y2 != null) {
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
      }
    });
  }, [shapes]);

  const saveShapeToServer = useCallback(async (shape: Shape) => {
    if (!roomId) return;
    
    const { type, ...props } = shape;

    try {
      await fetch(`http://localhost:3000/api/room/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, props }),
      });
    } catch (error) {
      console.error("Failed to save shape to server:", error);
    }
  }, [roomId]);

  const broadcastData = useCallback((data: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not open. Cannot send data.");
    }
  }, []);

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoords(e);

    if (selectedTool === 'eraser') {
        const mouseX = coords.x;
        const mouseY = coords.y;
        const indexToDelete = [...shapes].reverse().findIndex(shape => {
            if (shape.type === 'rectangle' && shape.width && shape.height) {
                return (mouseX >= shape.x && mouseX <= shape.x + shape.width && mouseY >= shape.y && mouseY <= shape.y + shape.height);
            }
            if (shape.type === 'circle' && shape.radius) {
                const dx = mouseX - shape.x;
                const dy = mouseY - shape.y;
                return dx * dx + dy * dy <= shape.radius * shape.radius;
            }
            if (shape.type === 'line' && shape.x2 != null && shape.y2 != null) {
                const dist = Math.abs(((shape.y2 - shape.y) * mouseX) - ((shape.x2 - shape.x) * mouseY) + (shape.x2 * shape.y) - (shape.y2 * shape.x)) / Math.sqrt(Math.pow(shape.y2 - shape.y, 2) + Math.pow(shape.x2 - shape.x, 2));
                return dist <= 5;
            }
            if (shape.type === 'pencil' && shape.points) {
                for (let i = 0; i < shape.points.length - 1; i++) {
                    const p1 = shape.points[i];
                    const p2 = shape.points[i + 1];
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const lenSq = dx * dx + dy * dy;
                    if (lenSq === 0) continue;
                    let t = ((mouseX - p1.x) * dx + (mouseY - p1.y) * dy) / lenSq;
                    t = Math.max(0, Math.min(1, t));
                    const closestX = p1.x + t * dx;
                    const closestY = p1.y + t * dy;
                    const distSq = Math.pow(mouseX - closestX, 2) + Math.pow(mouseY - closestY, 2);
                    if (distSq <= 25) return true;
                }
                return false;
            }
            return false;
        });

        if (indexToDelete !== -1) {
            const trueIndex = shapes.length - 1 - indexToDelete;
            const idToDelete = shapes[trueIndex].id;
            setShapes(prev => prev.filter(shape => shape.id !== idToDelete));
            broadcastData({ type: 'delete', id: idToDelete });
        }
        return;
    }

    setIsDrawing(true);
    startPointRef.current = coords;

    let newShape: Shape;
    if (selectedTool === 'pencil') {
      newShape = { id: crypto.randomUUID(), type: 'pencil', points: [coords], x: 0, y: 0 };
    } else {
      newShape = { id: crypto.randomUUID(), type: selectedTool, x: coords.x, y: coords.y };
    }
    setShapes(prev => [...prev, newShape]);
  };

  const handleDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedTool === 'eraser') return;
    e.preventDefault();
    const currentCoords = getCoords(e);
    const startCoords = startPointRef.current;
    if (!startCoords) return;

    setShapes(prev => prev.map((shape, index) => {
      if (index !== prev.length - 1) return shape;

      switch (shape.type) {
        case 'pencil':
          return { ...shape, points: [...(shape.points || []), currentCoords] };
        case 'rectangle':
          return { ...shape, x: Math.min(startCoords.x, currentCoords.x), y: Math.min(startCoords.y, currentCoords.y), width: Math.abs(currentCoords.x - startCoords.x), height: Math.abs(currentCoords.y - startCoords.y) };
        case 'circle':
          const dx = currentCoords.x - startCoords.x;
          const dy = currentCoords.y - startCoords.y;
          const radius = Math.sqrt(dx * dx + dy * dy) / 2;
          const centerX = (startCoords.x + currentCoords.x) / 2;
          const centerY = (startCoords.y + currentCoords.y) / 2;
          return { ...shape, x: centerX, y: centerY, radius };
        case 'line':
            return { ...shape, x2: currentCoords.x, y2: currentCoords.y };
        default:
          return shape;
      }
    }));
  };

  const handleEndDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const lastShape = shapes[shapes.length - 1];
    if (lastShape && selectedTool !== 'eraser') {
      broadcastData({ type: 'shape', shape: lastShape });
      saveShapeToServer(lastShape);
    }
    
    startPointRef.current = null;
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center">
      {/* Toolbar */}
      <div className="mt-5 h-[4rem] w-auto max-w-[90vw] border-2 border-gray-700 rounded-xl bg-black flex items-center justify-center px-4 gap-2 flex-wrap">
        {(["pencil", "rectangle", "circle", "line", "eraser"] as Tool[]).map(tool => (
          <button
            key={tool}
            className={`text-white select-none capitalize ${
              selectedTool === tool ? "bg-blue-700" : "bg-gray-800"
            } px-4 py-2 rounded-md transition-colors`}
            onClick={() => setSelectedTool(tool)}
          >
            {tool}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleStartDrawing}
        onMouseMove={handleDrawing}
        onMouseUp={handleEndDrawing}
        onMouseLeave={handleEndDrawing}
        onTouchStart={handleStartDrawing}
        onTouchMove={handleDrawing}
        onTouchEnd={handleEndDrawing}
        width={window.innerWidth * 0.95}
        height={window.innerHeight * 0.8}
        className="bg-black mt-4 rounded-lg"
      />
    </div>
  );
}
