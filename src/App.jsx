import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Intro from "./pages/Intro";
import SelectCharacter from "./pages/SelectCharacter";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/select-character" element={<SelectCharacter />} />
    </Routes>
  );
}

export default App;
