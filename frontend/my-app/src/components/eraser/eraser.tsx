import { useEffect } from 'react';
import { type Shape } from '../../authentication/imp.tsx';


type Props = {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
};

export default function Eraser({ shapes, setShapes }: Props) {
  useEffect(() => {
    const handleErase = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];

        if (shape.type === 'rectangle') {
          const insideRect =
            x >= shape.x &&
            x <= shape.x + (shape.width || 0) &&
            y >= shape.y &&
            y <= shape.y + (shape.height || 0);

          if (insideRect) {
            setShapes(prev => prev.filter(s => s.id !== shape.id));
            break;
          }
        } else if (shape.type === 'circle') {
          const dist = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
          if (dist <= (shape.radius || 0)) {
            setShapes(prev => prev.filter(s => s.id !== shape.id));
            break;
          }
        } else if (shape.type === 'line') {
          const dist = pointToLineDistance(x, y, shape.x, shape.y, shape.x2!, shape.y2!);
          if (dist <= 10) {
            setShapes(prev => prev.filter(s => s.id !== shape.id));
            break;
          }
        }
      }
    };

    window.addEventListener('mousedown', handleErase);
    return () => window.removeEventListener('mousedown', handleErase);
  }, [shapes, setShapes]);

  return null;
}

function pointToLineDistance(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const A = x0 - x1;
  const B = y0 - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;

  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x0 - xx;
  const dy = y0 - yy;
  return Math.sqrt(dx * dx + dy * dy);
}
