import Signup from "./authentication/signup/signup";
import Signin from "./authentication/signin/signin";
import Dashboard from "./authentication/dashboard/Dashboard";
import './App.css';
import { useEffect, useState } from "react";
import Imp from "./authentication/imp";
import { Routes, Route, Navigate } from "react-router-dom";

function App(){
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
  }, []);

  return (
    <div>
      <Dashboard/>
      <Routes>
        <Route
          path="/"
          element={
            token ? <Navigate to="/dashboard" /> : <Navigate to="/signup" />
          }
        />
        <Route path="/signup" element={<Signup setToken={setToken} />} />
        <Route path="/signin" element={<Signin setToken={setToken} />} />
        <Route
          path="/dashboard"
          element={
            token ? (
              <Imp setToken={setToken} />
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
