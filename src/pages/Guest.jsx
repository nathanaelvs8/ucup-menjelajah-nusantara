import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../layout/Container";

export default function Guest() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    if (!username.trim()) return alert("Masukkan username");
    navigate("/select-character", { state: { username } });
  };

  return (
    <Container>
      <h2>Masuk sebagai Guest</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleNext}>Lanjut</button>
    </Container>
  );
}
