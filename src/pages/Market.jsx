import React from "react";

export default function Market() {
  return (
    <div style={{ padding: "20px", color: "#fff", background: "#111", height: "100vh" }}>
      <h1>🛒 Welcome to the Market</h1>
      <p>You can buy and sell items here!</p>
      <button onClick={() => (window.location.href = "/gameplay")}>Back to Game</button>
    </div>
  );
}
