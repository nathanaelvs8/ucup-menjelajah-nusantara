import React from "react";
import { useNavigate } from "react-router-dom";
import "./Ending.css"; // opsional jika kamu mau kasih style khusus

export default function Ending() {
  const navigate = useNavigate();

  const handleBackToIntro = () => {
    localStorage.clear(); // reset semua progress
    navigate("/"); // ke halaman intro
  };

  return (
    <div className="ending-screen">
      <h1>Game Over</h1>
      <p>Semua status kamu sudah habis. Jangan menyerah, coba lagi!</p>
      <button onClick={handleBackToIntro}>Kembali ke Awal</button>
    </div>
  );
}
