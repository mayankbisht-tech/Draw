import { useEffect, useRef } from "react";
import { type Shape } from "../../authentication/types";
import { v4 as uuidv4 } from "uuid";

type Props = {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  broadcastShape: (shape: Shape) => void;
};

export default function pencil({ shapes, setShapes, broadcastShape }: Props) {
  const isDrawing = useRef(false);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isDrawing.current = true;
      pointsRef.current = [{ x: e.offsetX, y: e.offsetY }];
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing.current) return;
      pointsRef.current.push({ x: e.offsetX, y: e.offsetY });
    };

    const handleMouseUp = () => {
      if (!isDrawing.current || pointsRef.current.length < 2) return;

      const newpencilShape: Shape = {
        id: uuidv4(),
        type: "pencil",
        x: 0,
        y: 0,
        points: [...pointsRef.current],
      };

      setShapes(prev => [...prev, newpencilShape]);
      broadcastShape(newpencilShape);

      pointsRef.current = [];
      isDrawing.current = false;
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setShapes, broadcastShape]);

  return null; // No visible UI
}
