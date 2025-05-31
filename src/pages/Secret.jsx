import React, { useRef, useState, useEffect } from "react";
import "./Secret.css";
import craftingRecipes from "./CraftingRecipes.js";
import { getGreeting } from "./utils";
import Inventory from './Inventory.jsx';
import { itemIcons, itemDetails } from "./Inventory.jsx";
import inventoryIcon from "../assets/ui/Inventory.png";
import CraftIcon from "../assets/ui/Craft.png";
import EncyclopediaIcon from "../assets/ui/Encyclopedia.png";
import arrowUp from "../assets/ui/ArrowUP.png";
import arrowDown from "../assets/ui/ArrowDOWN.png";
import arrowLeft from "../assets/ui/ArrowLEFT.png";
import arrowRight from "../assets/ui/ArrowRight.png";
import SecretMapImg from "../assets/map/Secret.jpg";
import hungryIcon from "../assets/ui/Hunger.png";
import sleepIcon from "../assets/ui/Sleep.png";
import happyIcon from "../assets/ui/Happiness.png";
import cleanIcon from "../assets/ui/Cleanliness.png";

const MAP_WIDTH = 4616;
const MAP_HEIGHT = 3464;
const SPRITE_SIZE = 64;

// DI ATAS FUNCTION (paling atas file, setelah MAP_WIDTH, dsb)
const islandRadius = 1560;
const centerX = MAP_WIDTH / 2;
const centerY = MAP_HEIGHT / 2;
const ovalRadiusX = (islandRadius * 2 + 480) / 2;
const ovalRadiusY = islandRadius;
const ovalCenterX = centerX - (islandRadius + 300) + ovalRadiusX;
const ovalCenterY = centerY - islandRadius + 100 + ovalRadiusY;


const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Copy juga dari gameplay.jsx
function getDiscoveredItems() {
  return JSON.parse(localStorage.getItem("discoveredItems") || "[]");
}
function addDiscoveredItem(item) {
  const items = getDiscoveredItems();
  if (!items.includes(item)) {
    const updated = [...items, item];
    localStorage.setItem("discoveredItems", JSON.stringify(updated));
  }
}

export default function Secret() {
  // === Semua state yang sama seperti Gameplay ===
  const [character, setCharacter] = useState(null);
  const [position, setPosition] = useState({
    x: 450, // 100px dari kiri, bisa diganti ke 50, 120, dsb sesuai selera
    y: 1650 // tetap di tengah vertikal
  });

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
  const [inventory, setInventory] = useState(["Pickaxe"]);
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [showCraftModal, setShowCraftModal] = useState(false);
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [currentHour, setCurrentHour] = useState(9);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [username, setUsername] = useState(localStorage.getItem("playerName") || "Player");

  const [discoveredItems, setDiscoveredItems] = useState(getDiscoveredItems());
  const [encyclopediaSelected, setEncyclopediaSelected] = useState(Object.keys(itemIcons)[0]);
  const [craftingItem, setCraftingItem] = useState(null);


  const handleUseItem = (itemName) => {
    const itemIndex = inventory.findIndex(item => item === itemName);
    if (itemIndex === -1) return;

    const effectFn = itemDetails[itemName]?.useEffect;
    if (effectFn) {
      setStatus(prev => effectFn(prev));
      alert(`${itemName} used!`);
    } else {
      alert(`Used ${itemName}`);
    }

    // Remove item dari inventory
    const newInventory = [...inventory];
    newInventory.splice(itemIndex, 1);
    setInventory(newInventory);
  };

  const handleSellItem = (itemName) => {
    const itemIndex = inventory.findIndex(item => item === itemName);
    if (itemIndex === -1) return;

    const price = itemDetails[itemName]?.sellGold || 0;
    if (price <= 0) {
      alert(`Cannot sell ${itemName}`);
      return;
    }

    alert(`Sold ${itemName} for ${price} gold.`);
    const newInventory = [...inventory];
    newInventory.splice(itemIndex, 1);
    setInventory(newInventory);
    setMoney(prev => prev + price);
  };


  
  useEffect(() => {
    // Ambil data waktu
    const timeData = JSON.parse(localStorage.getItem("playerTime"));
    let minute = 0;
    let hour = 9;
    let day = 0;

    if (timeData) {
        const now = Date.now();
        const elapsed = Math.floor((now - timeData.startTimestamp) / 250);
        let totalMinutes = timeData.savedHour * 60 + timeData.savedMinute + elapsed;
        day = (timeData.savedDay + Math.floor(totalMinutes / (24 * 60))) % 7;
        hour = Math.floor((totalMinutes % (24 * 60)) / 60);
        minute = totalMinutes % 60;
      }

      setCurrentMinute(minute);
      setCurrentHour(hour);
      setCurrentDayIndex(day);

      // BUAT REF UNTUK BISA UPDATE STATUS
      let lastBuffUntil = 0;
      let lastStatus = null;
      const timeoutRef = { current: null };

      const tick = () => {
        minute += 1;
        if (minute >= 60) {
          minute = 0;
          hour += 1;

          // LOGIC BUFF SAMA PERSIS GAMEPLAY
          setStatus(prev => {
            const newStatus = { ...prev };

            // Megalodon Buff (misal, tambahkan jika punya buff di localStorage)
            let megalodonBuffUntil = localStorage.getItem("megalodonBuffUntil");
            if (megalodonBuffUntil && Date.now() < Number(megalodonBuffUntil)) {
              for (let key in newStatus) newStatus[key] = 100;
            } else {
              for (let key in newStatus) {
                newStatus[key] = Math.max(newStatus[key] - 2, 0);
              }
            }

            if (Object.values(newStatus).every((v) => v === 0)) {
              window.location.href = "/ending";
            }

            // Sync ke localStorage (biar konsisten antar halaman)
            const playerData = JSON.parse(localStorage.getItem("playerData")) || {};
            playerData.status = newStatus;
            localStorage.setItem("playerData", JSON.stringify(playerData));

            // Optional: ending jika semua status 0
            // if (Object.values(newStatus).every(v => v === 0)) window.location.href = "/ending";

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

    timeoutRef.current = setTimeout(tick, 250);

    return () => clearTimeout(timeoutRef.current);
  }, []);


  // ...tambahkan state lain jika perlu (event panel, notif, dll) ...

  // === INIT (ambil data player dari localStorage, persis gameplay.jsx) ===
  useEffect(() => {
    const savedChar = JSON.parse(localStorage.getItem("selectedCharacter"));
    if (savedChar) setCharacter(savedChar);

    const savedData = JSON.parse(localStorage.getItem("playerData")) || {};
    setStatus(savedData.status || {
      meal: 50,
      sleep: 50,
      happiness: 50,
      cleanliness: 50,
    });
    setMoney(savedData.money || 5000);
    setInventory(savedData.inventory || ["Pickaxe"]);
  }, []);

  // === Kamera offset, selalu center ke karakter ===
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const x = Math.min(
      Math.max(-(position.x + SPRITE_SIZE / 2) + window.innerWidth / 2, -(MAP_WIDTH - window.innerWidth)),
      0
    );
    const y = Math.min(
      Math.max(-(position.y + SPRITE_SIZE / 2) + window.innerHeight / 2, -(MAP_HEIGHT - window.innerHeight)),
      0
    );
    setOffset({ x, y });
  }, [position]);

  useEffect(() => {
    let animationId;
    const update = () => {
      setPosition((prev) => {
        let newPos = { ...prev };
        let tempX = newPos.x;
        let tempY = newPos.y;
        let moved = false;
        if (keysPressed.current.w || keysPressed.current.arrowup) {
          tempY = Math.max(tempY - 2, 0);
          setDirection("up");
          moved = true;
        }
        if (keysPressed.current.s || keysPressed.current.arrowdown) {
          tempY = Math.min(tempY + 2, MAP_HEIGHT - SPRITE_SIZE);
          setDirection("down");
          moved = true;
        }
        if (keysPressed.current.a || keysPressed.current.arrowleft) {
          tempX = Math.max(tempX - 2, 0);
          setDirection("left");
          moved = true;
        }
        if (keysPressed.current.d || keysPressed.current.arrowright) {
          tempX = Math.min(tempX + 2, MAP_WIDTH - SPRITE_SIZE);
          setDirection("right");
          moved = true;
        }

        // Logika cek di dalam oval/ellipse
        const charCenterX = tempX + SPRITE_SIZE / 2;
        const charCenterY = tempY + SPRITE_SIZE / 2;
        const relX = charCenterX - ovalCenterX;
        const relY = charCenterY - ovalCenterY;
        const isInsideOval =
          ((relX * relX) / (ovalRadiusX * ovalRadiusX)) +
          ((relY * relY) / (ovalRadiusY * ovalRadiusY)) <= 1;



        // Blokir movement kalau keluar oval
        if (isInsideOval) {
          newPos.x = tempX;
          newPos.y = tempY;
        } else {
          // Jika tidak, karakter stay di posisi lama (tidak update ke luar)
          // (opsional: tambahkan efek bump dsb kalau mau)
        }
        setIsMoving(moved);
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


  useEffect(() => {
    const currentDiscovered = getDiscoveredItems();
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


  // === Sprite frame animation ===
  function getSpriteOffset() {
    const directionMap = { down: 0, left: 1, right: 2, up: 3 };
    const row = directionMap[direction];
    const col = isMoving ? Math.floor(Date.now() / 150) % 4 : 1;
    return `-${col * SPRITE_SIZE}px -${row * SPRITE_SIZE}px`;
  }

  // Analog handler
  const handleAnalog = (key, value) => {
    keysPressed.current[key] = value;
  };

  // Interact handler (sesuaikan dengan event di secret)
  const handleInteract = () => {
    // Simpan SEMUA progress di secret ke localStorage
    localStorage.setItem("playerData", JSON.stringify({
      character,
      position,      // posisi terakhir di Secret
      status,
      money,
      inventory,
      currentMinute,
      currentHour,
      currentDayIndex
    }));

    // (Optional: kalau mau sync waktu/other key, bisa tambahkan di sini)

    // Ambil posisi terakhir sebelum masuk Secret
    const lastPos = JSON.parse(localStorage.getItem("lastGameplayPosition"));

    // Restore posisi terakhir ke playerData (di gameplay)
    if (lastPos) {
      // Update hanya posisi saja yang dipakai di gameplay
      // Atau bisa update status, uang, dsb kalau mau full restore
      lastPos.status = status;
      lastPos.money = money;
      lastPos.inventory = inventory;
      lastPos.character = character;
      lastPos.currentMinute = currentMinute;
      lastPos.currentHour = currentHour;
      lastPos.currentDayIndex = currentDayIndex;
      localStorage.setItem("playerData", JSON.stringify(lastPos));
    }

    // Redirect ke gameplay
    window.location.href = "/gameplay";
  };


  // Format waktu
  const formatTime = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  return (
    <div className="viewport">
      <div className="time-display">
        <div className="clock-text">{days[currentDayIndex]}, {formatTime(currentHour, currentMinute)}</div>
      </div>
      <div
        className="secret-map"
        style={{
          left: `${offset.x}px`,
          top: `${offset.y}px`,
          backgroundImage: `url(${SecretMapImg})`,
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
              width: SPRITE_SIZE,
              height: SPRITE_SIZE,
              position: "absolute"
            }}
          ></div>
        )}

      <div
        className="island-circle-debug"
        style={{
          left: centerX - (islandRadius + 300),
          top: centerY - islandRadius + 100,
          width: islandRadius * 2 + 480,
          height: islandRadius * 2 ,
          pointerEvents: "none"
        }}
      />
      </div>

      

      {/* UI status bar, gold, inventory, craft, encyclopedia */}
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
          <button className="inventory-btn" onClick={() => setInventoryVisible(true)}>
            <img src={inventoryIcon} alt="Inventory" />
          </button>
          <button className="inventory-btn craft-btn" style={{ marginTop: 8 }} onClick={() => setShowCraftModal(true)}>
            <img src={CraftIcon} alt="Craft" />
          </button>
          <button className="inventory-btn encyclopedia-btn" style={{ marginTop: 8 }} onClick={() => setShowEncyclopedia(true)}>
            <img src={EncyclopediaIcon} alt="Encyclopedia" />
          </button>
        </div>
      </div>


    {inventoryVisible && (
      <>
        <div
          className="modal-overlay"
          onClick={() => setInventoryVisible(false)}
        />
        <div
          className="inventory-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setInventoryVisible(false);
            }
          }}
        >
          <div style={{
            background: 'transparent',
            padding: '20px',
            maxWidth: '600px',
            width: '90%',
            height: '320px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div className="inventory-scroll-area" style={{ flex: 1, overflowY: 'auto' }}>
              <Inventory
                inventory={inventory}
                onUseItem={handleUseItem}
                onSellItem={handleSellItem}
              />
            </div>
            <button
              className="close-inventory-btn"
              onClick={() => setInventoryVisible(false)}
              style={{
                marginTop: '15px',
                width: '100%',
                background: '#333',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Close Inventory
            </button>
          </div>
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
            // Hitung bahan
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
                    addDiscoveredItem(recipe.result);
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
              {!discoveredItems.includes(encyclopediaSelected) && (
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


      {/* Panel event & tombol Interact */}
      <div className="event-panel">
        <p className="event-text">📍 Explore the Isle of the Sacred Oath.<br />Press Interact to return.</p>
        <button className="event-button" onClick={handleInteract}>Interact</button>
      </div>

      {/* Analog controls */}
      {!inventoryVisible && !showCraftModal && !showEncyclopedia && (
        <div className="analog-controls">
          <div className="analog-up-row">
            <button className="arrow up"
              onMouseDown={() => handleAnalog("arrowup", true)}
              onMouseUp={() => handleAnalog("arrowup", false)}
              onTouchStart={() => handleAnalog("arrowup", true)}
              onTouchEnd={() => handleAnalog("arrowup", false)}
            >
              <img src={arrowUp} alt="Up" className="arrow-img" />
            </button>
          </div>
          <div className="analog-middle-row">
            <button className="arrow left"
              onMouseDown={() => handleAnalog("arrowleft", true)}
              onMouseUp={() => handleAnalog("arrowleft", false)}
              onTouchStart={() => handleAnalog("arrowleft", true)}
              onTouchEnd={() => handleAnalog("arrowleft", false)}
            >
              <img src={arrowLeft} alt="Left" className="arrow-img" />
            </button>
            <div className="arrow-spacer"></div>
            <button className="arrow right"
              onMouseDown={() => handleAnalog("arrowright", true)}
              onMouseUp={() => handleAnalog("arrowright", false)}
              onTouchStart={() => handleAnalog("arrowright", true)}
              onTouchEnd={() => handleAnalog("arrowright", false)}
            >
              <img src={arrowRight} alt="Right" className="arrow-img" />
            </button>
          </div>
          <div className="analog-down-row">
            <button className="arrow down"
              onMouseDown={() => handleAnalog("arrowdown", true)}
              onMouseUp={() => handleAnalog("arrowdown", false)}
              onTouchStart={() => handleAnalog("arrowdown", true)}
              onTouchEnd={() => handleAnalog("arrowdown", false)}
            >
              <img src={arrowDown} alt="Down" className="arrow-img" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
