import React from "react";
import { useNavigate } from "react-router-dom";

export default function TapToStart() {
  const navigate = useNavigate();

    // Contoh dalam TapToStart.jsx
    return (
    <div className="container">
        <h1>Tap to Start</h1>
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/register")}>Register</button>
        <button onClick={() => navigate("/guest")}>Play as Guest</button>
    </div>
    );
}
