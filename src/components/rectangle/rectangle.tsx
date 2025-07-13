import React, { useEffect, useRef, useState } from 'react';

export default function Rectangle() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [endPos, setEndPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      setStartPos({ x: e.clientX, y: e.clientY });
      setEndPos(null);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setEndPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!startPos || !endPos || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    const x = Math.min(startPos.x, endPos.x);
    const y = Math.min(startPos.y, endPos.y);
    const width = Math.abs(endPos.x - startPos.x);
    const height = Math.abs(endPos.y - startPos.y);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  }, [startPos, endPos]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="fixed top-0 left-0 z-10 pointer-events-none"
      style={{ backgroundColor: 'transparent' }}
    />
  );
}
