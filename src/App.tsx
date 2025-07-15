import './App.css';
import Rectangle from './components/rectangle/rectangle.tsx'; 
import CircleCanvas from './components/circle/circle.tsx';
import Eraser from './components/eraser/eraser.tsx';
import CanvasLayer from './components/canvas/CanvasLayer.tsx'
import Line from './components/line/line.tsx';
import { useState } from 'react';


export type Shape = {
  id: string;
  type: 'rectangle' | 'circle'|"line";
  x: number;
  y: number;
  x2?:number;
  y2?:number;
  height?: number;
  width?: number;
  radius?: number;
};

function App(){

   const [tool, setTool] = useState<'rectangle'|'Line' | 'circle' | 'eraser'>('circle');
  const [shapes, setShapes] = useState<Shape[]>([]);

  return (

  <div>
    <div className='h-screen w-screen flex flex-col items-center bg-black'>
      <div className="mt-5 h-[4rem] w-[50rem] border-4 rounded-xl bg-stone-900 flex items-center justify-items-start px-4 z-50">
        <button onClick={()=>setTool("rectangle")} className={`text-white select-none ${tool==="rectangle" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`}>Rectangle</button>
        <button onClick={()=>setTool("circle")} className={`text-white select-none ${tool==="circle" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`}>Circle</button>
        <button onClick={()=>setTool("Line")} className={`text-white select-none ${tool==="Line" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`}>Line</button>
        <button onClick={()=>setTool("eraser")} className={`text-white select-none ${tool==="eraser" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`}>Eraser</button>
        

    </div>
  <CanvasLayer shapes={shapes} />
  {tool==="rectangle"&&<Rectangle shapes={shapes} setShapes={setShapes}/>}
  {tool==="circle"&&<CircleCanvas shapes={shapes} setShapes={setShapes}/>}
  {tool==="eraser"&&<Eraser shapes={shapes} setShapes={setShapes}/>}
  {tool==="Line"&&<Line shapes={shapes} setShapes={setShapes}/>}



  </div>
  </div>
  );
}

export default App;
