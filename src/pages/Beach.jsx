import React, { useEffect, useState, useRef } from "react";
import "./Gameplay.css";
import beachMap from "../assets/map/Beach.jpg";
import coconutTreeImg from "../assets/map-assets/Beach/Beach_tree_with_coconut.png";
import coconutVideo from "../assets/map-assets/Beach/coconut_fall_animation.mp4";
import coconutIcon from "../assets/inventory-items/Coconut.png";
import scrollBanner from "../assets/ui/ScrollObtainedItem.png";


const MAP_WIDTH = 1384;
const MAP_HEIGHT = 1039;
const SPRITE_SIZE = 64;

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Beach() {
  const [status, setStatus] = useState({ meal: 50, sleep: 50, happiness: 50, cleanliness: 50 });
  const [money, setMoney] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [username, setUsername] = useState("Player");
  const [currentMinute, setCurrentMinute] = useState(0);
  const [currentHour, setCurrentHour] = useState(9);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [position, setPosition] = useState({ x: MAP_WIDTH / 2 - SPRITE_SIZE / 2, y: MAP_HEIGHT - SPRITE_SIZE });
  const [character, setCharacter] = useState(null);
  const [direction, setDirection] = useState("down");
  const [isMoving, setIsMoving] = useState(false);

  const [nearExitZone, setNearExitZone] = useState(false);
  const [inCoconutZone, setInCoconutZone] = useState(false);
  const [inSunbatheZone, setInSunbatheZone] = useState(false);
  const [isSunbathing, setIsSunbathing] = useState(false);
  const [skipRequested, setSkipRequested] = useState(false);

  const [showCoconutGame, setShowCoconutGame] = useState(false);
  const [showCoconutVideo, setShowCoconutVideo] = useState(false);
  const [showCoconutResult, setShowCoconutResult] = useState(false);


  const keysPressed = useRef({});

  const isInWater = (x, y) => {
    return y >= 0 && y <= 170;
  };

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
      if (isSunbathing) return;

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

        if (isInWater(newPos.x, newPos.y)) return prev;

        setIsMoving(moved);

        setNearExitZone(newPos.y >= MAP_HEIGHT - SPRITE_SIZE);
        setInCoconutZone(
          newPos.x >= 100 && newPos.x <= 300 &&
          newPos.y >= 650 && newPos.y <= 850
        );
        setInSunbatheZone(newPos.x >= 750 && newPos.x <= 900 && newPos.y >= 240 && newPos.y <= 380);

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
  }, [isSunbathing]);

  const getEventText = () => {
    if (inSunbatheZone) return "🌞 Press Interact to sunbathe";
    if (inCoconutZone) return "🥥 Press Interact to shake the coconut tree";
    if (nearExitZone) return "🔙 Press Interact to return to the main map";
    return "📍 Event info will appear here...";
  };

  const handleInteract = () => {
    if (inSunbatheZone) {
      setIsSunbathing(true);
      setSkipRequested(false);
      const isLeft = position.x < 825;
      const targetX = isLeft ? 765 : 830;
      const targetY = 290;
      setPosition({ x: targetX, y: targetY });

      // Reset skip
      let tick = 0;
      const cleanlinessStep = 20 / 5; // 4% per detik
      const timeStep = 60 / 5; // 12 menit per detik

      const interval = setInterval(() => {
        if (skipRequested || tick >= 5) {
          // Langsung selesaikan
          setStatus(prev => ({
            ...prev,
            cleanliness: Math.max(prev.cleanliness - 20, 0)
          }));
          setCurrentMinute(min => {
            const total = currentHour * 60 + min + 60;
            setCurrentHour(Math.floor((total % 1440) / 60));
            setCurrentDayIndex((currentDayIndex + Math.floor(total / 1440)) % 7);
            return total % 60;
          });
          setIsSunbathing(false);
          clearInterval(interval);
          return;
        }

        // Perlahan turunkan cleanliness dan naikan waktu
        setStatus(prev => ({
          ...prev,
          cleanliness: Math.max(prev.cleanliness - cleanlinessStep, 0)
        }));
        setCurrentMinute(min => {
          let total = currentHour * 60 + min + timeStep;
          setCurrentHour(Math.floor((total % 1440) / 60));
          setCurrentDayIndex((currentDayIndex + Math.floor(total / 1440)) % 7);
          return total % 60;
        });

        tick++;
      }, 1000);
    }

    if (inCoconutZone) {
      setShowCoconutGame(true); // munculin gambar pertama
      return;
    }

    if (nearExitZone) {
      const saved = JSON.parse(localStorage.getItem("playerData")) || {};
      localStorage.setItem("playerData", JSON.stringify({
        ...saved,
        status,
        money,
        inventory
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

  const getSpriteOffset = () => {
    if (isSunbathing) return "0px 0px";
    const directionMap = { down: 0, left: 1, right: 2, up: 3 };
    const row = directionMap[direction];
    const col = isMoving ? Math.floor(Date.now() / 150) % 4 : 1;
    return `-${col * SPRITE_SIZE}px -${row * SPRITE_SIZE}px`;
  };

  const offsetX = Math.min(Math.max(-position.x + window.innerWidth / 2, -(MAP_WIDTH - window.innerWidth)), 0);
  const offsetY = Math.min(Math.max(-position.y + window.innerHeight / 2, -(MAP_HEIGHT - window.innerHeight)), 0);

  const handleAnalog = (key, value) => {
    if (!isSunbathing) keysPressed.current[key] = value;
  };

  const formatTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  return (
    <div className="viewport">
      {/* Coconut Minigame UI */}
      {showCoconutGame && (
        <div className="coconut-overlay" onClick={() => {
          setShowCoconutGame(false);
          setShowCoconutVideo(true);
        }}>
          <img src={coconutTreeImg} alt="Tree POV" className="coconut-image" />
          <div className="tap-text">Tap the coconut</div>
        </div>
      )}


      {showCoconutVideo && (
        <div className="coconut-overlay">
          <video
            src={coconutVideo}
            autoPlay
            onEnded={() => {
              setShowCoconutVideo(false);
              setShowCoconutResult(true);
              setInventory(prev => [...prev, "Coconut"]);
            }}
            className="coconut-video"
          />
        </div>
      )}

      {showCoconutResult && (
        <div className="coconut-overlay result">
          <div
            className="obtained-banner"
            style={{ backgroundImage: `url(${scrollBanner})` }}
          >
            <div className="obtained-text">You have obtained</div>
            <img src={coconutIcon} alt="Coconut" className="coconut-icon" />
            <div className="item-name">Coconut</div>
            <button className="ok-button" onClick={() => setShowCoconutResult(false)}>OK</button>
          </div>
        </div>
      )}


      <div className="time-display">
        <div className="clock-text">{days[currentDayIndex]}, {formatTime(currentHour, currentMinute)}</div>
      </div>

      <div className="map" style={{
        backgroundImage: `url(${beachMap})`,
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
              backgroundImage: `url(${character.sprite})`,
              backgroundPosition: getSpriteOffset(),
              transform: isSunbathing ? "rotate(180deg)" : "none"
            }}
          ></div>
        )}
        
        <div className="exit-gradient-zone"></div>

        <div className="water-zone"></div>
        <div className="sunbathe-zone"></div>
        <div className="coconut-zone"></div>
        
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
        <button className="arrow up" onMouseDown={() => handleAnalog("arrowup", true)} onMouseUp={() => handleAnalog("arrowup", false)}>↑</button>
        <div className="horizontal">
          <button className="arrow left" onMouseDown={() => handleAnalog("arrowleft", true)} onMouseUp={() => handleAnalog("arrowleft", false)}>←</button>
          <button className="arrow right" onMouseDown={() => handleAnalog("arrowright", true)} onMouseUp={() => handleAnalog("arrowright", false)}>→</button>
        </div>
        <button className="arrow down" onMouseDown={() => handleAnalog("arrowdown", true)} onMouseUp={() => handleAnalog("arrowdown", false)}>↓</button>
      </div>

      <div className="event-panel">
        <p className="event-text">{getEventText()}</p>
        <button className="event-button" onClick={handleInteract}>Interact</button>
      </div>
    </div>
  );
}
