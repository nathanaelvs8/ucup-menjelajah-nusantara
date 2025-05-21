import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Intro from "./pages/Intro";
import SelectCharacter from "./pages/SelectCharacter";
import Gameplay from "./pages/Gameplay";
import House from "./pages/House";
import Fishing from "./pages/Fishing";
import Beach from "./pages/Beach";
import Market from "./pages/Market"; 
import Forest from "./pages/Forest";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/select-character" element={<SelectCharacter />} />
      <Route path="/gameplay" element={<Gameplay />} />
      <Route path="/house" element={<House />} />
      <Route path="/fishing" element={<Fishing />} />
      <Route path="/beach" element={<Beach />} />
      <Route path="/market" element={<Market />} />
      <Route path="/forest" element={<Forest />} />


    </Routes>
  );
}

export default App;
