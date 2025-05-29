import React, { useState, useEffect } from "react";
import "./Dungeon.css";

import Zone1_default from "../assets/map-assets/Dungeon/Zone1_default.png";
import Zone1_maze1 from "../assets/map-assets/Dungeon/Zone1_maze1.png";
import Zone1_maze2 from "../assets/map-assets/Dungeon/Zone1_maze2.png";
import Zone1_maze3 from "../assets/map-assets/Dungeon/Zone1_maze3.png";
import Zone1_maze4 from "../assets/map-assets/Dungeon/Zone1_maze4.png";
import Zone1_maze5 from "../assets/map-assets/Dungeon/Zone1_maze5.png";

import scrollBanner from "../assets/ui/ScrollObtainedItem.png";
import woodIcon from "../assets/inventory-items/Log.png";
import fishSkinIcon from "../assets/inventory-items/FishSkin.png";
import dungeonMusic from "../assets/audio/dungeon.mp3";


const MAZE_ROWS = 5;
const MAZE_COLS = 7;
const TILE_SIZE = 64;

const mazeImages = [
  Zone1_maze1,
  Zone1_maze2,
  Zone1_maze3,
  Zone1_maze4,
  Zone1_maze5,
];

const mazeLayouts = [
  [
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
  ],
  [
    [1,0,0,0,1,1,1],
    [1,0,1,0,1,1,1],
    [0,0,1,0,1,1,0],
    [1,1,1,0,1,1,0],
    [1,1,1,0,0,0,0],
  ],
  [
    [1,1,1,1,1,1,1],
    [1,1,1,1,0,0,0],
    [0,1,1,1,0,1,0],
    [0,1,0,0,0,1,1],
    [0,0,0,1,1,1,1],
  ],
  [
    [1,0,0,0,1,1,1],
    [0,0,1,0,1,1,1],
    [0,1,1,0,1,0,0],
    [1,1,1,0,0,0,1],
    [1,1,1,1,1,1,1],
  ],
  [
    [1,1,1,1,1,1,1],
    [1,1,0,0,0,1,1],
    [0,0,0,1,0,1,0],
    [1,1,1,1,0,0,0],
    [1,1,1,1,1,1,1],
  ],
  [
    [1,1,1,0,0,0,1],
    [1,1,1,0,1,0,1],
    [0,0,1,0,1,0,0],
    [1,0,1,0,1,1,1],
    [1,0,0,0,1,1,1],
  ],
];

const permataEmojis = ["💎", "🔮", "⚡️", "🔥"];

function RewardBanner({ items, onClose }) {
  return (
    <div className="coconut-overlay result" style={{ zIndex: 10000 }}>
      <div
        className="obtained-banner"
        style={{ backgroundImage: `url(${scrollBanner})` }}
      >
        <div className="obtained-text">You have obtained</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
          {items.map(({ icon, name }, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              {typeof icon === "string" && icon.startsWith("http") ? (
                <img
                  src={icon}
                  alt={name}
                  style={{ width: 64, height: 64, objectFit: "contain" }}
                />
              ) : (
                <span style={{ fontSize: 48, display: "inline-block", lineHeight: 1 }}>
                  {icon}
                </span>
              )}
              <div className="item-name">{name}</div>
            </div>
          ))}
        </div>
        <button className="ok-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

export default function Dungeon({ onExit }) {
  const savedCharacter = JSON.parse(localStorage.getItem("selectedCharacter"));
  const charSprite = savedCharacter?.sprite || null;

  const [zone, setZone] = React.useState(1);

  // Zona 1 states
  const [mazeIndex, setMazeIndex] = React.useState(0);
  const [maze, setMaze] = React.useState(mazeLayouts[0]);
  const [memorizePhase, setMemorizePhase] = React.useState(true);
  const [memorizeTimer, setMemorizeTimer] = React.useState(10);
  const [playerPos, setPlayerPos] = React.useState({ row: 2, col: 0 });
  const [lives, setLives] = React.useState(3);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [showSuccessDelay, setShowSuccessDelay] = React.useState(false);

  // Zona 2 states
  const [sequence, setSequence] = React.useState([]);
  const [showIndex, setShowIndex] = React.useState(-1);
  const [phase, setPhase] = React.useState("memorize");
  const [playerChoice, setPlayerChoice] = React.useState([]);
  const [countdown, setCountdown] = React.useState(3);
  const [zone2SuccessBanner, setZone2SuccessBanner] = React.useState(false);

  const rewardItems = [
    { icon: "💰", name: "2000 Gold" },
    { icon: <img src={woodIcon} alt="Wood" style={{ width: 64, height: 64 }} />, name: "Wood" },
    { icon: <img src={woodIcon} alt="Wood" style={{ width: 64, height: 64 }} />, name: "Wood" },
    { icon: <img src={woodIcon} alt="Wood" style={{ width: 64, height: 64 }} />, name: "Wood" },
    { icon: <img src={fishSkinIcon} alt="Special Fish Skin" style={{ width: 64, height: 64 }} />, name: "Special Fish Skin" },
    { icon: "🍖", name: "Hunger Potion" },
  ];
  const audioRef = React.useRef();


  React.useEffect(() => {
    if (zone === 1) {
      const rand = Math.floor(Math.random() * mazeLayouts.length);
      setMazeIndex(rand);
      setMaze(mazeLayouts[rand]);
      setPlayerPos({ row: 2, col: 0 });
      setMemorizePhase(true);
      setMemorizeTimer(10);
      setLives(3);
      setErrorMessage("");
      setSuccessMessage("");
      setShowSuccessDelay(false);
    }
  }, [zone]);

  React.useEffect(() => {
    if (zone !== 1 || !memorizePhase) return;
    if (memorizeTimer === 0) {
      setMemorizePhase(false);
      return;
    }
    const timerId = setTimeout(() => setMemorizeTimer(t => t - 1), 1000);
    return () => clearTimeout(timerId);
  }, [memorizeTimer, memorizePhase, zone]);

  function isValidTile(row, col) {
    return (
      row >= 0 &&
      row < MAZE_ROWS &&
      col >= 0 &&
      col < MAZE_COLS &&
      maze[row][col] === 0
    );
  }

  React.useEffect(() => {
    if (zone !== 1 || memorizePhase || showSuccessDelay) return;

    function handleKeyDown(e) {
      let newRow = playerPos.row;
      let newCol = playerPos.col;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          newRow--;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          newRow++;
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          newCol--;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          newCol++;
          break;
        default:
          return;
      }
      e.preventDefault();

      if (isValidTile(newRow, newCol)) {
        setPlayerPos({ row: newRow, col: newCol });
        setErrorMessage("");
        if (newRow === 2 && newCol === 6) {
          setSuccessMessage("Zone 1 completed! Proceeding to Zone 2...");
          setShowSuccessDelay(true);
          setTimeout(() => {
            setSuccessMessage("");
            setShowSuccessDelay(false);
            setZone(2);
          }, 5000);
        }
      } else {
        setLives(l => {
          if (l <= 1) {
            if (onExit) onExit();
            return 0;
          }
          setErrorMessage("Wrong move! Try memorizing again. Lives left: " + (l - 1));
          setTimeout(() => setErrorMessage(""), 2500);
          resetMemorizePhase();
          return l - 1;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPos, maze, memorizePhase, lives, onExit, zone, showSuccessDelay]);

  function resetMemorizePhase() {
    setMemorizePhase(true);
    setMemorizeTimer(10);
    setPlayerPos({ row: 2, col: 0 });
  }

  React.useEffect(() => {
    if (zone === 2) {
      setCountdown(3);
      setPhase("countdown");
      setSequence([]);
      setPlayerChoice([]);
      setLives(3);
      setErrorMessage("");
      setSuccessMessage("");
      setZone2SuccessBanner(false);
    }
  }, [zone]);

  React.useEffect(() => {
    if (zone !== 2 || phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("memorize");
      const seq = [];
      for (let i = 0; i < 4; i++) {
        const randIndex = Math.floor(Math.random() * permataEmojis.length);
        seq.push(permataEmojis[randIndex]);
      }
      setSequence(seq);
      setShowIndex(0);
      return;
    }
    const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timerId);
  }, [countdown, phase, zone]);

  React.useEffect(() => {
    if (zone !== 2 || phase !== "memorize" || showIndex === -1) return;
    if (showIndex >= sequence.length) {
      setPhase("choose");
      setShowIndex(-1);
      return;
    }
    const timer = setTimeout(() => setShowIndex(showIndex + 1), 1000);
    return () => clearTimeout(timer);
  }, [showIndex, phase, sequence.length, zone]);

  function handlePermataClick(emoji) {
    if (zone !== 2 || phase !== "choose") return;
    const newChoice = [...playerChoice, emoji];
    setPlayerChoice(newChoice);

    for (let i = 0; i < newChoice.length; i++) {
      if (newChoice[i] !== sequence[i]) {
        setLives(l => {
          if (l <= 1) {
            alert("No lives left! Returning to last dungeon.");
            if (onExit) onExit();
            return 0;
          }
          setErrorMessage("Wrong sequence! Try again. Lives left: " + (l - 1));
          setTimeout(() => setErrorMessage(""), 2500);
          return l - 1;
        });
        setPhase("memorize");
        setShowIndex(0);
        setPlayerChoice([]);
        return;
      }
    }

    if (newChoice.length === sequence.length) {
      setSuccessMessage("Correct sequence! You completed Zone 2.");
      setZone2SuccessBanner(true);

      const playerDataRaw = localStorage.getItem("playerData");
      let playerData = playerDataRaw ? JSON.parse(playerDataRaw) : { money: 0, inventory: [] };

      playerData.money = (playerData.money || 0) + 2000;
      playerData.inventory = playerData.inventory || [];
      playerData.inventory.push("Wood");
      playerData.inventory.push("Wood");
      playerData.inventory.push("Wood");
      playerData.inventory.push("Special Fish Skin");
      playerData.inventory.push("Hunger Potion");

      localStorage.setItem("playerData", JSON.stringify(playerData));
    }
  }

  if (zone === 1) {
    let currentMazeImage = memorizePhase
      ? mazeIndex === 0
        ? Zone1_default
        : mazeImages[mazeIndex - 1]
      : Zone1_default;

      React.useEffect(() => {
  if (audioRef.current) {
    audioRef.current.volume = 1; // Atur sesuai selera
    audioRef.current.play().catch(() => {});
  }
}, []);


    return (
       <>
    <audio
      ref={audioRef}
      src={dungeonMusic}
      autoPlay
      loop
    />
      <div className="dungeon-container">
        {errorMessage && (
          <p
            style={{
              position: "fixed",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              backgroundColor: "rgba(255, 0, 0, 0.8)",
              padding: "8px 16px",
              borderRadius: 8,
              fontWeight: "bold",
              zIndex: 9999,
              userSelect: "none",
              pointerEvents: "none",
              maxWidth: "90vw",
              textAlign: "center",
              boxShadow: "0 0 10px rgba(255, 0, 0, 0.7)",
            }}
          >
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p
            style={{
              position: "fixed",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              backgroundColor: "rgba(0, 128, 0, 0.8)",
              padding: "8px 16px",
              borderRadius: 8,
              fontWeight: "bold",
              zIndex: 9999,
              userSelect: "none",
              pointerEvents: "none",
              maxWidth: "90vw",
              textAlign: "center",
              boxShadow: "0 0 10px rgba(0, 128, 0, 0.7)",
            }}
          >
            {successMessage}
          </p>
        )}

        <h2>Zone 1 - Maze</h2>
        <p>
          Lives: {lives} |{" "}
          {memorizePhase
            ? `Memorize the maze! Time left: ${memorizeTimer} seconds`
            : showSuccessDelay
            ? "Get ready for Zone 2..."
            : "Use arrow keys or WASD to move. Reach the right middle tile."}
        </p>

        <div
          className="maze-image-container"
          style={{
            width: TILE_SIZE * MAZE_COLS,
            height: TILE_SIZE * MAZE_ROWS,
            position: "relative",
            backgroundImage: `url(${currentMazeImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            margin: "0 auto",
            borderRadius: 10,
            boxShadow: "0 0 15px rgba(0,0,0,0.7)",
          }}
        >
          <div
            className="player"
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              position: "absolute",
              top: playerPos.row * TILE_SIZE,
              left: playerPos.col * TILE_SIZE,
              backgroundImage: charSprite ? `url(${charSprite})` : "none",
              backgroundSize: `${TILE_SIZE * 4}px auto`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 0",
              borderRadius: 4,
              boxShadow: "0 0 8px #3399ff",
              backgroundColor: "transparent",
              transition: "top 0.15s ease, left 0.15s ease",
            }}
          />
        </div>
      </div>
      </>
    );
  }

  if (zone === 2) {
    if (zone2SuccessBanner) {
      return (
        <RewardBanner
          items={rewardItems}
          onClose={() => {
            setZone2SuccessBanner(false);
            setSuccessMessage("");
            if (onExit) onExit();
          }}
        />
      );
    }

    if (phase === "countdown") {
      return (
        <div className="dungeon-container">
          <h2>Zone 2 - Memorize the Gem Sequence</h2>
          <div style={{ fontSize: "10rem", textAlign: "center", marginTop: "50px" }}>
            {countdown > 0 ? countdown : "Go!"}
          </div>
          <p style={{ fontSize: "2rem", textAlign: "center" }}>
            Memorize the sequence!
          </p>
          <p style={{ textAlign: "center" }}>Lives: {lives}</p>
        </div>
      );
    }

    if (phase === "memorize") {
      return (
        <div className="dungeon-container">
          <h2>Zone 2 - Memorize the Gem Sequence</h2>
          <p>Lives: {lives}</p>
          {showIndex >= 0 && showIndex < sequence.length && (
            <div style={{ fontSize: "6rem", textAlign: "center" }}>
              {sequence[showIndex]}
            </div>
          )}
        </div>
      );
    }

    if (phase === "choose") {
      return (
        <div className="dungeon-container">
          <h2>Zone 2 - Memorize the Gem Sequence</h2>
          <p>Lives: {lives}</p>
          <p>Click the gems in the correct order!</p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              fontSize: "3rem",
            }}
          >
            {permataEmojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => handlePermataClick(emoji)}
                style={{
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "2px solid white",
                  backgroundColor: "#222",
                  color: "white",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <p>Your choice: {playerChoice.join(" ")}</p>
          {errorMessage && (
            <p
              style={{
                color: "red",
                fontWeight: "bold",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p
              style={{
                color: "green",
                fontWeight: "bold",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              {successMessage}
            </p>
          )}
        </div>
      );
    }
  }

  return null;
}
