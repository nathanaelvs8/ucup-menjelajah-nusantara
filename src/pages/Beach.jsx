import React, { useEffect, useState } from "react";

export default function Beach() {
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("playerData");
    if (saved) {
      setPlayerData(JSON.parse(saved));
    }
  }, []);

  if (!playerData) return <p>Loading...</p>;

  return (
    <div className="beach-screen">
      <h1>🏖️ Welcome to the Beach!</h1>
    </div>
  );
}
