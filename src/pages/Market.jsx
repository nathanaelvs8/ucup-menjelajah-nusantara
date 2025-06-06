import React, { useEffect, useState, useRef } from "react";
import "./Market.css";
import "./Gameplay.css";
import { getGreeting } from "./utils";
import { addActivity } from "./utils";
import craftingRecipes from "./CraftingRecipes";
import { itemIcons } from "./Inventory.jsx";
import CraftIcon from "../assets/ui/Craft.png";
import { itemDetails } from "./Inventory.jsx";
import Inventory from "./Inventory.jsx"; // path harus benar, sesuaikan dengan struktur folder kamu
import inventoryIcon from "../assets/ui/Inventory.png";
import marketMap from "../assets/map/Market.jpg";
import arrowUp from "../assets/ui/ArrowUP.png";
import arrowDown from "../assets/ui/ArrowDOWN.png";
import arrowLeft from "../assets/ui/ArrowLEFT.png";
import arrowRight from "../assets/ui/ArrowRIGHT.png";
import hungryIcon from "../assets/ui/Hunger.png";
import sleepIcon from "../assets/ui/Sleep.png";
import happyIcon from "../assets/ui/Happiness.png";
import cleanIcon from "../assets/ui/Cleanliness.png";
import coinGif from "../assets/ui/MoneyMoney.gif";
import mesinImg from "../assets/images/mesin.png";
import EncyclopediaIcon from "../assets/ui/Encyclopedia.png"; // import icon
import marketMusic from "../assets/audio/market.mp3";
import Shop from "./Shop.jsx"; // pastikan pathnya benar!


const SPRITE_SIZE = 80;
const MAP_WIDTH = 2000;
const MAP_HEIGHT = 1600;
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const marketZones = [
  { x: 450, y: 700, width: 650, height: 650, name: "Market" },
  { x: 1300, y: 530, width: 450, height: 300, name: "Slot Machine" },
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
  const [showSlotMachine, setShowSlotMachine] = useState(false);
  const [slotNumbers, setSlotNumbers] = useState([5, 5, 6]); // angka awal slot
  const [showShop, setShowShop] = useState(false);
const [showCraftModal, setShowCraftModal] = useState(false);
const marketAudioRef = useRef();

  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [encyclopediaSelected, setEncyclopediaSelected] = useState(null);
  const [discoveredItems, setDiscoveredItems] = useState(() =>
    JSON.parse(localStorage.getItem("discoveredItems") || "[]")
  );

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


const [isSpinning, setIsSpinning] = useState(false);
useEffect(() => {
  const savedMoney = localStorage.getItem("playerMoney");
  if (savedMoney !== null) {
    setMoney(parseInt(savedMoney, 10));
  } else {
    setMoney(5000); // default awal
  }
}, []);

const generateNumber = () => {
  const weightedNumbers = [
    1, 2, 3, 4,
    5, 5, 5, 5, 5,
    6, 6, 6, 6,
    7, 8, 9
  ];
  const idx = Math.floor(Math.random() * weightedNumbers.length);
  return weightedNumbers[idx];
};

const startSlot = () => {
  if (isSpinning) return;
  if (money < 1000) {
    alert("Gold is not enough to play slot machines!");
    return;
  }
  
  setIsSpinning(true);
  addActivity("Slot Machine");
  setMoney(prev => prev - 1000);

  let count = 0;
  let finalResult = null; // Untuk menyimpan hasil akhir
  
  const interval = setInterval(() => {
    const newNumbers = [
      generateNumber(),
      generateNumber(),
      generateNumber()
    ];
    
    setSlotNumbers(newNumbers);
    
    count++;
    if (count > 20) {
      clearInterval(interval);
      setIsSpinning(false);
      
      // Simpan hasil akhir setelah animasi selesai
      finalResult = newNumbers;
      
      // Hitung hadiah setelah 100ms untuk memastikan state terupdate
      setTimeout(() => {
        const slotValue = parseInt(finalResult.join(''), 10) * 10;
        setMoney(prev => prev + slotValue);
        alert(`Kamu mendapatkan ${slotValue} gold! (${finalResult.join('')} × 10)`);
      }, 100);
    }
  }, 100);
};



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
  // Ambil info buff dari localStorage
  const playerData = JSON.parse(localStorage.getItem("playerData") || "{}");
  const playerTime = JSON.parse(localStorage.getItem("playerTime") || "{}");
  const currentDayIndex = playerTime.savedDay ?? 0;

  // Hapus buff jika sudah lewat 3 hari
  if (playerData.megalodonBuffUntil !== undefined && playerData.megalodonBuffUntil < currentDayIndex) {
    delete playerData.megalodonBuffUntil;
    localStorage.setItem("playerData", JSON.stringify(playerData));
  }

  // Jika buff aktif, status tetap 100
  if (playerData.megalodonBuffUntil !== undefined && playerData.megalodonBuffUntil >= currentDayIndex) {
    return { meal: 100, sleep: 100, happiness: 100, cleanliness: 100 };
  }

  // Kalau tidak ada buff, status turun seperti biasa
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

  const offsetX = Math.min(Math.max(-(position.x + SPRITE_SIZE / 2) + window.innerWidth / 2, -(MAP_WIDTH - window.innerWidth)), 0);
  const offsetY = Math.min(Math.max(-(position.y + SPRITE_SIZE / 2) + window.innerHeight / 2, -(MAP_HEIGHT - window.innerHeight)), 0);


  const formatTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
const handleInteract = () => {
  const zone = marketZones.find(zone =>
    position.x + SPRITE_SIZE > zone.x &&
    position.x < zone.x + zone.width &&
    position.y + SPRITE_SIZE > zone.y &&
    position.y < zone.y + zone.height
  );

  if (zone) {
    if (zone.name === "Slot Machine") {
      setShowSlotMachine(true);
    } else if (zone.name === "Market") {
      setShowShop(true);
    } else {
      alert(`🛒 Interaksi dengan ${zone.name}`);
    }
  } else {
    alert("⚠️ Tidak ada yang bisa diinteraksikan di sini.");
  }
};


useEffect(() => {
  if (marketAudioRef.current) {
    marketAudioRef.current.volume = 0.6; // Atur volume sesuai selera
    marketAudioRef.current.play().catch(() => {});
  }
}, []);


  return (
    <>
  <audio
    ref={marketAudioRef}
    src={marketMusic}
    autoPlay
    loop
  />
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
    

        

      </div>

      {showShop && (
  <Shop
    onClose={() => setShowShop(false)}
    playerMoney={money}
    setPlayerMoney={setMoney}
    playerInventory={inventory}
    setPlayerInventory={setInventory}
    // ...prop lainnya sesuai kebutuhan Shop.jsx kamu
  />
)}


{showSlotMachine && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
    onClick={() => setShowSlotMachine(false)}
  >
    <div
  onClick={(e) => e.stopPropagation()}
  style={{
    position: "relative",   // PENTING supaya anak bisa pakai position absolute
    width: 1300,
    height: 800,
    backgroundImage: `url(${mesinImg})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    // hapus flex dan justifyContent/alignItems
    // display: "flex",
    // flexDirection: "column",
    // justifyContent: "center",
    // alignItems: "center",
    paddingTop: 60,
  }}
>
<button
  onClick={() => setShowSlotMachine(false)}
  style={{
    position: "absolute",
    top: "80px",  // Sesuaikan dengan posisi vertikal yang diinginkan
    right: "50px", // Sesuaikan dengan posisi horizontal yang diinginkan
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "rgba(255,0,0,0.7)", // Warna merah untuk testing
    color: "white",
    fontWeight: "bold",
    fontSize: "24px",
    cursor: "pointer",
    zIndex: 10000, // Pastikan di atas semua elemen
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  }}
  aria-label="Close"
>
  ×
</button>
      {/* Kotak angka */}
<div
  style={{
    position: "absolute",
    top: 500,   // sesuaikan jarak dari atas container modal mesin
    left: 520,  // sesuaikan jarak dari kiri container modal mesin
    display: "flex",
    gap: 10,
  }}
>
  {slotNumbers.map((num, i) => (
    <div
      key={i}
      style={{
        width: 60,
        height: 80,
        backgroundColor: "transparent",
        borderRadius: 10,
        fontSize: 48,
        fontWeight: "bold",
        color: "#333",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      {num}
    </div>
  ))}
</div>


      {/* Tombol Start */}
<button
  style={{
    position: "absolute",
    top: 610,
    left: 560,
    padding: "12px 30px",
    fontSize: 20,
    fontWeight: "bold",
    cursor: isSpinning || money < 1000 ? "not-allowed" : "pointer",
    backgroundColor: "transparent",  // transparan tanpa warna background
    border: "none",                  // tanpa border
    color: "#fff",                   // warna tulisan tetap putih (atau sesuaikan)
    userSelect: "none",
  }}
  disabled={isSpinning || money < 1000}
  onClick={startSlot}
>
  {isSpinning ? "Spinning..." : "Start"}
</button>



    </div>
  </div>
)}

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
      
      
    {!inventoryVisible && !showCraftModal && !showEncyclopedia && (
      <>
      <div className="event-panel">
        <p className="event-text">
          {currentZoneName
            ? `🛒 Press Interact to enter ${currentZoneName}`
            : "🔙 Interact to return to Gameplay"}
        </p>
        <button
          className="event-button"
          onClick={() => {
            if (currentZoneName === "Slot Machine" || currentZoneName === "Market") {
              handleInteract();
            } else {
              // Save state before keluar
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
            }
          }}
        >
          {currentZoneName ? "Interact" : "Back to Gameplay"}
        </button>
      </div>

      <div className="analog-controls">
        <div className="analog-up-row">
          <button className="arrow up"
            onMouseDown={() => keysPressed.current.arrowup = true}
            onMouseUp={() => keysPressed.current.arrowup = false}
          >
            <img src={arrowUp} alt="Up" className="arrow-img" />
          </button>
        </div>
        <div className="analog-middle-row">
          <button className="arrow left"
            onMouseDown={() => keysPressed.current.arrowleft = true}
            onMouseUp={() => keysPressed.current.arrowleft = false}
          >
            <img src={arrowLeft} alt="Left" className="arrow-img" />
          </button>
          <div className="arrow-spacer"></div>
          <button className="arrow right"
            onMouseDown={() => keysPressed.current.arrowright = true}
            onMouseUp={() => keysPressed.current.arrowright = false}
          >
            <img src={arrowRight} alt="Right" className="arrow-img" />
          </button>
        </div>
        <div className="analog-down-row">
          <button className="arrow down"
            onMouseDown={() => keysPressed.current.arrowdown = true}
            onMouseUp={() => keysPressed.current.arrowdown = false}
          >
            <img src={arrowDown} alt="Down" className="arrow-img" />
          </button>
        </div>
      </div>


      </>
    )}

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
           <div className="money">
              {money}
              <img src={coinGif} alt="Gold" className="coin-icon" />
            </div>
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


        </div>
      </div>

      <div className="time-display">
        <div className="clock-text">{days[currentDayIndex]}, {formatTime(currentHour, currentMinute)}</div>
      </div>
    </div>
    </>
  );
}