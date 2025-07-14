import { useEffect, useRef } from 'react';
import {type Shape } from '../../App';

type Props = {
  shapes: Shape[];
};

export default function CanvasLayer({ shapes }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;

      if (shape.type === 'rectangle') {
        ctx.strokeRect(shape.x, shape.y, shape.width!, shape.height!);
      } else if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius!, 0, 2 * Math.PI);
        ctx.stroke();
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
