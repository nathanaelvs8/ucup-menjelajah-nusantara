import React, { useEffect, useState, useRef } from "react";
import "./Gameplay.css";
import "./Forest.css";
import forestMap from "../assets/map/Forest.jpg";

const MAP_WIDTH = 1283.2;
const MAP_HEIGHT = 1039.2;
const SPRITE_SIZE = 64;
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Forest() {
  const [status, setStatus] = useState({ meal: 50, sleep: 50, happiness: 50, cleanliness: 50 });
  const [money, setMoney] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [username, setUsername] = useState("Player");
  const [currentMinute, setCurrentMinute] = useState(0);
  const [currentHour, setCurrentHour] = useState(9);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [position, setPosition] = useState({
    x: 500,           // lebih ke kiri
    y: MAP_HEIGHT - SPRITE_SIZE // tetap 2 tile dari bawah
  });

  const [atBottom, setAtBottom] = useState(false);

  const fruitTree = {
    x: 130 + 350 / 2, // centerX
    y: 200 + 280 / 2, // centerY
    rx: 350 / 2,
    ry: 280 / 2
  };
  const [canInteractFruit, setCanInteractFruit] = useState(false);

  const woodTree = {
    x: 900 + 150,  // centerX = left + width / 2
    y: 300 + 175,  // centerY = top + height / 2
    rx: 150,       // radiusX = width / 2
    ry: 175        // radiusY = height / 2
  };

  const [canInteractWood, setCanInteractWood] = useState(false);

  const dungeonZone = {
    x: 1100 + 125, // centerX = left + width / 2
    y: 0 + 85,     // centerY = top + height / 2
    rx: 125,       // radiusX = width / 2
    ry: 85         // radiusY = height / 2
  };

  const [canInteractDungeon, setCanInteractDungeon] = useState(false);



    const [character, setCharacter] = useState(null);
  const [direction, setDirection] = useState("down");
  const [isMoving, setIsMoving] = useState(false);
  const keysPressed = useRef({});

  useEffect(() => {
    const savedChar = JSON.parse(localStorage.getItem("selectedCharacter"));
    if (savedChar) setCharacter(savedChar);

    const savedData = JSON.parse(localStorage.getItem("playerData"));
    if (savedData) {
      setStatus(savedData.status || {});
      setMoney(savedData.money || 0);
      setInventory(savedData.inventory || []);
    }

    setUsername(localStorage.getItem("playerName") || "Player");

    const savedTime = JSON.parse(localStorage.getItem("playerTime"));
    if (savedTime) {
      setCurrentMinute(savedTime.savedMinute);
      setCurrentHour(savedTime.savedHour);
      setCurrentDayIndex(savedTime.savedDay);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMinute(prev => {
        let newMinute = prev + 1;
        setCurrentHour(prevHour => {
          let hour = prevHour;
          let day = currentDayIndex;

          if (newMinute >= 60) {
            newMinute = 0;
            hour += 1;
            setStatus(prev => {
              const newStatus = { ...prev };
              for (let key in newStatus) {
                newStatus[key] = Math.max(newStatus[key] - 2, 0);
              }
              if (Object.values(newStatus).every(val => val === 0)) window.location.href = "/ending";
              return newStatus;
            });
          }

          if (hour >= 24) {
            hour = 0;
            day = (day + 1) % 7;
            setCurrentDayIndex(day);
          }

          return hour;
        });

        return newMinute >= 60 ? 0 : newMinute;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [currentDayIndex]);


  useEffect(() => {
    let animationId;
    const update = () => {
      setPosition(prev => {
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

        //fruit tree
        const dx = (newPos.x - fruitTree.x) / fruitTree.rx;
        const dy = (newPos.y - fruitTree.y) / fruitTree.ry;
        const dist = dx * dx + dy * dy;

        const inside = dist < 0.7;   // ~radius dalam elips
        const near = dist >= 0.7 && dist <= 1.2; // tepi luar


        if (inside) return prev; // blok total
        setCanInteractFruit(near); // interaksi hanya saat dekat luar

        //wood tree
        const dxW = (newPos.x - woodTree.x) / woodTree.rx;
        const dyW = (newPos.y - woodTree.y) / woodTree.ry;
        const distW = dxW * dxW + dyW * dyW;

        const insideWood = distW < 1;         // ⬅️ tepat sama dengan ellipse CSS
        const nearWood = distW >= 1 && distW <= 1.2; // pinggiran

        if (insideWood) return prev; // blok total
        setCanInteractWood(nearWood);

        //dungeon
        const dxD = (newPos.x - dungeonZone.x) / dungeonZone.rx;
        const dyD = (newPos.y - dungeonZone.y) / dungeonZone.ry;
        const distD = dxD * dxD + dyD * dyD;

        const insideDungeon = distD < 1;
        const nearDungeon = distD >= 1 && distD <= 1.2;

        if (insideDungeon) return prev;
        setCanInteractDungeon(nearDungeon);

        
        setAtBottom(newPos.y >= MAP_HEIGHT - SPRITE_SIZE);
        return newPos;
      });

      animationId = requestAnimationFrame(update);
    };

    const handleKeyDown = (e) => { keysPressed.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e) => { keysPressed.current[e.key.toLowerCase()] = false; };

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

  const formatTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  const handleInteract = () => {
    if (canInteractFruit) {
      alert("🍎 You picked fruit from the tree!");
      return;
    }

    if (canInteractWood) {
      alert("🪓 You chopped some wood!");
      return;
    }

    if (canInteractDungeon) {
      alert("🕳️ You approach a mysterious dungeon entrance...");
      return;
    }

    if (atBottom) {
      const saved = JSON.parse(localStorage.getItem("playerData")) || {};
      const lastPos = JSON.parse(localStorage.getItem("lastGameplayPosition")) || { x: 600, y: 2500 };

      localStorage.setItem("playerData", JSON.stringify({
        ...saved,
        status,
        money,
        inventory,
        position: lastPos,
        character
      }));

      localStorage.setItem("playerTime", JSON.stringify({
        startTimestamp: Date.now(),
        savedMinute: currentMinute,
        savedHour: currentHour,
        savedDay: currentDayIndex
      }));

      window.location.href = "/gameplay";
    }
  };



  const getEventText = () => {
    if (canInteractFruit) return "🍎 Press Interact to pick wild fruit";
    if (canInteractWood) return "🪓 Press Interact to chop wood";
    if (canInteractDungeon) return "🕳️ Press Interact to enter dungeon";
    if (atBottom) return "🌲 Press Interact to return to the main map";
    return "📍 Event info will appear here...";
  };


  return (
    <div className="viewport">
      <div
        className="map"
        style={{
          backgroundImage: `url(${forestMap})`,
          left: `${offsetX}px`,
          top: `${offsetY}px`,
          width: `${MAP_WIDTH}px`,
          height: `${MAP_HEIGHT}px`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top left",
          position: "absolute"
        }}
      >
        {character && (
          <div
            className="character"
            style={{
              left: position.x,
              top: position.y,
              backgroundImage: `url(${character.sprite})`,
              backgroundPosition: getSpriteOffset()
            }}
          ></div>
        )}

        <div className="fruit-block-zone"></div>
        <div className="wood-block-zone"></div>
        <div className="dungeon-block-zone"></div>

      </div>

      <div className="time-display">
        <div className="clock-text">{days[currentDayIndex]}, {formatTime(currentHour, currentMinute)}</div>
      </div>

      <div className="status-ui">
        <div className="status-left">
          <div className="greeting-ui">Welcome back, {username}</div>
          <div className="status-bars">
            <div className="status-item">🍗<div className="bar"><div style={{ width: `${status.meal}%` }}></div></div></div>
            <div className="status-item">😴<div className="bar"><div style={{ width: `${status.sleep}%` }}></div></div></div>
            <div className="status-item">😊<div className="bar"><div style={{ width: `${status.happiness}%` }}></div></div></div>
            <div className="status-item">🛁<div className="bar"><div style={{ width: `${status.cleanliness}%` }}></div></div></div>
          </div>
        </div>

        <div className="status-money">
          <div className="money">Rp {money} 💰</div>
          <button className="inventory-btn" onClick={() => setInventoryVisible(prev => !prev)}>Inventory</button>
          {inventoryVisible && (
            <div className="inventory-modal">
              <div className="inventory-grid">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div key={i} className="inventory-slot">
                    {inventory[i] ? (
                      <div className="inventory-item">{inventory[i]}</div>
                    ) : null}
                  </div>
                ))}
              </div>
              <button
                className="close-inventory-btn"
                onClick={() => setInventoryVisible(false)}
              >
                Close
              </button>
            </div>
          )}

        </div>
      </div>

      <div className="analog-controls">
        <button className="arrow up" onMouseDown={() => keysPressed.current.arrowup = true} onMouseUp={() => keysPressed.current.arrowup = false}>↑</button>
        <div className="horizontal">
          <button className="arrow left" onMouseDown={() => keysPressed.current.arrowleft = true} onMouseUp={() => keysPressed.current.arrowleft = false}>←</button>
          <button className="arrow right" onMouseDown={() => keysPressed.current.arrowright = true} onMouseUp={() => keysPressed.current.arrowright = false}>→</button>
        </div>
        <button className="arrow down" onMouseDown={() => keysPressed.current.arrowdown = true} onMouseUp={() => keysPressed.current.arrowdown = false}>↓</button>
      </div>

      <div className="event-panel">
        <p className="event-text">{getEventText()}</p>
        <button className="event-button" onClick={handleInteract}>Interact</button>
      </div>

    </div>
  );
}
