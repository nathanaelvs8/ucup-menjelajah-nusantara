import React, { useEffect, useState, useRef } from "react";
import "./Gameplay.css";
import "./House.css";
import { getGreeting } from "./utils";
import craftingRecipes from "./CraftingRecipes";
import { itemIcons } from "./Inventory.jsx";
import CraftIcon from "../assets/ui/Craft.png";
import { itemDetails } from "./Inventory.jsx";
import Inventory from "./Inventory.jsx";
import Kitchen from "./Kitchen.jsx";
import inventoryIcon from "../assets/ui/Inventory.png";
import homeMap from "../assets/map/Home.jpg";
import blanket from "../assets/ui/blanket.png";
import mandiVideo from "../assets/animation/Mandi.mp4";
import sapuVideo from "../assets/animation/Sapu.mp4";
import chillImage from "../assets/images/chill.webp"; // sesuaikan path jika beda
import chillMusic from "../assets/audio/Chill.mp3"; // sesuaikan path kalau beda
import sapuAudio from "../assets/audio/Nyapu.mp3";
import mandiAudio from "../assets/audio/Mandi.mp3";
import arrowUp from "../assets/ui/ArrowUP.png";
import arrowDown from "../assets/ui/ArrowDOWN.png";
import arrowLeft from "../assets/ui/ArrowLEFT.png";
import arrowRight from "../assets/ui/ArrowRIGHT.png";
import hungryIcon from "../assets/ui/Hunger.png";
import sleepIcon from "../assets/ui/Sleep.png";
import happyIcon from "../assets/ui/Happiness.png";
import cleanIcon from "../assets/ui/Cleanliness.png";
import coinGif from "../assets/ui/MoneyMoney.gif";
import EncyclopediaIcon from "../assets/ui/Encyclopedia.png"; // import icon
import houseMusic from "../assets/audio/house.mp3";



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
  const [showWastafelOptions, setShowWastafelOptions] = useState(false);
  const [showKitchen, setShowKitchen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [showSleepOverlay, setShowSleepOverlay] = useState(false);
  const [isBathing, setIsBathing] = useState(false);
  const [bathStartTime, setBathStartTime] = useState(null);
  const bathIntervalRef = useRef(null);
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepStartTime, setSweepStartTime] = useState(null);
  const sweepIntervalRef = useRef(null);
  const [showChillImage, setShowChillImage] = useState(false);
  const chillAudioRef = useRef(null);
  const sapuAudioRef = useRef(null);
  const mandiAudioRef = useRef(null);
  const [interactionRequested, setInteractionRequested] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [positionLock, setPositionLock] = useState(null); // null = bebas gerak, {x, y} = terkunci
  const [positionBeforeInteract, setPositionBeforeInteract] = useState(null);
  const [isReturningFromSleep, setIsReturningFromSleep] = useState(false);
  const [manualPosition, setManualPosition] = useState(null);
  const happinessIntervalRef = useRef(null);

  const [showCraftModal, setShowCraftModal] = useState(false);

  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [encyclopediaSelected, setEncyclopediaSelected] = useState(null);
  const [discoveredItems, setDiscoveredItems] = useState(() =>
    JSON.parse(localStorage.getItem("discoveredItems") || "[]")
  );
  const houseAudioRef = useRef();

useEffect(() => {
  if (houseAudioRef.current) {
    houseAudioRef.current.volume = 0.6;
    houseAudioRef.current.play().catch(() => {});
  }
}, []);

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

      chillAudioRef.current = new Audio(chillMusic);
  chillAudioRef.current.loop = true;
 sapuAudioRef.current = new Audio(sapuAudio); // ✅ benar
sapuAudioRef.current.loop = false;
mandiAudioRef.current = new Audio(mandiAudio);
mandiAudioRef.current.loop = false;


 }, []);

const isBlocked = (x, y) => {
  // ✅ Saat karakter sedang balik dari tidur, biarkan lewati redzone
  if (isReturningFromSleep) return false;

  const kenaRedZone = blokKhusus.some(zone =>
    x + SPRITE_SIZE > zone.x &&
    x < zone.x + zone.width &&
    y + SPRITE_SIZE > zone.y &&
    y < zone.y + zone.height
  );

 if (isSleeping && kenaRedZone) return true;


  return blockedZones.some(zone =>
    x + SPRITE_SIZE > zone.x &&
    x < zone.x + zone.width &&
    y + SPRITE_SIZE > zone.y &&
    y < zone.y + zone.height
  );
};







  const blockedZones = [
   { x: 120, y: 60, width: 500, height: 300 },//Dapur
  { x: 900, y: 300, width: 500, height: 190 },  // bathtub
 { x: 900, y: 500, width: 500, height: 200 }, // dinding lukisan
   { x: 120, y: 600, width: 100, height: 500 }, // kasur
      { x: 230, y: 800, width: 100, height: 60 }, // lampu tidur
  { x: 900, y: 860, width: 180, height: 130 }, //meja
    { x: 550, y: 60, width: 300, height: 150 }, // pintu
   { x: 900, y: 60, width: 400, height: 150 },//jendela
    { x: 100, y:280, width: 100, height: 300 },// dindig krii sofa
      {x: 120, y: 1100, width: 500, height: 100},//pembatas bawah kir
        {x: 900, y: 1085, width: 500, height: 100},//pembatas bawah kanan
           { x: 1300, y:250, width: 100, height: 300 },// dindig kanan
           { x: 1300, y:650, width: 100, height: 500 },// dindig kanan bawah
            { x: 230, y: 680, width: 400, height: 70 }, // lampu tidur
];

const interactZones = [
  { x: 350, y: 300, width: 100, height: 120, name: "Kitchen" },
  { x: 500, y: 300, width: 100, height: 120, name: "Sink" },
   { x: 900, y: 200, width: 300, height: 120, name: "Bathub" },
   { x: 1000, y: 700, width: 250, height: 120, name: "Picture" },
     { x: 650, y: 850, width: 100, height: 180, name: "Bed" },
      { x: 1200, y: 900, width: 100, height: 100, name: "Sweeper" },
      { x: 700, y: 200, width: 100, height: 120, name: "Door" },

];

const blokKhusus = [
  { x: 500, y: 810, width: 100, height: 300 }, 
  { x: 300, y: 810, width: 100, height: 300 }, 
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
  // Ambil info buff dari localStorage
  const playerData = JSON.parse(localStorage.getItem("playerData") || "{}");
  const playerTime = JSON.parse(localStorage.getItem("playerTime") || "{}");
  const currentDayIndex = playerTime.savedDay ?? 0;

  // Hapus buff jika sudah habis 3 hari
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
if (isInteracting) {
  setIsMoving(false);
  keysPressed.current = {};
  animationId = requestAnimationFrame(update);
  return;
}


  // ...lanjutkan pergerakan seperti biasa
setPosition(prev => {
  if (manualPosition) {
    const pos = manualPosition;
    setManualPosition(null);
    return pos;
  }

  if (isSleeping || positionLock) return prev;

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

  setIsMoving(moved);

  if (!isBlocked(tryX, tryY)) {
    return { x: tryX, y: tryY };
  }
  return prev;
});



  animationId = requestAnimationFrame(update);
};



  // Event listener



 document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

  animationId = requestAnimationFrame(update);

  return () => {
   document.removeEventListener("keydown", handleKeyDown);
document.removeEventListener("keyup", handleKeyUp);

    cancelAnimationFrame(animationId);
  };
}, []);


  const getSpriteOffset = () => {
  if (isSleeping) return "0px 0px"; // ambil frame paling kiri atas
  const directionMap = { down: 0, left: 1, right: 2, up: 3 };
  const row = directionMap[direction];
  const col = isMoving ? Math.floor(Date.now() / 150) % 4 : 0;
  return `-${col * SPRITE_SIZE}px -${row * SPRITE_SIZE}px`;
};

const handleKeyDown = (e) => {
  const key = e.key.toLowerCase();
  keysPressed.current[key] = true;

  if (key === "e") {
    setInteractionRequested(true);
  }
};

const handleKeyUp = (e) => {
  const key = e.key.toLowerCase();
  keysPressed.current[key] = false;
};


  const formatTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
 const handleInteract = () => {
  const zone = interactZones.find(zone =>
    position.x + SPRITE_SIZE > zone.x &&
    position.x < zone.x + zone.width &&
    position.y + SPRITE_SIZE > zone.y &&
    position.y < zone.y + zone.height
  );

  if (zone) {
    if (zone.name === "Door") {
      // Simpan data status dan waktu sebelum pindah halaman
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
      return;
    }
    else if (zone.name === "Sink") {
      setPositionBeforeInteract(position);
setPositionLock(position);
      setIsInteracting(true);
  setShowWastafelOptions(true);
  return;
}
else if (zone.name === "Kitchen"){ 
 setShowKitchen(true);
  setIsInteracting(true);
  return;
}
else if (zone.name === "Bed") {
  setPositionBeforeInteract(position); // simpan posisi semula
  keysPressed.current = {};
  setIsSleeping(true);
  setShowSleepOverlay(true);

  const kasurX = 470;
  const kasurY = 810;
  setPosition({ x: kasurX, y: kasurY }); // pindahkan ke kasur
  setPositionLock({ x: kasurX, y: kasurY }); // kunci posisi

  setTimeout(() => {
    setStatus(prev => ({
      ...prev,
      sleep: Math.min(prev.sleep + 40, 100),
      cleanliness: Math.max(prev.cleanliness - 20, 0)
    }));

    // Update waktu
    const totalMinutes = currentHour * 60 + currentMinute + 480;
    const newHour = Math.floor((totalMinutes % 1440) / 60);
    const newMinute = totalMinutes % 60;
    const newDay = (currentDayIndex + Math.floor(totalMinutes / 1440)) % 7;

    setCurrentHour(newHour);
    setCurrentMinute(newMinute);
    setCurrentDayIndex(newDay);

    // Bangun
    setShowSleepOverlay(false);
    setIsSleeping(false);
    setPositionLock(null); // buka kunci

  if (positionBeforeInteract) {
  setIsReturningFromSleep(true);
  setManualPosition(positionBeforeInteract);
  setTimeout(() => {
    setIsReturningFromSleep(false);
  }, 300); // kasih waktu 300ms buat bisa lewati redzone
}


  }, 2500); // durasi tidur
  return;
}



else if (zone.name === "Bathub") {
  if (mandiAudioRef.current) {
  mandiAudioRef.current.currentTime = 0;
  mandiAudioRef.current.play().catch((err) => {
    console.warn("Mandi audio error:", err);
  });
}
  setIsBathing(true);
  setBathStartTime(Date.now());
  keysPressed.current = {}; // blok input

  let tick = 0;
  bathIntervalRef.current = setInterval(() => {
    setStatus(prev => ({
      ...prev,
      cleanliness: Math.min(prev.cleanliness + 6, 100)
    }));
    tick++;
    if (tick >= 4) {
      clearInterval(bathIntervalRef.current);
      setIsBathing(false);
    }
  }, 1000);

  return;
}

else if (zone.name === "Sweeper") {
   if (sapuAudioRef.current) {
    sapuAudioRef.current.currentTime = 0;
    sapuAudioRef.current.play().catch(err => console.warn("Sapu audio error:", err));
  }

  setIsSweeping(true);
  setSweepStartTime(Date.now());
  keysPressed.current = {};

  let tick = 0;
  sweepIntervalRef.current = setInterval(() => {
    setStatus(prev => ({
      ...prev,
      cleanliness: Math.min(prev.cleanliness + 2, 100),
      happiness: Math.max(prev.happiness - 4, 0)
    }));
    tick++;
    if (tick >= 3) {
      clearInterval(sweepIntervalRef.current);
      setIsSweeping(false);
    }
  }, 1000);

  return;
}
else if (zone.name === "Picture") {
  setIsInteracting(true);
  setPositionBeforeInteract(position);
  setPositionLock(position);
  
  if (chillAudioRef.current) {
    chillAudioRef.current.play().catch((err) => {
      console.warn("Autoplay error:", err);
    });
  }
  setShowChillImage(true);

  // Mulai interval untuk tambah happiness tiap 3 detik
  if (happinessIntervalRef.current) clearInterval(happinessIntervalRef.current);
  happinessIntervalRef.current = setInterval(() => {
    setStatus(prev => ({
      ...prev,
      happiness: Math.min(prev.happiness + 30, 100)
    }));
  }, 3000);

  return;
}



    alert(`You interacted with ${zone.name}`);
  }
};




  const offsetX = Math.min(Math.max(-position.x + window.innerWidth / 2, -(MAP_WIDTH - window.innerWidth)), 0);
  const offsetY = Math.min(Math.max(-position.y + window.innerHeight / 2, -(MAP_HEIGHT - window.innerHeight)), 0);

useEffect(() => {
  if (interactionRequested) {
    handleInteract();
    setInteractionRequested(false);
  }
}, [interactionRequested]);

  return (
    <>
  <audio
    ref={houseAudioRef}
    src={houseMusic}
    autoPlay
    loop
  />
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
    backgroundSize: `${SPRITE_SIZE * 4}px ${SPRITE_SIZE * 4}px`,
    transform: isSleeping ? "rotate(0) scale(1.8)" : "scale(1.8)",
    transformOrigin: "center center",
    position: "absolute",
    zIndex: 10,
  }}
></div>

)}

{isSleeping && (
  <img
    src={blanket}
    alt="Selimut"
    style={{
      position: "absolute",
      left: position.x-40,
      top: position.y+42,
      width: `${SPRITE_SIZE * 2.4}px`,
      height: `${SPRITE_SIZE * 2.4}px`,
      zIndex: 11, // ✅ lebih tinggi dari karakter
      pointerEvents: "none"
    }}
  />
)}

{isBathing && (
  <div className="bath-video-overlay">
    <video src={mandiVideo} autoPlay muted width="100%" height="100%" />
    <button className="skip-button" onClick={() => {
      const elapsed = (Date.now() - bathStartTime) / 1000;
      const remainingSeconds = Math.max(0, 4 - Math.floor(elapsed));
      const extraClean = remainingSeconds * 6;

      setStatus(prev => ({
        ...prev,
        cleanliness: Math.min(prev.cleanliness + extraClean, 100)
      }));
      if (mandiAudioRef.current) {
  mandiAudioRef.current.pause();
  mandiAudioRef.current.currentTime = 0;
}

      clearInterval(bathIntervalRef.current);
      setIsBathing(false);
    }}>
      Skip
    </button>
  </div>
)}

{isSweeping && (
  <div className="bath-video-overlay">
    <video src={sapuVideo} autoPlay muted width="100%" height="100%" />
    <button className="skip-button" onClick={() => {
      const elapsed = (Date.now() - sweepStartTime) / 1000;
      const remainingSeconds = Math.max(0, 3 - Math.floor(elapsed));
      const extra = remainingSeconds * 2;

      setStatus(prev => ({
        ...prev,
        cleanliness: Math.min(prev.cleanliness + extra, 100),
        happiness: Math.max(prev.happiness - extra, 0)
      }));

        if (sapuAudioRef.current) {
    sapuAudioRef.current.pause();
    sapuAudioRef.current.currentTime = 0;
  }

      clearInterval(sweepIntervalRef.current);
      setIsSweeping(false);
    }}>
      Skip
    </button>
  </div>
)}

{isSweeping && (
  <div className="bath-status-bar">
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
)}

{showChillImage && (
  <div className="chill-overlay">
    <img src={chillImage} alt="Chill" className="chill-image" />
   <button className="chill-close-btn" onClick={() => {
  if (chillAudioRef.current) {
    chillAudioRef.current.pause();
    chillAudioRef.current.currentTime = 0;
  }
  setShowChillImage(false);
  setIsInteracting(false);

  if (happinessIntervalRef.current) {
    clearInterval(happinessIntervalRef.current);
    happinessIntervalRef.current = null;
  }
}}>
  ×
</button>

  </div>
)}


{isBathing && (
  <div className="bath-status-bar">
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
)}



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
                        // Jalankan efek dari itemDetails jika ada
                        const details = itemDetails[itemName];
                        if (details && typeof details.useEffect === "function") {
                          setStatus(prev => details.useEffect(prev));
                        }
                        const newInventory = [...inventory];
                        newInventory.splice(idx, 1);
                        setInventory(newInventory);

                        // sync ke localStorage juga status
                        const saved = JSON.parse(localStorage.getItem("playerData")) || {};
                        localStorage.setItem(
                          "playerData",
                          JSON.stringify({ ...saved, inventory: newInventory, status: details && typeof details.useEffect === "function" ? details.useEffect(status) : status })
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
                        // sync ke localStorage juga money
                        const saved = JSON.parse(localStorage.getItem("playerData")) || {};
                        localStorage.setItem(
                          "playerData",
                          JSON.stringify({ ...saved, inventory: newInventory, money: price > 0 ? (saved.money || 0) + price : saved.money })
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


    {!inventoryVisible && !showCraftModal && !showEncyclopedia && (
          <>
          <div className="analog-controls">
          <button
            className="arrow up"
            onMouseDown={() => {
              if (!isSleeping) keysPressed.current.arrowup = true;
            }}
            onMouseUp={() => keysPressed.current.arrowup = false}
          >
            <img src={arrowUp} alt="Up" className="arrow-img" />
          </button>

          <div className="horizontal">
            <button
              className="arrow left"
              onMouseDown={() => {
                if (!isSleeping) keysPressed.current.arrowleft = true;
              }}
              onMouseUp={() => keysPressed.current.arrowleft = false}
            >
              <img src={arrowLeft} alt="Left" className="arrow-img" />
            </button>

            <button
              className="arrow right"
              onMouseDown={() => {
                if (!isSleeping) keysPressed.current.arrowright = true;
              }}
              onMouseUp={() => keysPressed.current.arrowright = false}
            >
              <img src={arrowRight} alt="Right" className="arrow-img" />
            </button>
          </div>

          <button
            className="arrow down"
            onMouseDown={() => {
              if (!isSleeping) keysPressed.current.arrowdown = true;
            }}
            onMouseUp={() => keysPressed.current.arrowdown = false}
          >
            <img src={arrowDown} alt="Down" className="arrow-img" />
          </button>
        </div>



    <div className="event-panel">
    <p className="event-text">
      {
        (() => {
          const zone = interactZones.find(zone =>
            position.x + SPRITE_SIZE > zone.x &&
            position.x < zone.x + zone.width &&
            position.y + SPRITE_SIZE > zone.y &&
            position.y < zone.y + zone.height
          );
          return zone ? `Press button or "E" to interact with ${zone.name}` : "📍 Event info will appear here...";
        })()
      }
    </p>


      <button className="event-button" onClick={handleInteract}>Interact</button>
    </div>
    </>
    )}



      {showWastafelOptions && (
  <div className="popup">
    <div className="popup-content">
      <button className="popup-close" 
    onClick={() => {
          setShowWastafelOptions(false);
          setIsInteracting(false); // ✅ karakter bisa gerak lagi setelah popup ditutup
        }}>×</button>

      <p>💧 SINK</p>
    <button onClick={() => {
      setStatus(prev => ({ ...prev, meal: Math.min(prev.meal + 10, 100) }));
    }}>Drink directly (+10 Meal)</button>

  <button onClick={() => {
    setInventory(prev => {
      const newInv = [...prev, "Water"];
      // Sinkronkan ke localStorage biar scene lain (gameplay) kebaca!
      const saved = JSON.parse(localStorage.getItem("playerData")) || {};
      localStorage.setItem("playerData", JSON.stringify({
        ...saved,
        inventory: newInv,
        status,
        money,
        character
      }));
      return newInv;
    });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  }}>
    Get Water (add inventory)
  </button>



    </div>
  </div>
)}

{showKitchen && (
      <Kitchen
        onClose={() => {
          setShowKitchen(false);
          setIsInteracting(false); // biar bisa gerak lagi
}}
       status={status}
  setStatus={setStatus}
  money={money}
  setMoney={setMoney}
  inventory={inventory}
  setInventory={setInventory}
  />
    )}

{showNotification && (
  <div className="notification">
    ✅ Water has been added to inventory!
  </div>
)}

{showSleepOverlay && (
  <div className="sleep-overlay">
    <div className="sleep-text">🛏️ Sleeping...</div>
  </div>
)}

    </div>
    </>
  );
}
