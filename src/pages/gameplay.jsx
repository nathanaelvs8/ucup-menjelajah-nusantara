import React, { useEffect, useState, useRef } from "react";
import "./Gameplay.css";
import mapImage from "../assets/map/Main.jpg";
import mainMapImage from "../assets/map/MainMap.jpg";
import mapIcon from "../assets/ui/map_icon.png";

const MAP_WIDTH = 4616;
const MAP_HEIGHT = 3464;
const SPRITE_SIZE = 64;
const MINUTE_PER_REAL_SECOND = 4; // 1 detik = 4 menit in-game
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Gameplay() {
  const [character, setCharacter] = useState(null);
  const [position, setPosition] = useState(() => {
  const saved = JSON.parse(localStorage.getItem("playerData"));
  return saved?.position || { x: 600, y: 2500 };
});
  const [direction, setDirection] = useState("down");
  const [isMoving, setIsMoving] = useState(false);
  const [showMainMap, setShowMainMap] = useState(false);
  const [inHouseZone, setInHouseZone] = useState(false);
  const [inLakeZone, setInLakeZone] = useState(false);
  const [nearLakeZone, setNearLakeZone] = useState(false);
  const [nearBeachZone, setNearBeachZone] = useState(false);
  const [inMarketZone, setInMarketZone] = useState(false);
  const [nearForestZone, setNearForestZone] = useState(false);


  const keysPressed = useRef({});
  const mainMapRef = useRef(null);

    
  const savedData = JSON.parse(localStorage.getItem("playerData")) || {};
  const [status, setStatus] = useState(savedData.status || {
    meal: 50,
    sleep: 50,
    happiness: 50,
    cleanliness: 50,
  });
  const [money, setMoney] = useState(savedData.money || 5000);
  const [inventory, setInventory] = useState(savedData.inventory || ["Pickaxe"]);

  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0); // 0 - 59
  const [currentHour, setCurrentHour] = useState(9); // 0 - 23
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // Monday
  const [username, setUsername] = useState(localStorage.getItem("playerName") || "Player");

  const getMainMapCharPosition = () => {
    const img = mainMapRef.current;
    if (!img) return { left: 0, top: 0 };
    const width = img.offsetWidth;
    const height = img.offsetHeight;
    const left = (position.x / MAP_WIDTH) * width;
    const top = (position.y / MAP_HEIGHT) * height;
    return { left: `${left}px`, top: `${top}px` };
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("selectedCharacter"));
    if (saved) setCharacter(saved);
  }, []);

  useEffect(() => {
  const timeData = JSON.parse(localStorage.getItem("playerTime"));
  let minute = 0;
  let hour = 9;
  let day = 0;

  if (timeData) {
    const now = Date.now();
    const elapsed = Math.floor((now - timeData.startTimestamp) / 250); // 1 tick = 250ms = 1 menit game

    let totalMinutes = timeData.savedHour * 60 + timeData.savedMinute + elapsed;
    day = (timeData.savedDay + Math.floor(totalMinutes / (24 * 60))) % 7;
    hour = Math.floor((totalMinutes % (24 * 60)) / 60);
    minute = totalMinutes % 60;
  }

  setCurrentMinute(minute);
  setCurrentHour(hour);
  setCurrentDayIndex(day);

  const tick = () => {
    minute += 1;

    if (minute >= 60) {
      minute = 0;
      hour += 1;

      setStatus((prev) => {
        const newStatus = { ...prev };
        for (let key in newStatus) {
          newStatus[key] = Math.max(newStatus[key] - 2, 0);
        }
        const allZero = Object.values(newStatus).every(val => val === 0);
        if (allZero) window.location.href = "/ending";
        return newStatus;
      });
    }

    if (hour >= 24) {
      hour = 0;
      day = (day + 1) % 7;
    }

    setCurrentMinute(minute);
    setCurrentHour(hour);
    setCurrentDayIndex(day);

    timeoutRef.current = setTimeout(tick, 250);
  };

  const timeoutRef = { current: null };
  timeoutRef.current = setTimeout(tick, 250);

  return () => clearTimeout(timeoutRef.current);
}, []);



  const getGreeting = () => {
    if (currentHour >= 5 && currentHour < 12) return "Good Morning";
    if (currentHour >= 12 && currentHour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

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

        const cx = 395;
        const cy = 1775;
        const rx = 275;
        const ry = 125;
        const dx = newPos.x - cx;
        const dy = newPos.y - cy;
        const insideLake = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;

        const inMountain =
          (() => {
            const triX = newPos.x - 1240;
            const triY = newPos.y - 850;
            const triW = 620;
            const triH = 350;
            return (
              triX >= 0 &&
              triX <= triW &&
              triY >= 0 &&
              triY <= triH &&
              triY >= Math.abs(triX - triW / 2) * (triH / (triW / 2))
            );
          })() ||
          (newPos.x >= 1200 && newPos.x <= 2100 && newPos.y >= 1200 && newPos.y <= 1450) ||
          (newPos.x >= 1200 && newPos.x <= 2100 && newPos.y >= 1450 && newPos.y <= 1700);

        const riverZones = [
          { x: 2990, y: 2080, w: 120, h: 50 },
          { x: 2920, y: 2130, w: 150, h: 50 },
          { x: 2860, y: 2180, w: 120, h: 50 },
          { x: 2870, y: 2230, w: 45,  h: 30 },
          { x: 2730, y: 2300, w: 95,  h: 80 },
          { x: 2630, y: 2380, w: 130, h: 100 },
          { x: 2560, y: 2480, w: 140, h: 100 },
          { x: 2510, y: 2580, w: 130, h: 100 },
          { x: 2450, y: 2680, w: 110, h: 80 },
          { x: 2390, y: 2830, w: 80,  h: 100 },
          { x: 2350, y: 2930, w: 80,  h: 100 },
          { x: 2320, y: 3030, w: 80,  h: 100 },
          { x: 2300, y: 3130, w: 80,  h: 100 },
          { x: 2270, y: 3230, w: 80,  h: 100 },
          { x: 2250, y: 3330, w: 80,  h: 200 }
        ];

        const inRiver = riverZones.some(zone =>
          newPos.x >= zone.x &&
          newPos.x <= zone.x + zone.w &&
          newPos.y >= zone.y &&
          newPos.y <= zone.y + zone.h
        );

        const inForest =
          newPos.x >= 0 && newPos.x <= 900 &&
          newPos.y >= 0 && newPos.y <= 1250;

        if (!insideLake && !inMountain && !inRiver && !inForest) {
          setIsMoving(moved);
          return newPos;
        }
        return prev;
      });
      animationId = requestAnimationFrame(update);
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = true;
      if (key === "m") setShowMainMap((prev) => !prev);
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
    const inHouse = position.x >= 490 && position.x <= 750 && position.y >= 2240 && position.y <= 2475;
    setInHouseZone(inHouse);

    const cx = 395;
    const cy = 1775;
    const rx = 275;
    const ry = 125;
    const dx = position.x - cx;
    const dy = position.y - cy;
    const normalized = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
    const inLake = normalized <= 1;
    const nearLake = normalized > 1 && normalized <= 1.25;

    const nearBeach =
      (position.x >= 1100 && position.x <= 1200 && position.y >= 0 && position.y <= 100) ||
      (position.x >= 1200 && position.x <= 1300 && position.y >= 0 && position.y <= 250) ||
      (position.x >= 1300 && position.x <= 1400 && position.y >= 0 && position.y <= 400) ||
      (position.x >= 1400 && position.x <= 1700 && position.y >= 0 && position.y <= 600) ||
      (position.x >= 1700 && position.x <= 2100 && position.y >= 290 && position.y <= 690) ||
      (position.x >= 2000 && position.x <= 3200 && position.y >= 350 && position.y <= 800);

    const inMarket = position.x >= 3100 && position.x <= 3450 && position.y >= 2780 && position.y <= 3040;

    const forest = { x: 0, y: 0, w: 900, h: 1250 };
    const insideForest =
      position.x >= forest.x &&
      position.x <= forest.x + forest.w &&
      position.y >= forest.y &&
      position.y <= forest.y + forest.h;


    const touchingForest =
      !insideForest && (
        position.x >= forest.x - 10 &&
        position.x <= forest.x + forest.w + 10 &&
        position.y >= forest.y - 10 &&
        position.y <= forest.y + forest.h + 10
      );

    setInLakeZone(inLake);
    setNearLakeZone(!inLake && nearLake);
    setNearBeachZone(nearBeach);
    setInMarketZone(inMarket);
    setNearForestZone(touchingForest);
  }, [position]);

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

const handleInteract = () => {
  const saveData = { character, position, status, money, inventory };
  localStorage.setItem("playerData", JSON.stringify(saveData));
  localStorage.setItem("playerTime", JSON.stringify({
    startTimestamp: Date.now(),
    savedMinute: currentMinute,
    savedHour: currentHour,
    savedDay: currentDayIndex
  }));

  if (inHouseZone) {
    window.location.href = "/house";
  } else if (nearLakeZone) {
    window.location.href = "/fishing";
  } else if (nearBeachZone) {
    window.location.href = "/beach";
  } else if (inMarketZone) {
    window.location.href = "/market";
  } else if (nearForestZone) {
    window.location.href = "/forest";
  }
};

  return (
    <div className="viewport">
      <div className="time-display">
        <div className="clock-text">{days[currentDayIndex]}, {formatTime(currentHour, currentMinute)}</div>
    </div>
      <div
        className="map"
        style={{ backgroundImage: `url(${mapImage})`, left: `${offsetX}px`, top: `${offsetY}px` }}
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
        <div className="house-zone"></div>
        <div className="lake-zone"></div>
        <div className="mountain-zone part-1"></div>
        <div className="mountain-zone part-2"></div>
        <div className="mountain-zone part-3"></div>
        <div className="beach-zone part-a"></div>
        <div className="beach-zone part-b"></div>
        <div className="beach-zone part-c"></div>
        <div className="beach-zone part-d"></div>
        <div className="beach-zone part-e"></div>
        <div className="beach-zone part-f"></div>
        <div className="river-zone part-a"></div>
        <div className="river-zone part-b"></div>
        <div className="river-zone part-c"></div>
        <div className="river-zone part-d"></div>
        <div className="river-zone part-e"></div>
        <div className="river-zone part-f"></div>
        <div className="river-zone part-g"></div>
        <div className="river-zone part-h"></div>
        <div className="river-zone part-i"></div>
        <div className="river-zone part-j"></div>
        <div className="river-zone part-k"></div>
        <div className="river-zone part-l"></div>
        <div className="river-zone part-m"></div>
        <div className="river-zone part-n"></div>
        <div className="river-zone part-o"></div>
        <div className="market-zone"></div>
        <div className="forest-zone"></div>

      </div>

      <div className="status-ui">
        <div className="status-left">
          <div className="greeting-ui">
            {getGreeting()}, {username}
          </div>
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
            <div className="inventory-grid">
              {inventory.map((item, i) => (
                <div key={i} className="inventory-item">{item}</div>
              ))}
            </div>
          )}
        </div>
      </div>


      <div className="analog-controls">
        <button className="arrow up" onMouseDown={() => handleAnalog("arrowup", true)} onMouseUp={() => handleAnalog("arrowup", false)} onTouchStart={() => handleAnalog("arrowup", true)} onTouchEnd={() => handleAnalog("arrowup", false)}>↑</button>
        <div className="horizontal">
          <button className="arrow left" onMouseDown={() => handleAnalog("arrowleft", true)} onMouseUp={() => handleAnalog("arrowleft", false)} onTouchStart={() => handleAnalog("arrowleft", true)} onTouchEnd={() => handleAnalog("arrowleft", false)}>←</button>
          <button className="arrow right" onMouseDown={() => handleAnalog("arrowright", true)} onMouseUp={() => handleAnalog("arrowright", false)} onTouchStart={() => handleAnalog("arrowright", true)} onTouchEnd={() => handleAnalog("arrowright", false)}>→</button>
        </div>
        <button className="arrow down" onMouseDown={() => handleAnalog("arrowdown", true)} onMouseUp={() => handleAnalog("arrowdown", false)} onTouchStart={() => handleAnalog("arrowdown", true)} onTouchEnd={() => handleAnalog("arrowdown", false)}>↓</button>
      </div>

      <div className="event-panel">
        <p className="event-text">
          {inHouseZone
            ? "🏠 Press Interact to enter the house"
            : nearLakeZone
            ? "🌊 Press Interact to fish"
            : nearBeachZone
            ? "🏖️ Press Interact to go to the beach"
            : inMarketZone
            ? "🛒 Press Interact to enter the market"
            : nearForestZone
            ? "🌲 Press Interact to enter the forest"
            : "📍 Event info will appear here..."}
        </p>
        <button className="event-button" onClick={handleInteract}>Interact</button>
      </div>

      <button className="map-toggle-button" onClick={() => setShowMainMap(true)}>
        <img src={mapIcon} alt="Map" />
      </button>

      {showMainMap && (
        <div className="main-map-overlay">
          <button className="close-map-button" onClick={() => setShowMainMap(false)}>✕</button>
          <div className="main-map-container">
            <img ref={mainMapRef} src={mainMapImage} alt="Main Map" className="main-map-img" />
            {character && (
              <div className="main-map-player-dot" style={getMainMapCharPosition()}>
                <img src={character.face} alt="Player" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
