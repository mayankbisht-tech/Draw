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
    <div className="w-screen h-screen justify-center bg-slate-900 flex flex-col items-center gap-4">
      <input
        type="text"
        onChange={handleInputChange}
        placeholder="Enter Room ID"
        className="px-4 py-2 border rounded-md text-black"
      />
      <button
        onClick={handleJoinClick}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
      >
        Join
      </button>
    </div>
  );
}
