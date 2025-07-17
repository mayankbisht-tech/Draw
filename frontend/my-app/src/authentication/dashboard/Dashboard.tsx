import Signin from "../signin/signin";
import Signup from "../signup/signup";
import { useNavigate } from 'react-router-dom';
import '../../App.css';
export default function Dashboard(){
    const navigate=useNavigate();
    return (
        <div className="w-screen h-screen flex-col bg-emerald-600 flex justify-center items-center">
      
      <div>
        <p className="text-9xl text-shadow-teal-900 text-white mb-4">Draw</p>
      </div>
      <div>
        <button
          onClick={() => navigate('/signin')}
          className="bg-zinc-500 hover:bg-zinc-800 text-white mx-2 font-bold py-2 px-4 rounded"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="bg-zinc-500 hover:bg-zinc-800 text-white mx-2 font-bold py-2 px-4 rounded"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}