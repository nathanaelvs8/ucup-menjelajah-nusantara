import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SelectCharacter.css";

import redFace from "../assets/characters/red.jpg";
import blueFace from "../assets/characters/blue.jpg";
import hilbertFace from "../assets/characters/hilbert.jpg";
import redSprite from "../assets/characters/character2.png";
import blueSprite from "../assets/characters/character3.png";
import hilbertSprite from "../assets/characters/character1.png";
import selectTheme from "../assets/audio/selectcharacter.mp3";
import hoverSound from "../assets/audio/hovercharacter.mp3";
import clickSound from "../assets/audio/click.mp3";

const characterData = [
  { name: "Red", face: redFace, sprite: redSprite },
  { name: "Blue", face: blueFace, sprite: blueSprite },
  { name: "Hilbert", face: hilbertFace, sprite: hilbertSprite },
];

export default function SelectCharacter() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName) setPlayerName(storedName);
  }, []);

  const playHoverSound = () => {
    const sound = new Audio(hoverSound);
    sound.volume = 0.5;
    sound.play().catch(() => {});
  };

  const playClickSound = () => {
    const sound = new Audio(clickSound);
    sound.volume = 0.6;
    sound.play().catch(() => {});
  };

  const handleSelect = (index) => setSelectedIndex(index);

  const handleConfirm = () => {
    playClickSound();
    const selectedChar = characterData[selectedIndex];
    localStorage.setItem("selectedCharacter", JSON.stringify(selectedChar));
    navigate("/gameplay");
  };

  return (
    <div className="screen-wrapper">
      <div className="select-container">
        <audio autoPlay loop>
          <source src={selectTheme} type="audio/mp3" />
        </audio>

        <h1 className="select-title">Pilih Karakter</h1>

        <div className="character-grid">
          {characterData.map((char, i) => (
            <img
              key={i}
              src={char.face}
              alt={char.name}
              className={`grid-img ${i === selectedIndex ? "selected" : ""}`}
              onMouseEnter={() => {
                handleSelect(i);
                playHoverSound();
              }}
            />
          ))}
        </div>

        <div className="character-display">
          <p className="username-greeting">Welcome, {playerName}</p>
          <div
            className="animated-sprite"
            style={{
              backgroundImage: `url(${characterData[selectedIndex].sprite})`,
            }}
          ></div>
          <button className="confirm-button" onClick={handleConfirm}>
            Pilih Karakter Ini
          </button>
        </div>
      </div>
    </div>
  );
}
