import { useNavigate } from 'react-router-dom';
import '../../App.css';
export default function Dashboard(){
    const navigate=useNavigate();
    return (
        <div className="w-screen h-screen flex-col bg-gradient-to-br from-slate-700 via-zinc-800 to-stone-900 flex justify-center items-center">
      
      <div>
        <p className="text-9xl text-shadow-teal-900 text-white mb-4">Draw</p>
      </div>
      <div>
        <button
          onClick={() => navigate('/signin')}
          className="bg-zinc-700 hover:bg-zinc-600 text-white transition-colors duration-300 mx-2 font-bold py-2 px-4 rounded"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="bg-zinc-700 hover:bg-zinc-600 text-white transition-colors duration-300 mx-2 font-bold py-2 px-4 rounded"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}