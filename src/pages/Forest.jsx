import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Gameplay.css";
import "./Forest.css";
import { getGreeting } from "./utils";
import { itemDetails } from "./Inventory.jsx";
import craftingRecipes from "./CraftingRecipes";
import { itemIcons } from "./Inventory.jsx";
import CraftIcon from "../assets/ui/Craft.png";
import Inventory from "./Inventory.jsx"; // path harus benar, sesuaikan dengan struktur folder kamu
import inventoryIcon from "../assets/ui/Inventory.png";
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
import hungryIcon from "../assets/ui/Hunger.png";
import sleepIcon from "../assets/ui/Sleep.png";
import happyIcon from "../assets/ui/Happiness.png";
import cleanIcon from "../assets/ui/Cleanliness.png";
import EncyclopediaIcon from "../assets/ui/Encyclopedia.png"; // import icon-nya


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

  const [showCraftModal, setShowCraftModal] = useState(false);

  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [encyclopediaSelected, setEncyclopediaSelected] = useState(null);
  const [discoveredItems, setDiscoveredItems] = useState(() => {
    return JSON.parse(localStorage.getItem("discoveredItems") || "[]");
  });

  useEffect(() => {
    function syncDiscovered() {
      setDiscoveredItems(JSON.parse(localStorage.getItem("discoveredItems") || "[]"));
    }
    window.addEventListener("storage", syncDiscovered);
    return () => window.removeEventListener("storage", syncDiscovered);
  }, []);

  useEffect(() => {
    const currentDiscovered = JSON.parse(localStorage.getItem("discoveredItems") || "[]");
    let changed = false;
    for (const item of inventory) {
      if (item && !currentDiscovered.includes(item)) {
        currentDiscovered.push(item);
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem("discoveredItems", JSON.stringify(currentDiscovered));
      setDiscoveredItems([...currentDiscovered]);
    }
  }, [inventory]);


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

    // --- tambahkan pengecekan posisi terakhir forest (balik dari dungeon) ---
    const lastForestPos = JSON.parse(localStorage.getItem("lastForestPosition"));
    if (lastForestPos) {
      setPosition(lastForestPos);
      localStorage.removeItem("lastForestPosition");
      return;
    }

    // --- cek posisi dari gameplay (main map ke forest) ---
    const lastPos = JSON.parse(localStorage.getItem("lastGameplayPosition"));
    if (lastPos) {
      setPosition({ x: 500, y: MAP_HEIGHT - SPRITE_SIZE });
    } else {
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
      // Simpan posisi terakhir sebelum ke Dungeon
      localStorage.setItem("lastForestPosition", JSON.stringify(position));
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
          <div className="greeting-ui">{getGreeting(currentHour, username)}</div>
          <div className="status-bars">
            <div className="status-item">
              <img src={hungryIcon} alt="Meal" className="status-icon" />
              <div className={`bar${status.meal <= 30 ? " low" : ""}`}>
                <div style={{ width: `${status.meal}%` }} />
              </div>
            </div>
            <div className="status-item">
              <img src={sleepIcon} alt="Sleep" className="status-icon" />
              <div className={`bar${status.sleep <= 30 ? " low" : ""}`}>
                <div style={{ width: `${status.sleep}%` }} />
              </div>
            </div>
            <div className="status-item">
              <img src={happyIcon} alt="Happiness" className="status-icon" />
              <div className={`bar${status.happiness <= 30 ? " low" : ""}`}>
                <div style={{ width: `${status.happiness}%` }} />
              </div>
            </div>
            <div className="status-item">
              <img src={cleanIcon} alt="Cleanliness" className="status-icon" />
              <div className={`bar${status.cleanliness <= 30 ? " low" : ""}`}>
                <div style={{ width: `${status.cleanliness}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="status-money">
          <div className="money">{money} 💰</div>
          <button
            className="inventory-btn"
            onClick={() => setInventoryVisible(true)}
          >
            <img src={inventoryIcon} alt="Inventory" />
          </button>

          <button
            className="inventory-btn craft-btn"
            style={{ marginTop: 8 }}
            onClick={() => setShowCraftModal(true)}
          >
            <img src={CraftIcon} alt="Craft" />
          </button>

          <button
            className="inventory-btn encyclopedia-btn"
            style={{ marginTop: 8 }}
            onClick={() => setShowEncyclopedia(true)}
          >
            <img src={EncyclopediaIcon} alt="Encyclopedia" />
          </button>



          {inventoryVisible && (
            <>
              <div
                className="modal-overlay"
                onClick={() => setInventoryVisible(false)}
              />
              <div
                className="inventory-modal"
                onClick={e => {
                  if (e.target === e.currentTarget) setInventoryVisible(false);
                }}
              >
                <div className="inventory-scroll-area">
                  <Inventory
                    inventory={inventory}
                    onUseItem={itemName => {
                      const idx = inventory.findIndex(it => it === itemName);
                      if (idx !== -1) {
                        const details = itemDetails[itemName];
                        if (details && typeof details.useEffect === "function") {
                          setStatus(prev => details.useEffect(prev));
                        }
                        const newInventory = [...inventory];
                        newInventory.splice(idx, 1);
                        setInventory(newInventory);
                        const saved = JSON.parse(localStorage.getItem("playerData")) || {};
                        localStorage.setItem(
                          "playerData",
                          JSON.stringify({
                            ...saved,
                            inventory: newInventory,
                            status: details && typeof details.useEffect === "function" ? details.useEffect(status) : status,
                          })
                        );
                      }
                    }}
                    onSellItem={itemName => {
                      const idx = inventory.findIndex(it => it === itemName);
                      if (idx !== -1) {
                        const details = itemDetails[itemName];
                        const price = details?.sellGold || 0;
                        if (price > 0) {
                          setMoney(prev => prev + price);
                        } else {
                          alert("Item cannot be sold!");
                        }
                        const newInventory = [...inventory];
                        newInventory.splice(idx, 1);
                        setInventory(newInventory);
                        const saved = JSON.parse(localStorage.getItem("playerData")) || {};
                        localStorage.setItem(
                          "playerData",
                          JSON.stringify({
                            ...saved,
                            inventory: newInventory,
                            money: price > 0 ? (saved.money || 0) + price : saved.money,
                          })
                        );
                      }
                    }}
                  />

                </div>
                <button
                  className="close-inventory-btn"
                  onClick={() => setInventoryVisible(false)}
                >
                  Close
                </button>
              </div>
            </>
          )}

          {showCraftModal && (
            <div className="modal-overlay" onClick={() => setShowCraftModal(false)}>
              <div
                className="inventory-modal"
                style={{ zIndex: 1100, minHeight: 350, maxHeight: 600, overflowY: 'auto', position: "relative" }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 16, color: "#ffe66a" }}>
                  Crafting
                </div>
                {craftingRecipes.map(recipe => {
                  const materialCounts = recipe.materials.reduce((obj, mat) => {
                    obj[mat] = (obj[mat] || 0) + 1;
                    return obj;
                  }, {});
                  const hasResult = inventory.includes(recipe.result);
                  const enough = Object.entries(materialCounts).every(([mat, qty]) =>
                    inventory.filter(x => x === mat).length >= qty
                  ) && (!recipe.gold || money >= recipe.gold);

                  return (
                    <div
                      key={recipe.result}
                      style={{
                        display: "flex", alignItems: "center", gap: 18,
                        background: "#181818", borderRadius: 9, padding: "9px 14px", marginBottom: 12
                      }}
                    >
                      {/* Icon hasil craft, ada tooltip */}
                      <span className="craft-item-tooltip">
                        <img src={itemIcons[recipe.result]} alt={recipe.result} style={{ width: 38, height: 38 }} />
                        <span className="craft-tooltip-text">{recipe.result}</span>
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", color: "#ffe66a", fontSize: 16 }}>{recipe.result}</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                          {Object.entries(materialCounts).map(([mat, qty]) => (
                            <span key={mat} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                              {itemIcons[mat]
                                ? (
                                    <span className="craft-item-tooltip">
                                      <img
                                        src={itemIcons[mat]}
                                        alt={mat}
                                        className="craft-item-img"
                                      />
                                      <span className="craft-tooltip-text">{mat}</span>
                                    </span>
                                  )
                                : mat}
                              <span style={{ fontSize: 13 }}>x{qty}</span>
                            </span>
                          ))}
                          {recipe.gold && (
                            <span style={{ color: "#ffd700", fontSize: 14, marginLeft: 6 }}>
                              💰 {recipe.gold}
                            </span>
                          )}
                        </div>
                        {hasResult && <div style={{ color: "#f87171", fontSize: 13 }}>Only 1 allowed in inventory</div>}
                      </div>
                      <button
                        style={{
                          padding: "7px 13px",
                          fontSize: "15px",
                          background: enough && !hasResult ? "#3b82f6" : "#888",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          cursor: enough && !hasResult ? "pointer" : "not-allowed"
                        }}
                        disabled={!enough || hasResult}
                        onClick={() => {
                          // Remove bahan dari inventory
                          let newInv = [...inventory];
                          Object.entries(materialCounts).forEach(([mat, qty]) => {
                            for (let i = 0; i < qty; i++) {
                              const idx = newInv.indexOf(mat);
                              if (idx !== -1) newInv.splice(idx, 1);
                            }
                          });
                          let newMoney = money;
                          if (recipe.gold) newMoney -= recipe.gold;
                          newInv.push(recipe.result);
                          setInventory(newInv);
                          setMoney(newMoney);
                          // Simpan ke localStorage
                          const saved = JSON.parse(localStorage.getItem("playerData")) || {};
                          localStorage.setItem("playerData",
                            JSON.stringify({
                              ...saved,
                              inventory: newInv,
                              money: newMoney
                            })
                          );
                        }}
                      >
                        Craft
                      </button>
                    </div>
                  );
                })}
                <button
                  className="close-inventory-btn"
                  onClick={() => setShowCraftModal(false)}
                  style={{ marginTop: 8 }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {showEncyclopedia && (
            <div
              className="modal-overlay"
              style={{
                zIndex: 1200,
                background: "rgba(30, 25, 14, 0.96)"
              }}
              onClick={() => setShowEncyclopedia(false)}
            >
              <div
                className="encyclopedia-modal"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "min(1040px, 96vw)",
                  height: "min(640px, 85vh)",
                  background: "linear-gradient(120deg, #f3e9c6 0%, #fbf7e2 100%)",
                  border: "4px solid #c5a356",
                  borderRadius: "22px",
                  boxShadow: "0 8px 60px #8d794dcb",
                  overflow: "hidden",
                  margin: "auto",
                  position: "absolute",
                  left: 0, top: 0, right: 0, bottom: 0,
                  fontFamily: "'IM Fell English SC', serif"
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* PANEL KIRI — LIST */}
                <div className="encyclopedia-list"
                  style={{
                    width: 220,
                    background: "#ede3c2",
                    borderRight: "3.5px solid #bfae7e",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "30px 10px 18px 10px"
                  }}>
                  <div style={{fontWeight:"bold",color:"#b98b1e",fontSize:21,marginBottom:15,letterSpacing:1}}>Item List</div>
                  {Object.keys(itemIcons).map(item => {
                    const isFound = discoveredItems.includes(item);
                    return (
                      <div
                        key={item}
                        className="encyclopedia-item-slot"
                        style={{
                          marginBottom: 15,
                          cursor: "pointer",
                          opacity: isFound ? 1 : 0.5,
                          filter: isFound ? "none" : "grayscale(100%) brightness(1.25)",
                          border: encyclopediaSelected === item ? "3px solid #bfa24a" : "2.5px solid #e2c07090",
                          borderRadius: 11,
                          background: encyclopediaSelected === item ? "#ffeab5" : "#f4e5bc",
                          padding: "6px",
                          transition: "border 0.13s, background 0.14s"
                        }}
                        onClick={() => setEncyclopediaSelected(item)}
                      >
                        <img src={itemIcons[item]} alt={item}
                          style={{ width: 54, height: 54, display: "block", margin: "0 auto" }} />
                      </div>
                    );
                  })}
                </div>
                {/* PANEL KANAN — DETAIL */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 30px 10px 30px",
                    minWidth: 0,
                    textAlign: "center", // ini penting!
                  }}
                >
                  <img
                    src={itemIcons[encyclopediaSelected]}
                    alt={encyclopediaSelected}
                    style={{
                      width: 120,
                      height: 120,
                      marginBottom: 22,
                      filter: discoveredItems.includes(encyclopediaSelected) ? "none" : "grayscale(100%) brightness(1.18)"
                    }}
                  />
                  <div style={{
                    fontSize: 32,
                    color: "#7a5318",
                    fontWeight: "bold",
                    marginBottom: 22,
                    letterSpacing: 1.2,
                    textShadow: "0 2px 0 #fffbe9"
                  }}>
                    {encyclopediaSelected}
                  </div>
                  <div style={{
                    fontSize: 19,
                    color: "#715b34",
                    marginBottom: 18,
                    lineHeight: 1.45
                  }}>
                    <b>Description:</b>
                    <br />
                    {itemDetails[encyclopediaSelected]?.description || "???"}
                  </div>
                  <div style={{
                    fontSize: 18,
                    color: "#937b41",
                    marginBottom: 18,
                    lineHeight: 1.3
                  }}>
                    <b>How to get:</b>
                    <br />
                    {itemDetails[encyclopediaSelected]?.source || "???"}
                  </div>
                  {!inventory.includes(encyclopediaSelected) && (
                    <div style={{
                      color: "#be2424",
                      fontWeight: "bold",
                      fontSize: 17,
                      marginTop: 18
                    }}>
                      Item not found yet!
                    </div>
                  )}
                </div>
        
                
                {/* Close button */}
                <button
                  className="close-inventory-btn"
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 22,
                    zIndex: 30,
                    background: "#e2c070",
                    color: "#514116",
                    border: "none",
                    fontWeight: "bold",
                    fontSize: 18
                  }}
                  onClick={() => setShowEncyclopedia(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    {!inventoryVisible && !showCraftModal && !showEncyclopedia && (
      <>
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
      </>
      )}

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
                        setInventory(prev => {
                          const newInv = [...prev, "Wood"];
                          // Ambil semua state, jangan cuma inventory!
                          const saved = JSON.parse(localStorage.getItem("playerData")) || {};
                          localStorage.setItem("playerData", JSON.stringify({
                            ...saved,
                            inventory: newInv,
                            status,   // tambahkan ini!
                            money,    // dan ini!
                            character // dan ini kalau ada!
                          }));
                          return newInv;
                        });
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