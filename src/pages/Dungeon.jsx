import React, { useState, useEffect } from "react";
import "./Dungeon.css";

const MAZE_ROWS = 5;
const MAZE_COLS = 7;
const TILE_SIZE = 64;

import Dungeon_background from "../assets/map-assets/Dungeon/Dungeon_background.png";

import Zone1_maze1 from "../assets/map-assets/Dungeon/Zone1_maze1.png";
import Zone1_maze2 from "../assets/map-assets/Dungeon/Zone1_maze2.png";
import Zone1_maze3 from "../assets/map-assets/Dungeon/Zone1_maze3.png";
import Zone1_maze4 from "../assets/map-assets/Dungeon/Zone1_maze4.png";
import Zone1_maze5 from "../assets/map-assets/Dungeon/Zone1_maze5.png";

const mazeImages = [
  Zone1_maze1,
  Zone1_maze2,
  Zone1_maze3,
  Zone1_maze4,
  Zone1_maze5,
];

const mazeLayouts = [
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

export default function Dungeon({ onExit }) {
  const savedCharacter = JSON.parse(localStorage.getItem("selectedCharacter"));
  const charSprite = savedCharacter?.sprite || null;

  const [mazeIndex, setMazeIndex] = useState(0);
  const [maze, setMaze] = useState([]);

  const [memorizePhase, setMemorizePhase] = useState(true);
  const [memorizeTimer, setMemorizeTimer] = useState(10);

  const [playerPos, setPlayerPos] = useState({ row: 2, col: 0 });
  const [lives, setLives] = useState(3);

  useEffect(() => {
    const rand = Math.floor(Math.random() * mazeImages.length);
    setMazeIndex(rand);
    setMaze(mazeLayouts[rand]);
    setPlayerPos({ row: 2, col: 0 });
    setMemorizePhase(true);
    setMemorizeTimer(10);
    setLives(3);
  }, []);

  useEffect(() => {
    if (!memorizePhase) return;
    if (memorizeTimer === 0) {
      setMemorizePhase(false);
      return;
    }
    const timerId = setTimeout(() => setMemorizeTimer(t => t - 1), 1000);
    return () => clearTimeout(timerId);
  }, [memorizePhase, memorizeTimer]);

  function resetMemorizePhase() {
    setMemorizePhase(true);
    setMemorizeTimer(10);
    setPlayerPos({ row: 2, col: 0 });
  }

  function isValidTile(row, col) {
    if (!maze.length) return false;
    return (
      row >= 0 &&
      row < MAZE_ROWS &&
      col >= 0 &&
      col < MAZE_COLS &&
      maze[row][col] === 0
    );
  }

  useEffect(() => {
    if (memorizePhase) return;

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
        if (newRow === 2 && newCol === 6) {
          alert("Zone 1 completed! Proceeding to next zone.");
          if (onExit) onExit();
        }
      } else {
        setLives(l => {
          if (l <= 1) {
            alert("No lives left! Returning to last dungeon.");
            if (onExit) onExit();
            return 0;
          }
          resetMemorizePhase();
          return l - 1;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPos, memorizePhase, maze, lives, onExit]);

  return (
    <div
      className="dungeon-page"
      style={{
        backgroundImage: `url(${Dungeon_background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 30,
        color: "white",
        userSelect: "none",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          margin: "10px 0",
          fontSize: "2.5rem",
          fontWeight: "700",
          textShadow: "0 0 6px black",
          userSelect: "none",
        }}
      >
        Zone 1 - Maze
      </h2>

      <p
        style={{
          textAlign: "center",
          fontSize: "1.25rem",
          marginBottom: "15px",
          fontWeight: "500",
          textShadow: "0 0 5px black",
          userSelect: "none",
        }}
      >
        Lives: {lives} |{" "}
        {memorizePhase
          ? `Memorize the maze! Time left: ${memorizeTimer} seconds`
          : "Use arrow keys or WASD to move. Reach the right middle tile."}
      </p>

      {memorizePhase && (
        <img
          src={mazeImages[mazeIndex]}
          alt="Maze aid"
          style={{
            position: "absolute",
            top: 120,
            left: "50%",
            transform: "translateX(-50%)",
            width: TILE_SIZE * MAZE_COLS,
            height: TILE_SIZE * MAZE_ROWS,
            opacity: 0.7,
            pointerEvents: "none",
            borderRadius: 10,
            zIndex: 10,
            userSelect: "none",
          }}
          draggable={false}
        />
      )}

      <div
        className="maze-gameplay-area"
        style={{
          position: "relative",
          width: TILE_SIZE * MAZE_COLS,
          height: TILE_SIZE * MAZE_ROWS,
          marginTop: memorizePhase ? TILE_SIZE * MAZE_ROWS + 20 : 0,
          userSelect: "none",
          zIndex: 20,
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
  );
}
