import { useEffect, useState } from 'react';
import { type Shape } from '../../authentication/types';

type Props = {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  broadcastShape: (shape: Shape) => void;
};

export default function Rectangle({ setShapes, broadcastShape }: Props) {
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  const getClientPos = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  };

  useEffect(() => {
    const handleDown = (e: MouseEvent | TouchEvent) => {
      const { x, y } = getClientPos(e);
      if (y < 64) return;
      setStartPos({ x, y });
    };

    const handleUp = (e: MouseEvent | TouchEvent) => {
      if (!startPos) return;
      const { x: x2, y: y2 } = getClientPos(e);

      const x1 = startPos.x;
      const y1 = startPos.y;

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

    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchstart', handleDown, { passive: false });
    window.addEventListener('touchend', handleUp, { passive: false });

    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchstart', handleDown);
      window.removeEventListener('touchend', handleUp);
    };
  }, [startPos, setShapes, broadcastShape]);

  return null;
}
