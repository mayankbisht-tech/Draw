import './App.css';
import Rectangle from './components/rectangle/rectangle.tsx'; 
import CircleCanvas from './components/circle/circle.tsx';
import { useState } from 'react';
function App(){
const [curr,setCurr]=useState("circle")

  return (

  <div>
    <div className='h-screen w-screen flex flex-col items-center bg-black'>
      <div className="mt-5 h-[4rem] w-[50rem] border-4 rounded-xl bg-stone-900 flex items-center justify-items-start px-4">
        <button onClick={()=>setCurr("rectangle")} className={`text-white select-none ${curr=="rectangle" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`}>Rectangle</button>
        <button onClick={()=>setCurr("circle")} className={`text-white select-none ${curr=="circle" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`}>Circle</button>
        <button onClick={()=>setCurr("eraser")} className={`text-white select-none ${curr=="eraser" ?"bg-blue-700":"bg-gray-800"} px-4 py-2 mx-2 rounded`}>Eraser</button>

    </div>
  {curr==="rectangle"&&<Rectangle/>}
  {curr==="circle"&&<CircleCanvas/>}
  {curr==="eraser"&&<Eraser/>}


  </div>
  </div>
  );
}

export default App;
