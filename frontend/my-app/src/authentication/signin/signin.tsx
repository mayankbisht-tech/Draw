import React, { useRef, type RefObject } from "react";
import { useNavigate } from "react-router-dom";

type SigninProps = {
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function Signin({ setToken }: SigninProps) {
  const emailref = useRef<HTMLInputElement>(null);
  const passwordref = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const keyHandleDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef?: RefObject<HTMLInputElement | null>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: emailref.current?.value,
        password: passwordref.current?.value
      })
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      navigate("/room");
      localStorage.setItem("token", data.token);
    } else {
      alert(data.error || "Sign-in failed");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-700 via-zinc-800 to-stone-900">
      
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 bg-zinc-600 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-md"
      >
        Home
      </button>

      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/80 border border-zinc-700 shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          <p className="font-bold text-2xl text-white">Sign in</p>
          <input
            type="text"
            ref={emailref}
            placeholder="Email"
            className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => keyHandleDown(e, passwordref)}
          />
          <input
            type="password"
            ref={passwordref}
            placeholder="Password"
            className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 py-2 rounded-md font-semibold text-white"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
