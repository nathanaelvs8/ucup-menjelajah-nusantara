import React, { useEffect, useState, useRef } from "react";
import "./Market.css";
import marketMap from "../assets/map/Market.jpg";
import arrowUp from "../assets/ui/ArrowUP.png";
import arrowDown from "../assets/ui/ArrowDOWN.png";
import arrowLeft from "../assets/ui/ArrowLEFT.png";
import arrowRight from "../assets/ui/ArrowRIGHT.png";
import hungryIcon from "../assets/inventory-items/Hunger.png";
import sleepIcon from "../assets/inventory-items/Sleep.png";
import happyIcon from "../assets/inventory-items/Happiness.png";
import cleanIcon from "../assets/inventory-items/Cleanliness.png";
import coinGif from "../assets/ui/MoneyMoney.gif";

const SPRITE_SIZE = 80;
const MAP_WIDTH = 2000;
const MAP_HEIGHT = 1600;
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const marketZones = [
  { x: 450, y: 700, width: 650, height: 650, name: "Toko Peralatan" },
  { x: 600, y: -100, width: 650, height: 650, name: "Toko Senjata" },
  { x: 1300, y: 530, width: 450, height: 300, name: "Mesin Slot" },
];

export default function Market() {
  const [character, setCharacter] = useState(null);
  const [position, setPosition] = useState({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const [direction, setDirection] = useState("down");
  const [isMoving, setIsMoving] = useState(false);
  const [status, setStatus] = useState({ meal: 50, sleep: 50, happiness: 50, cleanliness: 50 });
  const [money, setMoney] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [username, setUsername] = useState("Player");
  const [currentMinute, setCurrentMinute] = useState(0);
  const [currentHour, setCurrentHour] = useState(9);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [currentZoneName, setCurrentZoneName] = useState("");

  const keysPressed = useRef({});

  const handleAnalog = (key, value) => {
    keysPressed.current[key] = value;
  };

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("playerData"));
    if (savedData) {
      setStatus(savedData.status || {});
      setMoney(savedData.money || 0);
      setInventory(savedData.inventory || []);
    }
    const savedChar = JSON.parse(localStorage.getItem("selectedCharacter"));
    if (savedChar) setCharacter(savedChar);
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
              for (let key in newStatus) newStatus[key] = Math.max(newStatus[key] - 2, 0);
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
        let newX = prev.x;
        let newY = prev.y;
        let moved = false;

        if (keysPressed.current.w || keysPressed.current.arrowup) {
          newY = Math.max(newY - 2, 0);
          setDirection("up");
          moved = true;
        }
        if (keysPressed.current.s || keysPressed.current.arrowdown) {
          newY = Math.min(newY + 2, MAP_HEIGHT - SPRITE_SIZE);
          setDirection("down");
          moved = true;
        }
        if (keysPressed.current.a || keysPressed.current.arrowleft) {
          newX = Math.max(newX - 2, 0);
          setDirection("left");
          moved = true;
        }
        if (keysPressed.current.d || keysPressed.current.arrowright) {
          newX = Math.min(newX + 2, MAP_WIDTH - SPRITE_SIZE);
          setDirection("right");
          moved = true;
        }

        setIsMoving(moved);
        return { x: newX, y: newY };
      });

      animationId = requestAnimationFrame(update);
    };

    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === "e") handleInteract();
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    animationId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    const zone = marketZones.find(zone =>
      position.x + SPRITE_SIZE > zone.x &&
      position.x < zone.x + zone.width &&
      position.y + SPRITE_SIZE > zone.y &&
      position.y < zone.y + zone.height
    );
    setCurrentZoneName(zone ? zone.name : "");
  }, [position]);

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
    const zone = marketZones.find(zone =>
      position.x + SPRITE_SIZE > zone.x &&
      position.x < zone.x + zone.width &&
      position.y + SPRITE_SIZE > zone.y &&
      position.y < zone.y + zone.height
    );

    if (zone) {
      alert(`🛒 Interaksi dengan ${zone.name}`);
    } else {
      alert("⚠️ Tidak ada yang bisa diinteraksikan di sini.");
    }
  };

  return (
    <div className="viewport" style={{ position: "relative", backgroundColor: "#111", overflow: "hidden" }}>
      <div className="map" style={{
        backgroundImage: `url(${marketMap})`,
        width: `${MAP_WIDTH}px`,
        height: `${MAP_HEIGHT}px`,
        backgroundSize: "cover",
        position: "absolute",
        top: `${offsetY}px`,
        left: `${offsetX}px`,
        zIndex: 1
      }}>
        {marketZones.map((zone, i) => (
          <div key={i} style={{
            position: "absolute",
            left: zone.x,
            top: zone.y,
            width: zone.width,
            height: zone.height,
            border: "2px dashed limegreen",
            backgroundColor: "rgba(0,255,0,0.1)",
            pointerEvents: "none"
          }} />
        ))}
      </div>

      {character && (
        <div className="character" style={{
          position: "fixed",
          left: `calc(50vw - ${SPRITE_SIZE / 2}px)`,
          top: `calc(50vh - ${SPRITE_SIZE / 2}px)`,
          width: `${SPRITE_SIZE}px`,
          height: `${SPRITE_SIZE}px`,
          backgroundImage: `url(${character.sprite})`,
          backgroundPosition: getSpriteOffset(),
          backgroundSize: `${SPRITE_SIZE * 4}px ${SPRITE_SIZE * 4}px`,
          transform: "scale(1.8)",
          zIndex: 10
        }} />
      )}

      <div className="event-panel">
        <p className="event-text">
          {currentZoneName
            ? `🛒 Press Interact to enter ${currentZoneName}`
            : "⚠️ There's nothing to interact with here."}
        </p>
        <button className="event-button" onClick={handleInteract}>Interact</button>
      </div>

      <div className="analog-controls">
        <button className="arrow up" onMouseDown={() => handleAnalog("arrowup", true)} onMouseUp={() => handleAnalog("arrowup", false)} onTouchStart={() => handleAnalog("arrowup", true)} onTouchEnd={() => handleAnalog("arrowup", false)}><img src={arrowUp} alt="Up" className="arrow-img" /></button>
        <div className="horizontal">
          <button className="arrow left" onMouseDown={() => handleAnalog("arrowleft", true)} onMouseUp={() => handleAnalog("arrowleft", false)} onTouchStart={() => handleAnalog("arrowleft", true)} onTouchEnd={() => handleAnalog("arrowleft", false)}><img src={arrowLeft} alt="Left" className="arrow-img" /></button>
          <button className="arrow right" onMouseDown={() => handleAnalog("arrowright", true)} onMouseUp={() => handleAnalog("arrowright", false)} onTouchStart={() => handleAnalog("arrowright", true)} onTouchEnd={() => handleAnalog("arrowright", false)}><img src={arrowRight} alt="Right" className="arrow-img" /></button>
        </div>
        <button className="arrow down" onMouseDown={() => handleAnalog("arrowdown", true)} onMouseUp={() => handleAnalog("arrowdown", false)} onTouchStart={() => handleAnalog("arrowdown", true)} onTouchEnd={() => handleAnalog("arrowdown", false)}><img src={arrowDown} alt="Down" className="arrow-img" /></button>
      </div>

      <div className="status-ui">
        <div className="status-left">
          <div className="greeting-ui">Welcome back, {username}</div>
          <div className="status-bars">
                <div className="status-item">
                  <img src={hungryIcon} alt="Meal" className="status-icon" />
                  <div className="bar"><div style={{ width: `${status.meal}%` }}></div></div>
                </div>
                <div className="status-item">
                  <img src={sleepIcon} alt="Sleep" className="status-icon" />
                  <div className="bar"><div style={{ width: `${status.sleep}%` }}></div></div>
                </div>
                <div className="status-item">
                  <img src={happyIcon} alt="Happiness" className="status-icon" />
                  <div className="bar"><div style={{ width: `${status.happiness}%` }}></div></div>
                </div>
                <div className="status-item">
                  <img src={cleanIcon} alt="Cleanliness" className="status-icon" />
                  <div className="bar"><div style={{ width: `${status.cleanliness}%` }}></div></div>
                </div>
              </div>
        </div>

        <div className="status-money">
           <div className="money">
              {money}
              <img src={coinGif} alt="Gold" className="coin-icon" />
            </div>
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

      <div className="time-display">
        <div className="clock-text">{days[currentDayIndex]}, {formatTime(currentHour, currentMinute)}</div>
      </div>

      <button
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          fontSize: "16px",
          background: "#444",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          zIndex: 99,
        }}
        onClick={() => {
          const saved = JSON.parse(localStorage.getItem("playerData")) || {};
          localStorage.setItem("playerData", JSON.stringify({
            ...saved,
            status,
            money,
            inventory,
          }));
          localStorage.setItem("playerTime", JSON.stringify({
            startTimestamp: Date.now(),
            savedMinute: currentMinute,
            savedHour: currentHour,
            savedDay: currentDayIndex,
          }));
          window.location.href = "/gameplay";
        }}
      >
        🔙 Back to Gameplay
      </button>
    </div>
  );
}