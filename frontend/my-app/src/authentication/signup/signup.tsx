import { useRef, type RefObject } from "react";

export default function Signup() {
  const firstnameref = useRef<HTMLInputElement>(null);
const lastnameref = useRef<HTMLInputElement>(null);
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
   const res = await fetch("http://localhost:5000/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    firstname: firstnameref.current?.value,
    lastname: lastnameref.current?.value,
    email: emailref.current?.value,
    password: passwordref.current?.value
  })
});
    const data=await res.json();
    if(res.ok){
        alert(data.message||"signed successfully")
    }else{
        alert(data.error||"sigup failed")
    }
   };
  return (
    <>
    <div className="w-screen h-screen  ">
      <div>
        <div>
          <input
            type="text" ref={firstnameref} className="mt-2 mb-2 border-2 border-solid border-white bg-blue-500"             
            onKeyDown={(e) => keyHandleDown(e, lastnameref)}
          />
        </div>
        <div>
          <input
            type="text" ref={lastnameref} className="mt-2 mb-2 border-2 border-solid border-white "
            onKeyDown={(e) => keyHandleDown(e, emailref)}
          />
        </div>
        <div>
          <input
            type="text" ref={emailref} className="mt-2 mb-2 border-2 border-solid border-white "
            onKeyDown={(e) => keyHandleDown(e, passwordref)}
          />
        </div>
        <div>
          <input
            type="password" ref={passwordref} className="mt-2 mb-2 border-2 border-solid border-white "
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
      </div>
      <button onClick={handleSubmit}>Submit</button>
      </div>
    </>
  );
}
