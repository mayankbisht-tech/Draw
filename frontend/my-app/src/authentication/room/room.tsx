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
          <button
            onClick={handleCreateRoom}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl"
          >
            Create Room
          </button>
          <button
            onClick={() => setMode("join")}
            className="px-6 py-3 bg-green-600 text-white rounded-xl"
          >
            Join Room
          </button>
        </>
      )}

      {mode === "create" && roomId && <CreateRoom roomId={roomId} />}
      {mode === "join" && <JoinRoom />}
    </div>
  );
}
