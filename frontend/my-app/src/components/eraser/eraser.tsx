import { useEffect } from 'react';
import { type Shape } from '../../authentication/types';

type Props = {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  broadcastDelete: (id: string) => void;
  broadcastShape?: never;
};

export default function Eraser({ shapes, setShapes, broadcastDelete }: Props) {
  useEffect(() => {
    const handleErase = (clientX: number, clientY: number) => {
      if (clientY < 64) return;

      const mouseX = clientX;
      const mouseY = clientY;

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
            const dist =
              Math.abs(
                ((shape.y2 ?? 0) - shape.y) * mouseX -
                  ((shape.x2 ?? 0) - shape.x) * mouseY +
                  (shape.x2 ?? 0) * shape.y -
                  (shape.y2 ?? 0) * shape.x
              ) /
              Math.sqrt(
                ((shape.y2 ?? 0) - shape.y) ** 2 + ((shape.x2 ?? 0) - shape.x) ** 2
              );
            return dist <= 5;
          } else if (shape.type === 'pencil' && shape.points) {
            for (let i = 0; i < shape.points.length - 1; i++) {
              const p1 = shape.points[i];
              const p2 = shape.points[i + 1];

              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const length = Math.sqrt(dx * dx + dy * dy);

              const dot =
                ((mouseX - p1.x) * dx + (mouseY - p1.y) * dy) /
                (length * length);

              const closestX = p1.x + dot * dx;
              const closestY = p1.y + dot * dy;

              const dist = Math.sqrt(
                (mouseX - closestX) ** 2 + (mouseY - closestY) ** 2
              );

              if (dot >= 0 && dot <= 1 && dist <= 5) return true;
            }
            return false;
          }
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

    const handleMouseDown = (e: MouseEvent) => {
      handleErase(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        handleErase(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [shapes, setShapes, broadcastDelete]);

  return null;
}
