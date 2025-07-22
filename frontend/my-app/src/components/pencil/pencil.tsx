import { useEffect, useRef } from "react";
import { type Shape } from "../../authentication/types";
import { v4 as uuidv4 } from "uuid";

type Props = {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  broadcastShape: (shape: Shape) => void;
};

export default function Pencil({ shapes, setShapes, broadcastShape }: Props) {
  const isDrawing = useRef(false);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  // Handle both mouse and touch coordinates
  const getPoint = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      const target = touch.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return { x: e.offsetX, y: e.offsetY };
    }
  };

  useEffect(() => {
    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDrawing.current = true;
      const point = getPoint(e);
      pointsRef.current = [point];
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      const point = getPoint(e);
      pointsRef.current.push(point);
    };

    const handleEnd = () => {
      if (!isDrawing.current || pointsRef.current.length < 2) return;

      const newShape: Shape = {
        id: uuidv4(),
        type: "pencil",
        x: 0,
        y: 0,
        points: [...pointsRef.current],
      };

      setShapes(prev => [...prev, newShape]);
      broadcastShape(newShape);
      pointsRef.current = [];
      isDrawing.current = false;
    };

    // Mouse Events
    window.addEventListener("mousedown", handleStart);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);

    // Touch Events
    window.addEventListener("touchstart", handleStart);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousedown", handleStart);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchstart", handleStart);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [setShapes, broadcastShape]);

  return null; // No visible UI
}
