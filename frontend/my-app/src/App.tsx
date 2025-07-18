import Signup from "./authentication/signup/signup";
import Signin from "./authentication/signin/signin";
import Room from "./authentication/room/room";
import Dashboard from "./authentication/Dashboard/Dashboard";
import './App.css';
import { useEffect, useState } from "react";
import Imp from "./authentication/imp";
import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
  }, []);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signin" element={<Signin setToken={setToken} />} />
        <Route path="/signup" element={<Signup setToken={setToken} />} />

        <Route path="/draw/:roomId" element={token ? <Imp  /> : <Navigate to="/signin" />} />

        <Route path="/room" element={<Room />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
