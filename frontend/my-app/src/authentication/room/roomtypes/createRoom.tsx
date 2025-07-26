import { useNavigate } from "react-router-dom";
import React from "react"; 
interface Props {
  roomId: string;
}

export default function CreateRoom({ roomId }: Props) {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    navigate(`/draw/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-br from-gray-950 via-black to-zinc-950 font-inter">
      <p className="text-3xl font-semibold text-gray-200 mb-6">Room ID: {roomId}</p>
      <button
        onClick={handleJoinClick}
        className="px-8 py-3 bg-gray-800 hover:bg-black text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
      >
        Enter Room
      </button>
    </div>
  );
}
