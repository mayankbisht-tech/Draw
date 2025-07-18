import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import RectangleTool from "../components/rectangle/rectangle";
import CircleTool from "../components/circle/circle";
import LineTool from "../components/line/line";
import EraserTool from "../components/eraser/eraser";
import CanvasLayer from "../components/CanvasLayer";
export type Shape = {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  x2?: number;
  y2?: number;
};
export const imp = () => {
  const { roomId } = useParams();
  const socketRef = useRef<WebSocket | null>(null);
  const [shapes, setShapes] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState("rectangle");
  
  useEffect(() => {
    if (!roomId) return;

    socketRef.current = new WebSocket(`ws://localhost:8080`);
    socketRef.current.onopen = () => {
      socketRef.current?.send(JSON.stringify({ type: "join-room", roomId }));
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "draw") {
        setShapes((prev) => [...prev, data.shape]);
      }
    };

    return () => {
      socketRef.current?.close();
    };
  }, [roomId]);

  const broadcastShape = (shape: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "draw", shape }));
    }
  };

  return (
    <div>
      <div className='h-screen w-screen flex flex-col items-center bg-black' >
      <div className="mt-5 h-[4rem] w-[50rem] border-2 rounded-xl bg-stone-900 flex items-center justify-items-start px-4 z-50" style={{ display: "flex", gap: "10px" }}>
        <button className={`text-white select-none ${selectedTool==="rectangle" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`} onClick={() => setSelectedTool("rectangle")}>Rectangle</button>
        <button className={`text-white select-none ${selectedTool==="circle" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`} onClick={() => setSelectedTool("circle")}>Circle</button>
        <button className={`text-white select-none ${selectedTool==="line" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`} onClick={() => setSelectedTool("line")}>Line</button>
        <button className={`text-white select-none ${selectedTool==="eraser" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`} onClick={() => setSelectedTool("eraser")}>Eraser</button>
      </div>

      <CanvasLayer shapes={shapes} />

      {selectedTool === "rectangle" && (
        <RectangleTool shapes={shapes} setShapes={setShapes} broadcastShape={broadcastShape} />
      )}
      {selectedTool === "circle" && (
        <CircleTool shapes={shapes} setShapes={setShapes} broadcastShape={broadcastShape} />
      )}
      {selectedTool === "line" && (
        <LineTool shapes={shapes} setShapes={setShapes} broadcastShape={broadcastShape} />
      )}
      {selectedTool === "eraser" && (
        <EraserTool
          shapes={shapes}
          setShapes={setShapes}
          broadcastDelete={(id: string) => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: "delete", id }));
            }
          }}
        />
      )}
      </div>
    </div>
  );
};

export default imp;
