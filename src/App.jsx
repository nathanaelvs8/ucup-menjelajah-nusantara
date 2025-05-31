import React from "react";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";

import Intro from "./pages/Intro";
import SelectCharacter from "./pages/SelectCharacter";
import Gameplay from "./pages/Gameplay";
import House from "./pages/House";
import Fishing from "./pages/Fishing";
import Beach from "./pages/Beach";
import Market from "./pages/Market"; 
import Forest from "./pages/Forest";
import Ending from "./pages/Ending";
import Dungeon from "./pages/Dungeon"; 
import Secret from "./pages/Secret"; 

function WithNavigateDungeon() {
  const navigate = useNavigate();

  function handleExit() {
    navigate("/forest");
  }

  return <Dungeon onExit={handleExit} />;
}

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
      <Route path="/dungeon" element={<WithNavigateDungeon />} />
      <Route path="/secret" element={<Secret />} />
      <Route path="/ending" element={<Ending />} />
    </Routes>
  );
}

export default App;
