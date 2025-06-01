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

import arrowUp from "../assets/ui/ArrowUP.png";
import arrowDown from "../assets/ui/ArrowDOWN.png";
import arrowLeft from "../assets/ui/ArrowLEFT.png";
import arrowRight from "../assets/ui/ArrowRIGHT.png";

import gemGreen from "../assets/ui/Gems(green).png";
import gemOrange from "../assets/ui/Gems(orange).png";
import gemRed from "../assets/ui/Gems(red).png";
import gemYellow from "../assets/ui/Gems(yellow).png";

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

const permataGems = [
  { img: gemGreen, alt: "Green Gem" },
  { img: gemOrange, alt: "Orange Gem" },
  { img: gemRed, alt: "Red Gem" },
  { img: gemYellow, alt: "Yellow Gem" }
];


function RewardBanner({ items, onClose }) {
  return (
    <div className="coconut-overlay result" style={{ zIndex: 10000 }}>
      <div
        className="obtained-banner"
        style={{ backgroundImage: `url(${scrollBanner})` }}
      >
        <div className="obtained-text">You have obtained</div>
          <div className="obtained-items-list">
            {items.map(({ icon, name }, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                {typeof icon === "string" && icon.startsWith("http") ? (
                  <img
                    src={icon}
                    alt={name}
                    style={{ width: 58, height: 58, objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ fontSize: 44, display: "inline-block", lineHeight: 1 }}>
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

  const isMobile = window.innerWidth <= 900;
  const TILE_SIZE_ACTUAL = isMobile
    ? (window.innerWidth * 0.94) / MAZE_COLS // 0.94 = 94vw
    : TILE_SIZE;


  const rewardItems = [
    { icon: "💰", name: "2000 Gold" },
    { icon: <img src={woodIcon} alt="Wood" style={{ width: 64, height: 64 }} />, name: "Wood" },
    { icon: <img src={woodIcon} alt="Wood" style={{ width: 64, height: 64 }} />, name: "Wood" },
    { icon: <img src={woodIcon} alt="Wood" style={{ width: 64, height: 64 }} />, name: "Wood" },
    { icon: <img src={fishSkinIcon} alt="Special Fish Skin" style={{ width: 64, height: 64 }} />, name: "Special Fish Skin" },
    { icon: "🍖", name: "Hunger Potion" },
  ];
  const audioRef = React.useRef();

  const keysPressed = React.useRef({});

  function handleAnalog(key, value) {
    keysPressed.current[key] = value;
  }

  useEffect(() => {
    if (zone !== 1 || memorizePhase || showSuccessDelay) return;
    let rafId;
    function move() {
      let newRow = playerPos.row;
      let newCol = playerPos.col;
      let moved = false;

      if (keysPressed.current.w || keysPressed.current.arrowup) { newRow--; moved = true; }
      if (keysPressed.current.s || keysPressed.current.arrowdown) { newRow++; moved = true; }
      if (keysPressed.current.a || keysPressed.current.arrowleft) { newCol--; moved = true; }
      if (keysPressed.current.d || keysPressed.current.arrowright) { newCol++; moved = true; }

      if (moved && isValidTile(newRow, newCol)) {
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
      }
      rafId = requestAnimationFrame(move);
    }
    rafId = requestAnimationFrame(move);
    return () => cancelAnimationFrame(rafId);
  }, [zone, memorizePhase, showSuccessDelay, playerPos, maze]);


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
  
  function movePlayer(key) {
    // Prevent moving if masih memorizePhase atau zone lagi success delay
    if (memorizePhase || showSuccessDelay) return;

    let newRow = playerPos.row;
    let newCol = playerPos.col;

    switch (key) {
      case "w":
        newRow--;
        break;
      case "s":
        newRow++;
        break;
      case "a":
        newCol--;
        break;
      case "d":
        newCol++;
        break;
      default:
        return;
    }

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
      let seq = [];
      // Buat array 0-3 lalu shuffle
      const arr = [0, 1, 2, 3];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      seq = [...arr]; // Seq 4 gems unik
      // Jika sequence lebih panjang dari 4, tambahin random lagi:
      // for (let i = 4; i < N; i++) seq.push(Math.floor(Math.random() * permataGems.length));
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

  function handlePermataClick(idx) {
    if (zone !== 2 || phase !== "choose") return;
    const newChoice = [...playerChoice, idx];
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

       React.useEffect(() => {
  if (audioRef.current) {
    audioRef.current.volume = 1; // Atur sesuai selera
    audioRef.current.play().catch(() => {});
  }
}, []);

  if (zone === 1) {
    let currentMazeImage = memorizePhase
      ? mazeIndex === 0
        ? Zone1_default
        : mazeImages[mazeIndex - 1]
      : Zone1_default;

 

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
            width: TILE_SIZE_ACTUAL * MAZE_COLS,
            height: TILE_SIZE_ACTUAL * MAZE_ROWS,
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
            width: TILE_SIZE_ACTUAL,
            height: TILE_SIZE_ACTUAL,
            top: playerPos.row * TILE_SIZE_ACTUAL,
            left: playerPos.col * TILE_SIZE_ACTUAL,
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

               <div className="analog-controls">
          <div className="analog-up-row">
            <button
              className="arrow up"
              onClick={() => movePlayer("w")}
            >
              <img src={arrowUp} alt="Up" className="arrow-img" />
            </button>
          </div>
          <div className="analog-middle-row">
            <button
              className="arrow left"
              onClick={() => movePlayer("a")}
            >
              <img src={arrowLeft} alt="Left" className="arrow-img" />
            </button>
            <div className="arrow-spacer"></div>
            <button
              className="arrow right"
              onClick={() => movePlayer("d")}
            >
              <img src={arrowRight} alt="Right" className="arrow-img" />
            </button>
          </div>
          <div className="analog-down-row">
            <button
              className="arrow down"
              onClick={() => movePlayer("s")}
            >
              <img src={arrowDown} alt="Down" className="arrow-img" />
            </button>
          </div>
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
            <div style={{ textAlign: "center" }}>
              <img
                src={permataGems[sequence[showIndex]].img}
                alt={permataGems[sequence[showIndex]].alt}
                style={{ width: "200px", height: "200px", objectFit: "contain" }}
              />
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

          <div className="gems-choice-wrapper">
          {permataGems.map((gem, i) => (
            <button
              key={i}
              onClick={() => handlePermataClick(i)}
              style={{
                cursor: "pointer",
                padding: "10px",
                borderRadius: "8px",
                border: "2px solid white",
                backgroundColor: "#222",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <img
                src={gem.img}
                alt={gem.alt}
                style={{ width: "48px", height: "48px", objectFit: "contain" }}
              />
            </button>
          ))}

          </div>
          <p>
            Your choice:{" "}
            {playerChoice.map((idx, i) => (
              <img
                key={i}
                src={permataGems[idx].img}
                alt={permataGems[idx].alt}
                style={{
                  width: "32px",
                  height: "32px",
                  verticalAlign: "middle",
                  marginRight: 2,
                  filter: "drop-shadow(0 0 4px #000a)" // biar kelihatan, opsional
                }}
              />
            ))}
          </p>
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
