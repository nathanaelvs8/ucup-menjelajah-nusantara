import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CharacterCard from "../components/CharacterCard";

const characters = ["Knight", "Archer", "Mage"];

export default function SelectCharacter() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Guest";

  const handleSelect = (char) => {
    const guestData = {
      username,
      character: char,
      isGuest: true,
    };
    localStorage.setItem("gameUser", JSON.stringify(guestData));
    alert(`Selamat datang ${username} sebagai ${char}!`);
    // navigate("/game"); // Bisa ditambah nanti
  };

  return (
        // Dalam SelectCharacter.jsx
    <div className="container">
    <h2>Pilih Karakter</h2>
    <div className="character-list">
        {characters.map((char) => (
        <CharacterCard key={char} name={char} onSelect={handleSelect} />
        ))}
    </div>
    </div>

  );
}
