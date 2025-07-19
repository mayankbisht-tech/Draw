import React, { useEffect, useRef, useState } from "react";
import { type ToolType, type Shape } from "./types";
import Rectangle from "../components/rectangle/rectangle";
import Circle from "../components/circle/circle";
import Line from "../components/line/line";
import Eraser from "../components/eraser/eraser";
import CanvasLayer from "../components/CanvasLayer";

export default function Imp() {
  const [selectedTool, setSelectedTool] = useState<ToolType>("rectangle");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const roomId = localStorage.getItem("roomId"); // make sure this is set when user joins
  const token = localStorage.getItem("token");   // make sure this is set after login/signup

  useEffect(() => {
    if (!roomId || !token) {
      console.error("Missing roomId or token");
      return;
    }

    const wsURL = `ws://localhost:8080?roomId=${roomId}&token=${token}`;
    socketRef.current = new WebSocket(wsURL);

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "load_previous_shapes") {
        setShapes(data.shapes); // ← Load previous shapes
      }

      if (data.type === "draw") {
        setShapes((prev) => [...prev, data.shape]);
      }

      if (data.type === "delete") {
        setShapes((prev) => prev.filter((shape) => shape.id !== data.id));
      }
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socketRef.current?.close();
    };
  }, [roomId, token]);

  const broadcastShape = (shape: Shape) => {
    socketRef.current?.send(
      JSON.stringify({ type: "draw", shape, roomId })
    );
  };

  const broadcastDelete = (id: string) => {
    socketRef.current?.send(
      JSON.stringify({ type: "delete", id, roomId })
    );
  };

  return (
    <div>
      <div className="h-screen w-screen flex flex-col items-center bg-black">
        <div className="mt-5 h-[4rem] w-[50rem] border-2 rounded-xl bg-stone-900 flex items-center justify-items-start px-4 z-50" style={{ display: "flex", gap: "10px" }}>
        <button className={`text-white select-none ${selectedTool==="rectangle" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`} onClick={() => setSelectedTool("rectangle")}>Rectangle</button>
        <button className={`text-white select-none ${selectedTool==="circle" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`} onClick={() => setSelectedTool("circle")}>Circle</button>
        <button className={`text-white select-none ${selectedTool==="line" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`} onClick={() => setSelectedTool("line")}>Line</button>
        <button className={`text-white select-none ${selectedTool==="eraser" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`} onClick={() => setSelectedTool("eraser")}>Eraser</button>
      </div>
    </div>
      <CanvasLayer shapes={shapes} />

      {selectedTool === "rectangle" && (
        <Rectangle
          broadcastShape={broadcastShape}
          shapes={shapes}
          setShapes={setShapes}
        />
      )}
      {selectedTool === "circle" && (
        <Circle
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
        <Eraser shapes={shapes} setShapes={setShapes} broadcastDelete={broadcastDelete} />
      )}
    </div>
  );
}
