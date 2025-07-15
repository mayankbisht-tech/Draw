
import { useEffect, useState } from 'react';
import { type Shape } from '../../App';

type Props = {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
};

export default function Rectangle({setShapes }: Props ) {
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.clientY < 64) return;
      setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!startPos) return;
      const x1 = startPos.x;
      const y1 = startPos.y;
      const x2 = e.clientX;
      const y2 = e.clientY;

      const newShape: Shape = {
        id: crypto.randomUUID(),
        type: 'rectangle',
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      };

      setShapes((prev) => [...prev, newShape]);
      setStartPos(null);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [startPos, setShapes]);

  return null;
}
