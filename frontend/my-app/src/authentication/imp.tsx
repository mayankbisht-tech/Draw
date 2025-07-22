import React, { useEffect, useRef, useState } from "react";
import { type ToolType, type Shape } from "./types";
import Pencil from "../components/pencil/pencil";

import Rectangle from "../components/rectangle/rectangle";
import Circle from "../components/circle/circle";
import Line from "../components/line/line";
import Eraser from "../components/eraser/eraser";
import CanvasLayer from "../components/CanvasLayer";
import { useParams } from "react-router-dom";


export default function Imp(){
  const params=useParams<{ roomId: string }>();
  const roomId = params.roomId || "defaultRoom"; 
  const [selectedTool, setSelectedTool] = useState<ToolType>("rectangle");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("No token found");
      return;
    }

    socketRef.current = new WebSocket(`ws://localhost:8080?roomId=${roomId}&token=${token}`);

    socketRef.current.onopen = () => {
      console.log("WebSocket connection opened");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "load_previous_shapes") {
        setShapes(data.shapes);
      }

      if (data.type === "draw_shape") {
        setShapes((prev) => [...prev, data.shape]);
      }

      if (data.type === "delete_shape") {
        setShapes((prev) => prev.filter((shape) => shape.id !== data.shapeId));
      }
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socketRef.current?.close();
    };
  }, [roomId]);

  const broadcastShape = (shape: Shape) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "draw_shape",
          shape,
          roomId,
        })
      );
    } else {
      console.warn("WebSocket not connected");
    }
  };

  const broadcastDelete = (id: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "delete_shape",
          shapeId: id,
          roomId,
        })
      );
    } else {
      console.warn("WebSocket not connected");
    }
  };

  return (
    <div>
      <div className="h-screen w-screen flex flex-col items-center bg-black">

        <div 
          className="mt-5 h-[4rem] w-[50rem] border-2 rounded-xl bg-stone-900 flex items-center justify-items-start px-4 z-50" 
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

      <CanvasLayer
        shapes={shapes}
        broadcastShape={broadcastShape}
        broadcastDelete={broadcastDelete}
      />

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
        <Eraser 
          shapes={shapes} 
          setShapes={setShapes} 
          broadcastDelete={broadcastDelete} 
        />
      )}
    </div>
  );
}