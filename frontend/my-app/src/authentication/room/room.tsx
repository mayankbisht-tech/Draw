import { useState } from "react";
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
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      {mode === "default" && (
        <div className="flex flex-col items-center justify-center gap-8 p-10 bg-slate-800 rounded-2xl shadow-2xl w-[90%] max-w-md">
          <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-400 text-center">
            Welcome to the Room Page
          </h1>

          <div className="flex flex-col gap-4 w-full">
            <button
              onClick={handleCreateRoom}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-lime-500 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold rounded-xl shadow-md transition-all duration-300"
            >
              Create Room
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold rounded-xl shadow-md transition-all duration-300"
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
