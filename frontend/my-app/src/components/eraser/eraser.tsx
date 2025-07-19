import { useEffect } from 'react';
import {type Shape } from '../../authentication/types';

type Props = {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  broadcastDelete: (id: string) => void;
  broadcastShape?: never; 
};

export default function Eraser({ shapes, setShapes, broadcastDelete }: Props) {
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.clientY < 64) return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const index = [...shapes]
        .reverse()
        .findIndex((shape) => {
          if (shape.type === 'rectangle') {
            return (
              mouseX >= shape.x &&
              mouseX <= shape.x + (shape.width ?? 0) &&
              mouseY >= shape.y &&
              mouseY <= shape.y + (shape.height ?? 0)
            );
          } else if (shape.type === 'circle') {
            const dx = mouseX - shape.x;
            const dy = mouseY - shape.y;
            return dx * dx + dy * dy <= (shape.radius || 0) ** 2;
          } else if (shape.type === 'line') {
            const dist = Math.abs(
              ((shape.y2 ?? 0) - shape.y) * mouseX -
                ((shape.x2 ?? 0) - shape.x) * mouseY +
                (shape.x2 ?? 0) * shape.y -
                (shape.y2 ?? 0) * shape.x
            ) /
              Math.sqrt(
                ((shape.y2 ?? 0) - shape.y) ** 2 + ((shape.x2 ?? 0) - shape.x) ** 2
              );
            return dist <= 5;
          }
          return false;
        });

      if (index !== -1) {
        const trueIndex = shapes.length - 1 - index;
        const idToDelete = shapes[trueIndex].id;

        if (idToDelete !== undefined) {
          setShapes((prev) => prev.filter((shape) => shape.id !== idToDelete));
          broadcastDelete(idToDelete);
        }
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [shapes, setShapes, broadcastDelete]);

  return null;
}
