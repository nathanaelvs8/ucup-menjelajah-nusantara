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
import mesinImg from "../assets/images/mesin.png";

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
  const [showSlotMachine, setShowSlotMachine] = useState(false);
  const [slotNumbers, setSlotNumbers] = useState([5, 5, 6]); // angka awal slot
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
    alert("Gold tidak cukup untuk bermain mesin slot!");
    return;
  }
  
  setIsSpinning(true);
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
    if (zone.name === "Mesin Slot") {
      setShowSlotMachine(true);
    } else {
      alert(`🛒 Interaksi dengan ${zone.name}`);
    }
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
    

        

      </div>

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