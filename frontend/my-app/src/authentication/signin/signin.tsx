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
    <>
        <div>
          <input
            type="text" ref={emailref} className="mt-2 mb-2 "
            onKeyDown={(e) => keyHandleDown(e, passwordref)}
          />
        </div>
        <div>
          <input
            type="password" ref={passwordref} className="mt-2 mb-2 "
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
