import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Intro from "./pages/Intro";
import SelectCharacter from "./pages/SelectCharacter";
import Gameplay from "./pages/gameplay";





function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/select-character" element={<SelectCharacter />} />
      <Route path="/gameplay" element={<Gameplay />} />
    </Routes>
  );
}

export default App;
