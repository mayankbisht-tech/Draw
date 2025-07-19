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
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      {mode === "default" && (
        <>
        <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 w-screen h-screen p-8 rounded-lg shadow-lg">
          <p className="text-5xl text-shadow-lg text-shades text-fuchsia-700 font-bold ">Welcome to the Room Page</p>
          <button
            onClick={handleCreateRoom}
            className="px-6 py-3 bg-green-600 hover:bg-amber-700 text-white rounded-xl"
          >
            Create Room
          </button>
          <button
            onClick={() => setMode("join")}
            className="px-6 py-3 bg-green-600  hover:bg-amber-700 text-white rounded-xl"
          >
            Join Room
          </button>
    </div>
        </>
      )}

      {mode === "create" && roomId && <CreateRoom roomId={roomId} />}
      {mode === "join" && <JoinRoom />}
    </div>

  );
}
