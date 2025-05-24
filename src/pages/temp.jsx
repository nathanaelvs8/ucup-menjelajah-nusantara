import React, { useEffect, useState, useRef } from "react";
import "./Gameplay.css";
import "./House.css";
import homeMap from "../assets/map/Home.jpg";

const MAP_WIDTH = 1600;   // 4616 * 0.3
const MAP_HEIGHT = 1200;  // 3464 * 0.3


const SPRITE_SIZE = 64;
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function House() {
  const [status, setStatus] = useState({ meal: 50, sleep: 50, happiness: 50, cleanliness: 50 });
  const [money, setMoney] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [username, setUsername] = useState("Player");
  const [currentMinute, setCurrentMinute] = useState(0);
  const [currentHour, setCurrentHour] = useState(9);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [position, setPosition] = useState({ x: 720, y: 250 });
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

const isBlocked = (x, y) => {
  return blockedZones.some(zone =>
    x + SPRITE_SIZE > zone.x &&
    x < zone.x + zone.width &&
    y + SPRITE_SIZE > zone.y &&
    y < zone.y + zone.height
  );
};
  const blockedZones = [
  { x: 120, y: 60, width: 500, height: 300 }, // dapur
  { x: 900, y: 300, width: 500, height: 190 }, // bathtub
  { x: 900, y: 500, width: 500, height: 200 },  // dinding lukisan
  {x: 120, y: 600, width: 500, height: 500},//kasur
  { x: 900, y: 830, width: 180, height: 170 }, //meja
  { x: 550, y: 60, width: 300, height: 150 }, //pintu
   { x: 900, y: 60, width: 400, height: 150 },//jendela
    { x: 100, y:280, width: 100, height: 300 },// dindig krii sofa
      {x: 120, y: 1100, width: 500, height: 100},//pembatas bawah kir
        {x: 900, y: 1085, width: 500, height: 100},//pembatas bawah kanan
           { x: 1300, y:250, width: 100, height: 300 },// dindig kanan
           { x: 1300, y:650, width: 100, height: 500 },// dindig kanan bawah
];

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
      let tryX = prev.x;
      let tryY = prev.y;
      let moved = false;

      if (keysPressed.current.w || keysPressed.current.arrowup) {
        tryY = Math.max(prev.y - 2, 0);
        setDirection("up");
        moved = true;
      }
      if (keysPressed.current.s || keysPressed.current.arrowdown) {
        tryY = Math.min(prev.y + 2, MAP_HEIGHT - SPRITE_SIZE);
        setDirection("down");
        moved = true;
      }
      if (keysPressed.current.a || keysPressed.current.arrowleft) {
        tryX = Math.max(prev.x - 2, 0);
        setDirection("left");
        moved = true;
      }
      if (keysPressed.current.d || keysPressed.current.arrowright) {
        tryX = Math.min(prev.x + 2, MAP_WIDTH - SPRITE_SIZE);
        setDirection("right");
        moved = true;
      }

      setIsMoving(moved); // Pastikan `isMoving` terupdate

      if (!isBlocked(tryX, tryY)) {
        return { x: tryX, y: tryY };
      }
      return prev;
    });

    animationId = requestAnimationFrame(update);
  };

  // Event listener
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
  const col = isMoving ? Math.floor(Date.now() / 150) % 4 : 0; // Jika tidak bergerak, gunakan frame pertama
  return `-${col * SPRITE_SIZE}px -${row * SPRITE_SIZE}px`;
};

  const formatTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const handleInteract = () => {
    // Placeholder: hanya aktif jika ada zona tertentu, nanti ditambahkan
    // Sekarang tidak melakukan apa-apa saat user klik Interact
  };

  const offsetX = Math.min(Math.max(-position.x + window.innerWidth / 2, -(MAP_WIDTH - window.innerWidth)), 0);
  const offsetY = Math.min(Math.max(-position.y + window.innerHeight / 2, -(MAP_HEIGHT - window.innerHeight)), 0);


  return (
    <div className="viewport">
      <div className="map" style={{
        backgroundImage: `url(${homeMap})`,
        left: `${offsetX}px`,
        top: `${offsetY}px`,
        width: `${MAP_WIDTH}px`,
        height: `${MAP_HEIGHT}px`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top left",
        position: "absolute"
      }}>
{character && (
  <div
    className="character"
    style={{
      left: position.x,
      top: position.y,
      width: `${SPRITE_SIZE}px`,
      height: `${SPRITE_SIZE}px`,
      backgroundImage: `url(${character.sprite})`,
      backgroundPosition: getSpriteOffset(),
      backgroundSize: `${SPRITE_SIZE * 4}px ${SPRITE_SIZE * 4}px`, // biar nggak blur
      transform: "scale(1.8)", // 🔥 INI buat gedein karakter
      transformOrigin: "top left", // biar gak loncat posisi
      position: "absolute"
    }}
  ></div>
)}
{blockedZones.map((zone, i) => (
  <div
    key={i}
    style={{
      position: "absolute",
      left: zone.x,
      top: zone.y,
      width: zone.width,
      height: zone.height,
      border: "2px dashed yellow",
      backgroundColor: "rgba(255,255,0,0.1)",
      zIndex: 5,
      pointerEvents: "none"
    }}
  />
))}


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
        <p className="event-text">📍 Event info will appear here...</p>
        <button className="event-button" onClick={handleInteract}>Interact</button>
      </div>

      <button className="back-button" onClick={() => {
        const saved = JSON.parse(localStorage.getItem("playerData")) || {};
        const updatedData = { ...saved, status, money, inventory };
        localStorage.setItem("playerData", JSON.stringify(updatedData));
        localStorage.setItem("playerTime", JSON.stringify({
          startTimestamp: Date.now(),
          savedMinute: currentMinute,
          savedHour: currentHour,
          savedDay: currentDayIndex
        }));
        window.location.href = "/gameplay";
      }}>🔙 Back to Gameplay</button>
    </div>
  );
}
