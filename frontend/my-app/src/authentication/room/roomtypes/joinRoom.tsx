import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function JoinRoom() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(event.target.value);
  };

  const handleJoinClick = () => {
    if (roomId.trim()) {
      navigate(`/draw/${roomId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-br from-gray-950 via-black to-zinc-950 font-inter">
      <input
        type="text"
        onChange={handleInputChange}
        placeholder="Enter Room ID"
        className="px-5 py-3 border border-zinc-700 rounded-lg bg-zinc-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700 w-full max-w-sm transition-colors duration-200"
      />
      <button
        onClick={handleJoinClick}
        className="px-8 py-3 bg-gray-800 hover:bg-black text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
      >
        Join
      </button>
    </div>
  );
}
