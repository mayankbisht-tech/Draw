import { useNavigate } from 'react-router-dom';
import '../../App.css';
export default function Dashboard(){
    const navigate=useNavigate();
    return (
      <div>
        
        <div className="min-h-screen flex flex-col bg-gradient-to-tr from-black via-gray-950 to-gray-950 text-gray-100 font-inter">
            
            <header className="bg-black shadow-lg py-4 px-6 md:px-10 lg:px-16 flex justify-between items-center rounded-b-xl">
                <div className="text-3xl font-extrabold text-white">
                    Draw
                </div>

                <nav className="flex items-center space-x-4">
                    <button onClick={() => navigate('/signin')} className="px-5 py-2 rounded-full text-gray-400 font-medium hover:bg-stone-900 transition-colors duration-200 shadow-md">
                        Sign In
                    </button>
                    <button onClick={() => navigate('/signup')} className="px-6 py-2 rounded-full bg-gray-900 text-white font-medium hover:bg-black transition-colors duration-200 shadow-lg">
                        Sign Up
                    </button>
                </nav>
            </header>

            <main className="flex-grow flex items-center justify-center p-6 md:p-10 lg:p-16">
                <div className="text-center max-w-4xl">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-gray-200">
                        Design. <span className="text-gray-400">Create.</span> Innovate.
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
                        Your canvas for professional-grade design and collaborative visualization.
                    </p>
                    <button onClick={()=>navigate("/signin")} className="px-10 py-4 rounded-full bg-gray-900 text-white text-xl font-semibold hover:bg-black transition-all duration-300 transform hover:scale-105 shadow-xl">
                        Start Designing Today
                    </button>
                </div>
            </main>

        </div>
    <div></div>
        
    </div>
  );
}