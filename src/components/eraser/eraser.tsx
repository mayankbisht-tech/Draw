import { useEffect } from 'react';
import { type Shape } from '../../App';

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
            x <= shape.x + shape.width! &&
            y >= shape.y &&
            y <= shape.y + shape.height!;
          if (insideRect) {
            setShapes(prev => prev.filter(s => s.id !== shape.id));
            break;
        }
        } else if (shape.type === 'circle') {
          const dist = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
          if (dist <= shape.radius!) {
            setShapes(prev => prev.filter(s => s.id !== shape.id));
            break; 
        }
        }
      }
    };

    window.addEventListener('mousedown', handleErase);
    return () => window.removeEventListener('mousedown', handleErase);
  }, [shapes]);

  return null;
}
