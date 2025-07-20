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
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-b from-gray-900 via-zinc-900 to-neutral-900 gap-4">
    <input
        type="text"
        onChange={handleInputChange}
        placeholder="Enter Room ID"
        className="px-4 py-2 border border-zinc-600 rounded-md bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
      <button
        onClick={handleJoinClick}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"

      >
        Join
      </button>
    </div>
  );
}
