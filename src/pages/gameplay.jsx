import React, { useEffect, useState, useRef } from "react";
import "./Gameplay.css";
import mapImage from "../assets/map/Main.jpg";

const MAP_WIDTH = 4616;
const MAP_HEIGHT = 3464;
const SPRITE_SIZE = 64;

export default function Gameplay() {
  const [character, setCharacter] = useState(null);
  const [position, setPosition] = useState({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const [direction, setDirection] = useState("down");
  const [isMoving, setIsMoving] = useState(false);
  const keysPressed = useRef({});

  const [status, setStatus] = useState({
    meal: 50,
    sleep: 50,
    happiness: 50,
    cleanliness: 50,
  });
  const [money, setMoney] = useState(5000);
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [inventory, setInventory] = useState(["Pickaxe"]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("selectedCharacter"));
    if (saved) setCharacter(saved);
  }, []);

  useEffect(() => {
    let animationId;

    const update = () => {
      setPosition((prev) => {
        const newPos = { ...prev };
        let moved = false;

        if (keysPressed.current.w || keysPressed.current.arrowup) {
          newPos.y = Math.max(newPos.y - 2, 0);
          setDirection("up");
          moved = true;
        }
        if (keysPressed.current.s || keysPressed.current.arrowdown) {
          newPos.y = Math.min(newPos.y + 2, MAP_HEIGHT - SPRITE_SIZE);
          setDirection("down");
          moved = true;
        }
        if (keysPressed.current.a || keysPressed.current.arrowleft) {
          newPos.x = Math.max(newPos.x - 2, 0);
          setDirection("left");
          moved = true;
        }
        if (keysPressed.current.d || keysPressed.current.arrowright) {
          newPos.x = Math.min(newPos.x + 2, MAP_WIDTH - SPRITE_SIZE);
          setDirection("right");
          moved = true;
        }

        setIsMoving(moved);
        return newPos;
      });

      animationId = requestAnimationFrame(update);
    };

    const handleKeyDown = (e) => keysPressed.current[e.key.toLowerCase()] = true;
    const handleKeyUp = (e) => keysPressed.current[e.key.toLowerCase()] = false;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    animationId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const getSpriteOffset = () => {
    const directionMap = { down: 0, left: 1, right: 2, up: 3 };
    const row = directionMap[direction];
    const col = isMoving ? Math.floor(Date.now() / 150) % 4 : 1;
    return `-${col * SPRITE_SIZE}px -${row * SPRITE_SIZE}px`;
  };

  const offsetX = Math.min(Math.max(-position.x + window.innerWidth / 2, -(MAP_WIDTH - window.innerWidth)), 0);
  const offsetY = Math.min(Math.max(-position.y + window.innerHeight / 2, -(MAP_HEIGHT - window.innerHeight)), 0);

  const handleAnalog = (key, value) => {
    keysPressed.current[key] = value;
  };

  return (
    <div className="viewport">
      <div
        className="map"
        style={{
          backgroundImage: `url(${mapImage})`,
          left: `${offsetX}px`,
          top: `${offsetY}px`,
        }}
      >
        {character && (
          <div
            className="character"
            style={{
              left: position.x,
              top: position.y,
              backgroundImage: `url(${character.sprite})`,
              backgroundPosition: getSpriteOffset(),
            }}
          ></div>
        )}
      </div>

      <div className="status-ui">
        <div className="status-bars">
          <div className="status-item">🍗<div className="bar"><div style={{ width: `${status.meal}%` }}></div></div></div>
          <div className="status-item">😴<div className="bar"><div style={{ width: `${status.sleep}%` }}></div></div></div>
          <div className="status-item">😊<div className="bar"><div style={{ width: `${status.happiness}%` }}></div></div></div>
          <div className="status-item">🛁<div className="bar"><div style={{ width: `${status.cleanliness}%` }}></div></div></div>
        </div>
        <div className="status-money">
          <div className="money">Rp {money} 💰</div>
          <button className="inventory-btn" onClick={() => setInventoryVisible(prev => !prev)}>Inventory</button>
          {inventoryVisible && (
            <div className="inventory-grid">
              {inventory.map((item, i) => (
                <div key={i} className="inventory-item">{item}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="analog-controls">
        <button className="arrow up"
          onMouseDown={() => handleAnalog("arrowup", true)}
          onMouseUp={() => handleAnalog("arrowup", false)}
          onMouseLeave={() => handleAnalog("arrowup", false)}
          onTouchStart={() => handleAnalog("arrowup", true)}
          onTouchEnd={() => handleAnalog("arrowup", false)}
        >↑</button>
        <div className="horizontal">
          <button className="arrow left"
            onMouseDown={() => handleAnalog("arrowleft", true)}
            onMouseUp={() => handleAnalog("arrowleft", false)}
            onMouseLeave={() => handleAnalog("arrowleft", false)}
            onTouchStart={() => handleAnalog("arrowleft", true)}
            onTouchEnd={() => handleAnalog("arrowleft", false)}
          >←</button>
          <button className="arrow right"
            onMouseDown={() => handleAnalog("arrowright", true)}
            onMouseUp={() => handleAnalog("arrowright", false)}
            onMouseLeave={() => handleAnalog("arrowright", false)}
            onTouchStart={() => handleAnalog("arrowright", true)}
            onTouchEnd={() => handleAnalog("arrowright", false)}
          >→</button>
        </div>
        <button className="arrow down"
          onMouseDown={() => handleAnalog("arrowdown", true)}
          onMouseUp={() => handleAnalog("arrowdown", false)}
          onMouseLeave={() => handleAnalog("arrowdown", false)}
          onTouchStart={() => handleAnalog("arrowdown", true)}
          onTouchEnd={() => handleAnalog("arrowdown", false)}
        >↓</button>
      </div>

      <div className="event-panel">
        <p className="event-text">📍 Event info will appear here...</p>
        <button className="event-button">Interact</button>
      </div>
    </div>
  );
}
