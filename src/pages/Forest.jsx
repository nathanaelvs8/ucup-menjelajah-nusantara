import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Gameplay.css";
import "./Forest.css";
import forestMap from "../assets/map/Forest.jpg";
import minigameBg from "../assets/map-assets/Forest/Wildtree_minigame.png";
import wildFruitImg from "../assets/inventory-items/WildFruit.png";
import parasiteImg from "../assets/map-assets/Forest/Parasite.png";
import basketImg from "../assets/map-assets/Forest/Basket.png";
import scrollBanner from "../assets/ui/ScrollObtainedItem.png";
import chopBg1 from "../assets/map-assets/Forest/Deciduous_tree_minigame1.png";
import chopBg2 from "../assets/map-assets/Forest/Deciduous_tree_minigame2.png";
import sawImg from "../assets/map-assets/Forest/Saw.png";
import logIcon from "../assets/inventory-items/Log.png";

const MAP_WIDTH = 1283.2;
const MAP_HEIGHT = 1039.2;
const SPRITE_SIZE = 64;
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Forest() {
  const navigate = useNavigate();
  const [status, setStatus] = useState({ meal: 50, sleep: 50, happiness: 50, cleanliness: 50 });
  const [money, setMoney] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [username, setUsername] = useState("Player");
  const [currentMinute, setCurrentMinute] = useState(0);
  const [currentHour, setCurrentHour] = useState(9);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [position, setPosition] = useState({
    x: 500,
    y: MAP_HEIGHT - SPRITE_SIZE
  });

  const [atBottom, setAtBottom] = useState(false);

  const fruitTree = {
    x: 130 + 350 / 2,
    y: 200 + 280 / 2,
    rx: 350 / 2,
    ry: 280 / 2
  };
  const [canInteractFruit, setCanInteractFruit] = useState(false);

  const woodTree = {
    x: 900 + 150,
    y: 300 + 175,
    rx: 150,
    ry: 175
  };
  const [canInteractWood, setCanInteractWood] = useState(false);

  const dungeonZone = {
    x: 1100 + 125,
    y: 0 + 85,
    rx: 125,
    ry: 85
  };
  const [canInteractDungeon, setCanInteractDungeon] = useState(false);

  // Minigame states
  const [showMinigame, setShowMinigame] = useState(false);
  const [fruitsCaught, setFruitsCaught] = useState(0);
  const [minigameItems, setMinigameItems] = useState([]);
  const [basketX, setBasketX] = useState(window.innerWidth / 2 - 50);
  const [minigameResult, setMinigameResult] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [minigameStarted, setMinigameStarted] = useState(false);

  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);

  const [character, setCharacter] = useState(null);
  const [direction, setDirection] = useState("down");
  const [isMoving, setIsMoving] = useState(false);
  const keysPressed = useRef({});
  const basketRef = useRef(null);

  const [showChopMinigame, setShowChopMinigame] = useState(false);
  const [chopDurability, setChopDurability] = useState(100);
  const [chopTimeLeft, setChopTimeLeft] = useState(10);
  const [chopResult, setChopResult] = useState(null);
  const [isSawing, setIsSawing] = useState(false);
  const [showChopFinishImage, setShowChopFinishImage] = useState(false);

  // Save current game state before navigating
  const saveGameState = () => {
    const gameData = {
      status,
      money,
      inventory,
      position,
      character,
      currentMinute,
      currentHour,
      currentDayIndex
    };
    
    localStorage.setItem("forestGameState", JSON.stringify(gameData));
    localStorage.setItem("playerData", JSON.stringify({
      status,
      money,
      inventory,
      character
    }));
    localStorage.setItem("playerTime", JSON.stringify({
      startTimestamp: Date.now(),
      savedMinute: currentMinute,
      savedHour: currentHour,
      savedDay: currentDayIndex
    }));
  };

  // Load game state when component mounts
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

  // Cek apakah ada posisi terakhir gameplay sebelum masuk forest
  const lastPos = JSON.parse(localStorage.getItem("lastGameplayPosition"));
  if (lastPos) {
    // Jika ada lastPos berarti player baru balik dari gameplay,
    // posisinya di forest tetap spawn bawah (jika mau)
    // tapi bisa set posisi forest awal juga jika ingin spawn bawah forest
    setPosition({ x: 500, y: MAP_HEIGHT - SPRITE_SIZE }); // spawn bawah forest
  } else {
    // Kalau tidak ada lastPos, misal masuk pertama kali, spawn di bawah forest
    setPosition({ x: 500, y: MAP_HEIGHT - SPRITE_SIZE });
  }
}, []);


  // Time progression
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

  // Movement and collision detection
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

        // Fruit tree collision
        const dx = (newPos.x - fruitTree.x) / fruitTree.rx;
        const dy = (newPos.y - fruitTree.y) / fruitTree.ry;
        const dist = dx * dx + dy * dy;
        const inside = dist < 0.7;
        const near = dist >= 0.7 && dist <= 1.2;
        if (inside) return prev;
        setCanInteractFruit(near);

        // Wood tree collision
        const dxW = (newPos.x - woodTree.x) / woodTree.rx;
        const dyW = (newPos.y - woodTree.y) / woodTree.ry;
        const distW = dxW * dxW + dyW * dyW;
        const insideWood = distW < 1;
        const nearWood = distW >= 1 && distW <= 1.2;
        if (insideWood) return prev;
        setCanInteractWood(nearWood);

        // Dungeon collision
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

  // Minigame effects (keeping all existing minigame logic)
  useEffect(() => {
    if (!showMinigame || !minigameStarted || minigameResult) return;
    const spawnInterval = setInterval(() => {
      const isFruit = Math.random() > 0.25;
      const x = Math.random() * (window.innerWidth - 40);
      const id = Date.now() + Math.random();
      setMinigameItems(prev => [...prev, { id, x, y: 0, isFruit }]);
    }, 500);
    return () => clearInterval(spawnInterval);
  }, [showMinigame, minigameStarted, minigameResult]);

  useEffect(() => {
    if (!showMinigame || !minigameStarted) return;
    const dropUpdate = setInterval(() => {
      const basketRect = basketRef.current?.getBoundingClientRect();
      if (!basketRect) return;

      setMinigameItems(prev =>
        prev
          .map(item => ({ ...item, y: item.y + 8 }))
          .filter(item => {
            const itemWidth = item.isFruit ? 160 : 100;
            const itemHeight = item.isFruit ? 160 : 100;
            const itemLeft = item.x;
            const itemRight = item.x + itemWidth;
            const itemTop = item.y;
            const itemBottom = item.y + itemHeight;
            const MARGIN = 50;
            const basketLeft = basketRect.left + MARGIN;
            const basketRight = basketRect.right - MARGIN;
            const basketTop = basketRect.top + MARGIN;
            const basketBottom = basketRect.bottom - MARGIN;

            const isCollision =
              itemRight > basketLeft &&
              itemLeft < basketRight &&
              itemBottom > basketTop &&
              itemTop < basketBottom;

            if (isCollision) {
              if (item.isFruit) {
                setFruitsCaught(c => {
                  const total = c + 1;
                  if (total >= 15) setMinigameResult("win");
                  return total;
                });
              } else {
                setMinigameResult("lose");
              }
              return false;
            }

            return item.y < window.innerHeight;
          })
      );
    }, 40);

    return () => clearInterval(dropUpdate);
  }, [showMinigame, minigameStarted]);

  useEffect(() => {
    const down = e => {
      if (!showMinigame || minigameResult) return;
      const key = e.key.toLowerCase();
      if (key === "a" || key === "arrowleft") setLeftPressed(true);
      if (key === "d" || key === "arrowright") setRightPressed(true);
    };
    const up = e => {
      const key = e.key.toLowerCase();
      if (key === "a" || key === "arrowleft") setLeftPressed(false);
      if (key === "d" || key === "arrowright") setRightPressed(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [showMinigame, minigameResult]);

  useEffect(() => {
    if (!showMinigame || minigameResult) return;
    let animationId;
    const move = () => {
      setBasketX(prev => {
        if (leftPressed) return Math.max(prev - 12, 0);
        if (rightPressed) return Math.min(prev + 12, window.innerWidth - 160);
        return prev;
      });
      animationId = requestAnimationFrame(move);
    };
    animationId = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animationId);
  }, [showMinigame, minigameResult, leftPressed, rightPressed]);

  useEffect(() => {
    if (!countdown || !showMinigame) return;
    const sequence = ["3", "2", "1", "GO"];
    const currentIndex = sequence.indexOf(countdown);
    const timer = setTimeout(() => {
      if (currentIndex < sequence.length - 1) {
        setCountdown(sequence[currentIndex + 1]);
      } else {
        setCountdown(null);
        setMinigameStarted(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, showMinigame]);

  useEffect(() => {
    if (!showChopMinigame || chopResult) return;
    const timer = setInterval(() => {
      setChopTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setChopResult("lose");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showChopMinigame, chopResult]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (!showChopMinigame || chopResult) return;
      if (e.code === "Space") {
        setIsSawing(true);
        setChopDurability(prev => {
          const next = prev - 10;
          if (next <= 0) {
            setShowChopFinishImage(true);
            setTimeout(() => {
              setChopResult("win");
            }, 2000);
            return 0;
          }
          return next;
        });
        setTimeout(() => setIsSawing(false), 100);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showChopMinigame, chopResult]);

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
    if (showMinigame || showChopMinigame) return;

    if (canInteractFruit) {
      const overlay = document.createElement("div");
      overlay.className = "fade-black";
      document.body.appendChild(overlay);
      setTimeout(() => {
        document.body.removeChild(overlay);
        setShowMinigame(true);
        setFruitsCaught(0);
        setMinigameItems([]);
        setMinigameResult(null);
        setBasketX(window.innerWidth / 2 - 50);
        setCountdown(3);
        setMinigameStarted(false);
      }, 500);
      return;
    }

    if (canInteractWood) {
      const overlay = document.createElement("div");
      overlay.className = "fade-black";
      document.body.appendChild(overlay);
      setTimeout(() => {
        document.body.removeChild(overlay);
        setShowChopMinigame(true);
        setChopDurability(100);
        setChopTimeLeft(10);
        setChopResult(null);
      }, 500);
      return;
    }

    if (canInteractDungeon) {
      // Save current game state before navigating to dungeon
      saveGameState();
      navigate('/dungeon');
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

      navigate('/gameplay');
    }
  };

  const getEventText = () => {
    if (canInteractFruit) return "🍎 Press Interact to pick wild fruit";
    if (canInteractWood) return "🪓 Press Interact to chop wood";
    if (canInteractDungeon) return "🕳️ Press Interact to enter dungeon";
    if (atBottom) return "🌲 Press Interact to return to the main map";
    return "📍 Event info will appear here...";
  };

  const handleCloseMinigame = () => {
    const fade = document.createElement("div");
    fade.className = "fade-black";
    document.body.appendChild(fade);
    setTimeout(() => {
      document.body.removeChild(fade);
      setShowMinigame(false);
      if (minigameResult === "win") {
        setInventory(prev => [...prev, "Wild Fruit"]);
        setStatus(prev => ({ ...prev, happiness: Math.min(prev.happiness + 20, 100) }));
      } else {
        setStatus(prev => ({ ...prev, happiness: Math.max(prev.happiness - 20, 0) }));
      }
    }, 800);
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

      {/* Minigame overlays - keeping all existing minigame JSX */}
      {showMinigame && (
        <div className="coconut-overlay">
          <img src={minigameBg} alt="bg" className="coconut-image" />

          {countdown && (
            <div className="countdown-text">
              {countdown}
            </div>
          )}

          {minigameStarted && !minigameResult && (
            <div className="minigame-hint">
              🍎 Collect 15 wild fruits and avoid the parasite!
            </div>
          )}

          {minigameItems.map(item => (
            <img
              key={item.id}
              src={item.isFruit ? wildFruitImg : parasiteImg}
              alt={item.isFruit ? "fruit" : "parasite"}
              className={`falling-item ${item.isFruit ? "" : "parasite"}`}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                transform: `rotate(${(item.y + item.x) % 360}deg)`
              }}
            />
          ))}

          <img
            ref={basketRef}
            src={basketImg}
            alt="basket"
            className="basket"
            style={{ left: `${basketX}px` }}
          />

          <div className="basket-hint">
            Use ← / → or A / D to move the basket
          </div>

          <div className="fruit-counter">
            Fruits Caught: {fruitsCaught} / 15
          </div>

          {minigameResult && (
            <div className="coconut-overlay result">
              <div className="obtained-banner" style={{ backgroundImage: `url(${scrollBanner})` }}>
                <div className="obtained-text">
                  {minigameResult === "win"
                    ? "You caught 15 wild fruits!"
                    : "You caught a parasite!"}
                </div>
                <img
                  src={minigameResult === "win" ? wildFruitImg : parasiteImg}
                  alt="result"
                  className="coconut-icon"
                />
                <div className="item-name">
                  {minigameResult === "win" ? "Wild Fruit" : "Game Over"}
                </div>
                <button className="ok-button" onClick={handleCloseMinigame}>OK</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showChopMinigame && (
        <div className="coconut-overlay">
          <img
            src={
              showChopFinishImage || chopResult === "win"
                ? chopBg2
                : chopBg1
            }
            className="coconut-image"
            alt="tree"
          />

          <img
            src={sawImg}
            className="saw-image"
            alt="saw"
            style={{
              transform: isSawing ? "translateY(-10px)" : "translateY(0)",
              transition: "transform 0.1s",
            }}
          />

          {!chopResult && (
            <>
              <div className="minigame-hint">Press SPACE quickly to chop the tree!</div>
              <div className="countdown-text">
                ⏱️ Time Left: {chopTimeLeft}s
              </div>
              <div className="durability-text">
                🪓 Durability: {chopDurability}
              </div>
            </>
          )}

          {chopResult && (
            <div className="coconut-overlay result">
              <div className="obtained-banner" style={{ backgroundImage: `url(${scrollBanner})` }}>
                <div className="obtained-text">
                  {chopResult === "win" ? "You successfully chopped the tree!" : "You failed to chop it."}
                </div>
                <img
                  src={chopResult === "win" ? logIcon : sawImg}
                  alt="result"
                  className="coconut-icon"
                />
                <div className="item-name">{chopResult === "win" ? "Wood" : "Try Again"}</div>
                <button className="ok-button" onClick={() => {
                  const fade = document.createElement("div");
                  fade.className = "fade-black";
                  document.body.appendChild(fade);
                  setTimeout(() => {
                    document.body.removeChild(fade);
                    setShowChopMinigame(false);
                    setShowChopFinishImage(false);
                    if (chopResult === "win") {
                      setInventory(prev => [...prev, "Wood"]);
                    }
                  }, 800);
                }}>OK</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}