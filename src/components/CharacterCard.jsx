import React from "react";

// Di CharacterCard.jsx
export default function CharacterCard({ name, onSelect }) {
  return (
    <div className="character-card">
      <img src={`/characters/${name.toLowerCase()}.png`} alt={name} />
      <h3>{name}</h3>
      <button onClick={() => onSelect(name)}>Pilih</button>
    </div>
  );
}
