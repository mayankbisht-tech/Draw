import { useEffect, useRef } from 'react';
import { type Shape } from '../authentication/imp';

type Props = {
  shapes: Shape[];
};

export default function CanvasLayer({ shapes }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;

      switch (shape.type) {
        case 'rectangle':
          ctx.strokeRect(shape.x, shape.y, shape.width!, shape.height!);
          break;

        case 'circle':
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.radius!, 0, 2 * Math.PI);
          ctx.stroke();
          break;

        case 'line':
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x2!, shape.y2!);
          ctx.stroke();
          break;
      }
    });
  }, [shapes]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="fixed top-0 left-0 z-0 pointer-events-none"
      style={{ backgroundColor: 'transparent' }}
    />
  );
}
