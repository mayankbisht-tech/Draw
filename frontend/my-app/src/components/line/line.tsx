import { useEffect, useState } from "react";
import { type Shape } from "../../authentication/imp";

type Props = {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  broadcastShape: (shape: Shape) => void;
};

export default function Line({ setShapes, broadcastShape }: Props) {
  const [line, setLine] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mouseDown = (e: MouseEvent) => {
      if (e.clientY < 64) return;
      setLine({ x: e.clientX, y: e.clientY });
    };

    const mouseUp = (e: MouseEvent) => {
      if (!line) return;

      const newShape: Shape = {
        id: crypto.randomUUID(),
        type: "line",
        x: line.x,
        y: line.y,
        x2: e.clientX,
        y2: e.clientY,
      };

      setShapes((prev) => [...prev, newShape]);
      broadcastShape(newShape); 
      setLine(null);
    };

    window.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    return () => {
      window.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("mouseup", mouseUp);
    };
  }, [line, setShapes, broadcastShape]); 

  return null;
}
