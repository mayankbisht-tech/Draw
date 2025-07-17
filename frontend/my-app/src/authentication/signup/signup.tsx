import React, { useRef, type RefObject } from "react";
import { useNavigate } from "react-router-dom";

interface SignupProps {
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function Signup({ setToken }: SignupProps) {
  const firstnameref = useRef<HTMLInputElement>(null);
  const lastnameref = useRef<HTMLInputElement>(null);
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
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstname: firstnameref.current?.value,
        lastname: lastnameref.current?.value,
        email: emailref.current?.value,
        password: passwordref.current?.value,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message || "Signed up successfully!");
      localStorage.setItem("token", data.token);
      setToken(data.token);
      navigate("/dashboard"); 
    } else {
      alert(data.error || "Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-600">
      <div className="pt-8 w-65 h-95 bg-green-300 border-2 rounded-2xl">
      <div><button
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 bg-zinc-500 hover:bg-zinc-800 text-white mx-2 font-bold py-2 px-4 rounded"
        >Home</button></div>
      <div className="flex flex-col items-center space-y-4">
        <p className="font-bold text-2xl text-slate-600">Sign Up</p>
        <input
          type="text"
          ref={firstnameref}
          placeholder="First Name"
          className="bg-amber-700 text-white px-4 py-2 rounded"
          onKeyDown={(e) => keyHandleDown(e, lastnameref)}
        />
        <input
          type="text"
          ref={lastnameref}
          placeholder="Last Name"
          className="bg-amber-700 text-white px-4 py-2 rounded"
          onKeyDown={(e) => keyHandleDown(e, emailref)}
        />
        <input
          type="text"
          ref={emailref}
          placeholder="Email"
          className="bg-amber-700 text-white px-4 py-2 rounded"
          onKeyDown={(e) => keyHandleDown(e, passwordref)}
        />
        <input
          type="password"
          ref={passwordref}
          placeholder="Password"
          className="bg-amber-700 text-white px-4 py-2 rounded"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <button
          className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
      </div>
    </div>
  );
}
