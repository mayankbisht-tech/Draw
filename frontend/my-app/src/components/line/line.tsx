import { useEffect, useState } from "react";
import { type Shape } from "../../authentication/imp.tsx"

type Props = {
    shapes: Shape[];
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
};

export default function line({setShapes }: Props){
    const [line,setLine]=useState<{ x: number; y: number } | null>(null);
    useEffect(()=>{    
        const mouseDown=(e:MouseEvent)=>{
            if(e.clientY<64) return 
            setLine({x:e.clientX,y:e.clientY})
        }
        const mouseUp=(e:MouseEvent)=>{
            if (!line) return;

      const newShape: Shape = {
        id: crypto.randomUUID(),
        type: 'line',
        x: line.x,
        y: line.y,
        x2: e.clientX,
        y2: e.clientY,
      };

    
          setShapes((prev) => [...prev, newShape]);
          setLine(null);
        };
        window.addEventListener('mousedown',mouseDown);
        window.addEventListener('mouseup', mouseUp);
        return () => {
          window.removeEventListener('mousedown', mouseDown);
          window.removeEventListener('mouseup', mouseUp);
        };
      }, [line,setLine]);
    
    return null 
} 