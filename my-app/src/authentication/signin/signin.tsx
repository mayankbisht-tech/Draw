import { useRef, type RefObject } from "react";

export default function Signin() {
const emailref = useRef<HTMLInputElement>(null);
const passwordref = useRef<HTMLInputElement>(null);

  const keyHandleDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef?: RefObject<HTMLInputElement|null>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  const handleSubmit = async() => {
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
    const data=await res.json();
    if(res.ok){

        alert("signed successfully")
        localStorage.setItem("token",data.token)
        console.log(data.token)
    }else{
        alert(data.error||"sigup failed")
    }
   };
  return (
  
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="flex flex-col items-center space-y-4">
        <p className="font-bold text-2xl text-white">Sign in</p>
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
  );
}
