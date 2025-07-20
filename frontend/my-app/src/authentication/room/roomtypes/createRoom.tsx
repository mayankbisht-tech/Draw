import { useNavigate } from "react-router-dom";

interface Props {
  roomId: string;
}

export default function CreateRoom({ roomId }: Props) {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    navigate(`/draw/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-b from-gray-900 via-zinc-900 to-neutral-900 gap-4">
      <p className="text-2xl font-semibold text-cyan-400" >Room ID: {roomId}</p>
      <button
        onClick={handleJoinClick}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"

      >
        Enter Room
      </button>
    </div>
  );
}
