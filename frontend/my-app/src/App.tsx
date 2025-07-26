import Signup from "./authentication/signup/signup";
import Signin from "./authentication/signin/signin";
import Room from "./authentication/room/room";
import './App.css';
import { useEffect, useState } from "react";
import Imp from "./authentication/imp";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Dashboard from "./authentication/dashboard/Dashboard";

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
  }, []);

  return (
 
      
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/signin" element={<Signin setToken={setToken} />} />
          <Route path="/signup" element={<Signup setToken={setToken} />} />

          <Route 
            path="/draw/:roomId" 
            element={token ? <Imp /> : <Navigate to="/signin" />} 
          />

          <Route path="/room" element={<Room />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    
  
)}

export default App;