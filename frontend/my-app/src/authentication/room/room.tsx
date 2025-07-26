import React, { useState } from "react";
import CreateRoom from "./roomtypes/createRoom"; 
import JoinRoom from "./roomtypes/joinRoom";     
import { v4 as uuidv4 } from "uuid";

export default function RoomPage() {
  const [mode, setMode] = useState<"default" | "create" | "join">("default");
  const [roomId, setRoomId] = useState<string | null>(null);

  const handleCreateRoom = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    setMode("create");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-black to-zinc-950 font-inter">
      
      {mode === "default" && (
        <div className="flex flex-col items-center justify-center gap-8 p-10 bg-zinc-900 rounded-2xl shadow-2xl w-[90%] max-w-md border border-zinc-800">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-200 text-center">
            Welcome to the Room Page
          </h1>

          <div className="flex flex-col gap-4 w-full">
            <button
              onClick={handleCreateRoom}
              className="w-full px-6 py-3 bg-gray-800 hover:bg-black text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
            >
              Create Room
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full px-6 py-3 bg-gray-800 hover:bg-black text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
            >
              Join Room
            </button>
          </div>
        </div>
      )}

      {mode === "create" && roomId && <CreateRoom roomId={roomId} />}
      {mode === "join" && <JoinRoom />}
    </div>
  );
}
