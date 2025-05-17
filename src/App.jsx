import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import TapToStart from "./pages/TapToStart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Guest from "./pages/Guest";
import SelectCharacter from "./pages/SelectCharacter";

function App() {
  return (
    <Routes>
      <Route path="/" element={<TapToStart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/guest" element={<Guest />} />
      <Route path="/select-character" element={<SelectCharacter />} />
    </Routes>
  );
}

export default App;
