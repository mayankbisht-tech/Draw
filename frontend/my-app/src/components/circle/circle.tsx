import { useEffect, useState } from 'react';
import { type Shape } from '../../authentication/imp.tsx';


type Props = {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
};

export default function CircleCanvas({ setShapes }: Props) {
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.clientY < 64) return;
      setStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!start) return;

      const x2 = e.clientX;
      const y2 = e.clientY;

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
      setStart(null);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [start, setShapes]);

  return null;
}
