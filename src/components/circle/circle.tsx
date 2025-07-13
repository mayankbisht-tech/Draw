import React, { useState, useRef, useEffect } from 'react';

export default function CircleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [istart, setStart] = useState<{ x: number; y: number } | null>(null);
  const [fstart, setEnd] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      setStart({ x: e.clientX, y: e.clientY });
      setEnd(null);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setEnd({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!istart || !fstart) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dx = fstart.x - istart.x;
    const dy = fstart.y - istart.y;
    const radius = Math.sqrt(dx * dx + dy * dy) / 2;

    const centerX = (istart.x + fstart.x) / 2;
    const centerY = (istart.y + fstart.y) / 2;

    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

  }, [istart, fstart]);

  return (
    <canvas
      id="myCanvas"
      ref={canvasRef}
      className="fixed top-0 left-0 z-10 pointer-events-none"
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}
