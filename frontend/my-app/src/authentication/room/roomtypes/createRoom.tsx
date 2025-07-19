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
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-slate-900  min-h-screen gap-4">
      <p className="text-2xl font-semibold text-teal-600">Room ID: {roomId}</p>
      <button
        onClick={handleJoinClick}
        className="px-6 py-3 bg-green-500 text-white rounded-lg"
      >
        Enter Room
      </button>
    </div>
  );
}
