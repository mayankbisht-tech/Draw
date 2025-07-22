import { useEffect, useRef, useState } from "react";
import { type Shape } from "../authentication/types";
import { useParams } from "react-router-dom";
import Eraser from "../components/eraser/eraser";
import Line from "../components/line/line";
import CircleCanvas from "../components/circle/circle";
import Rectangle from "../components/rectangle/rectangle";
import Pencil from "../components/pencil/pencil";
import CanvasLayer from "../components/CanvasLayer";
type Props = {
  broadcastShape: (shape: Shape) => void;
  broadcastDelete: (id: string) => void;
};
export default function Imp({ broadcastShape, broadcastDelete }: Props) {
  const [selectedTool, setSelectedTool] = useState<"pencil" | "rectangle" | "circle" | "line" | "eraser">("pencil");
  const { roomId } = useParams<{ roomId: string }>();
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setCurrentPoints([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCurrentPoints((prev) => [...prev, point]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || currentPoints.length === 0) return;
    const newShape: Shape = {
      id: crypto.randomUUID(),
      type: "pencil",
      x: 0,
      y: 0,
      points: currentPoints,
    };
    setShapes((prev) => [...prev, newShape]);
    broadcastShape(newShape);
    setIsDrawing(false);
    setCurrentPoints([]);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    setCurrentPoints([{ x: touch.clientX - rect.left, y: touch.clientY - rect.top }]);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const point = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    setCurrentPoints((prev) => [...prev, point]);
  };

  const handleTouchEnd = () => {
    if (!isDrawing || currentPoints.length === 0) return;
    const newShape: Shape = {
      id: crypto.randomUUID(),
      type: "pencil",
      x: 0,
      y: 0,
      points: currentPoints,
    };
    setShapes((prev) => [...prev, newShape]);
    broadcastShape(newShape);
    setIsDrawing(false);
    setCurrentPoints([]);
  };
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`wss://excelidraw-ncsy.onrender.com/?roomId=${roomId}`);
    ws.current = socket;
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "shape") {
        setShapes((prev) => [...prev, data.shape]);
      } else if (data.type === "delete") {
        setShapes((prev) => prev.filter((s) => s.id !== data.id));
      }
    };

    return () => {
      socket.close();
    };
  }, [roomId]);

  return (
  <div className="h-screen w-screen bg-black">
    <CanvasLayer 
      shapes={shapes}
      broadcastShape={broadcastShape}
      broadcastDelete={broadcastDelete}
    />
    
    <div className="relative z-10 flex flex-col items-center">
      <div 
        className="mt-5 h-[4rem] w-[50rem] border-2 rounded-xl bg-stone-900 flex items-center justify-start px-4" 
        style={{ display: "flex", gap: "10px" }}
      >
        <button 
          className={`text-white select-none ${
            selectedTool === "pencil" ? "bg-blue-700" : "bg-gray-800"
          } px-4 py-2 mx-2 rounded`} 
          onClick={() => setSelectedTool("pencil")}
        >
          Pencil
        </button>
        <button 
          className={`text-white select-none ${
            selectedTool === "rectangle" ? "bg-blue-700" : "bg-gray-800"
          } px-4 py-2 mx-2 rounded`} 
          onClick={() => setSelectedTool("rectangle")}
        >
          Rectangle
        </button>
        <button 
          className={`text-white select-none ${
            selectedTool === "circle" ? "bg-blue-700" : "bg-gray-800"
          } px-4 py-2 mx-2 rounded`} 
          onClick={() => setSelectedTool("circle")}
        >
          Circle
        </button>
        <button 
          className={`text-white select-none ${
            selectedTool === "line" ? "bg-blue-700" : "bg-gray-800"
          } px-4 py-2 mx-2 rounded`} 
          onClick={() => setSelectedTool("line")}
        >
          Line
        </button>
        <button 
          className={`text-white select-none ${
            selectedTool === "eraser" ? "bg-blue-700" : "bg-gray-800"
          } px-4 py-2 mx-2 rounded`} 
          onClick={() => setSelectedTool("eraser")}
        >
          Eraser
        </button>
      </div>
    </div>

    {selectedTool === "pencil" && (
      <Pencil
        broadcastShape={broadcastShape}
        shapes={shapes}
        setShapes={setShapes}
      />
    )}
    {selectedTool === "rectangle" && (
      <Rectangle
        broadcastShape={broadcastShape}
        shapes={shapes}
        setShapes={setShapes}
      />
    )}
    {selectedTool === "circle" && (
      <CircleCanvas
        broadcastShape={broadcastShape}
        shapes={shapes}
        setShapes={setShapes}
      />
    )}
    {selectedTool === "line" && (
      <Line
        broadcastShape={broadcastShape}
        shapes={shapes}
        setShapes={setShapes}
      />
    )}
    {selectedTool === "eraser" && (
      <Eraser
        shapes={shapes} 
        setShapes={setShapes} 
        broadcastDelete={broadcastDelete} 
      />
    )}
  </div>
);
}