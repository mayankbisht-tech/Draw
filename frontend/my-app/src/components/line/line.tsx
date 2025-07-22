import { useEffect, useState } from 'react';
import { type Shape } from '../../authentication/types';

type Props = {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  broadcastShape: (shape: Shape) => void;
};

export default function Rectangle({ setShapes, broadcastShape }: Props) {
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  const getCoords = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  };

  useEffect(() => {
    const handleStart = (e: MouseEvent | TouchEvent) => {
      const { x, y } = getCoords(e);
      if (y < 64) return;
      setStartPos({ x, y });
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (!startPos) return;

      const { x: x2, y: y2 } = getCoords(e);
      const { x: x1, y: y1 } = startPos;

      const newShape: Shape = {
        id: crypto.randomUUID(),
        type: 'rectangle',
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      };

      setShapes((prev) => [...prev, newShape]);
      broadcastShape(newShape);
      setStartPos(null);
    };

    window.addEventListener('mousedown', handleStart);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchstart', handleStart);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [startPos, setShapes, broadcastShape]);

  return null;
}
