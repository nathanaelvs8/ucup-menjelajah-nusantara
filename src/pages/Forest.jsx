
import React from "react";

export default function Forest() {
  return (
    <div style={{
      height: "100vh",
      background: "#003300",
      color: "#fff",
      padding: "40px",
      textAlign: "center"
    }}>
      <h1>🌲 Welcome to the Forest</h1>
      <p>You are now inside the forest.</p>
      <button onClick={() => window.location.href = "/gameplay"}>
        Back to Map
      </button>
    </div>
  );
}
