import { useEffect, useState } from 'react';
import { type Shape } from '../../authentication/types';

type Props = {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  broadcastShape: (shape: Shape) => void;
};

export default function CircleCanvas({ shapes, setShapes, broadcastShape }: Props) {
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);

  const getCoords = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  };

  useEffect(() => {
    const handleStart = (e: MouseEvent | TouchEvent) => {
      const { x, y } = getCoords(e);
      if (y < 64) return;
      setStart({ x, y });
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (!start) return;
      const { x: x2, y: y2 } = getCoords(e);

      const dx = x2 - start.x;
      const dy = y2 - start.y;
      const radius = Math.sqrt(dx * dx + dy * dy) / 2;

      const centerX = (start.x + x2) / 2;
      const centerY = (start.y + y2) / 2;

      const newShape: Shape = {
        id: crypto.randomUUID(),
        type: 'circle',
        x: centerX,
        y: centerY,
        radius,
      };

      setShapes((prev) => [...prev, newShape]);
      broadcastShape(newShape);
      setStart(null);
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
  }, [start, setShapes, broadcastShape]);

  return null;
}
