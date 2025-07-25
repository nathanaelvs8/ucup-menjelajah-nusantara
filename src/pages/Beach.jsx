import React, { useEffect, useState, useRef } from "react";
import "./Gameplay.css";
import "./Beach.css";

import { getGreeting, addActivity, addNPCInteract } from "./utils";
import { addItemToInventory } from "./utils";
import craftingRecipes from "./CraftingRecipes";
import { itemIcons } from "./Inventory.jsx";
import CraftIcon from "../assets/ui/Craft.png";
import { itemDetails } from "./Inventory.jsx";
import Inventory from './Inventory.jsx'; 
import inventoryIcon from "../assets/ui/Inventory.png";
import beachMap from "../assets/map/Beach.jpg";
import coconutTreeImg from "../assets/map-assets/Beach/Beach_tree_with_coconut.png";
import coconutVideo from "../assets/map-assets/Beach/coconut_fall_animation.mp4";
import coconutIcon from "../assets/inventory-items/Coconut.png";
import rockBg1 from "../assets/map-assets/Beach/Rock_minigame1.jpg";
import rockBg2 from "../assets/map-assets/Beach/Rock_minigame2.jpg";
import rockBg3 from "../assets/map-assets/Beach/Rock_minigame3.jpg";
import rockBg4 from "../assets/map-assets/Beach/Rock_minigame4.jpg";
import pickaxeImg from "../assets/map-assets/Beach/Beach_pickaxe.png";
import arrowUp from "../assets/ui/ArrowUP.png";
import arrowDown from "../assets/ui/ArrowDOWN.png";
import arrowLeft from "../assets/ui/ArrowLEFT.png";
import arrowRight from "../assets/ui/ArrowRIGHT.png";
import ancientGlassImg from "../assets/inventory-items/AncientGlass.png";
import hungryIcon from "../assets/ui/Hunger.png";
import sleepIcon from "../assets/ui/Sleep.png";
import happyIcon from "../assets/ui/Happiness.png";
import cleanIcon from "../assets/ui/Cleanliness.png";
import coinGif from "../assets/ui/MoneyMoney.gif";
import rustyIronIcon from "../assets/inventory-items/RustMetal.png";
import EncyclopediaIcon from "../assets/ui/Encyclopedia.png"; // import icon
import beachMusic from "../assets/audio/beach.mp3";
import beachNPCImg from "../assets/NPC/BeachNPC.png"; // Pastikan path benar




import scrollBanner from "../assets/ui/ScrollObtainedItem.png";


const MAP_WIDTH = 1540;
const MAP_HEIGHT = 1270;
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

  const [inRockZone, setInRockZone] = useState(false);
  const [showRockMinigame, setShowRockMinigame] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gameStage, setGameStage] = useState(1); // 1 = awal, 2 = menengah, 3 = sulit
  const [levelCleared, setLevelCleared] = useState(false); // ✅ buat transisi
  const [levelUp, setLevelUp] = useState(false);
  const [isEndingRockGame, setIsEndingRockGame] = useState(false);
  const [fadeOverlay, setFadeOverlay] = useState(false);

  const [pointerX, setPointerX] = useState(0); // posisi pointer 0–100
  const [targetX, setTargetX] = useState(() => Math.random() * 80 + 10); // posisi target acak di tengah
  const [isPointerFrozen, setIsPointerFrozen] = useState(false);
  const [pickaxeSwinging, setPickaxeSwinging] = useState(false);
  const [showRustyResult, setShowRustyResult] = useState(false);

  const [glassPos, setGlassPos] = useState(null);
  const [nearGlass, setNearGlass] = useState(false);
  const [showGlassResult, setShowGlassResult] = useState(false);
  const debugZones = false;


  const [showCraftModal, setShowCraftModal] = useState(false);

  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [encyclopediaSelected, setEncyclopediaSelected] = useState(null);
  const [discoveredItems, setDiscoveredItems] = useState(() =>
    JSON.parse(localStorage.getItem("discoveredItems") || "[]")
  );

  const [showBeachNPCDialog, setShowBeachNPCDialog] = React.useState(false);
  const [beachNPCDialogState, setBeachNPCDialogState] = React.useState({ stage: 0, textIdx: 0 });

  const [beachNPCPos, setBeachNPCPos] = useState({ x: 500, y: 1100 }); // Edit sesuai posisi NPC di map-mu
  const [nearBeachNPC, setNearBeachNPC] = useState(false);


  const audioRef = useRef();

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



  const isInRestrictedZone = (x, y) => {
    // coconut
    if (x >= 100 && x <= 300 && y >= 650 && y <= 850) return true;
    // rock
    if (x >= 1000 && x <= 1430 && y >= 380 && y <= 710) return true;
    // water
    if (y >= 0 && y <= 170) return true;
    // exit zone
    if (y >= MAP_HEIGHT - SPRITE_SIZE) return true;
    return false;
  };

  const generateGlassPos = () => {
    let x, y;
    do {
      x = Math.floor(Math.random() * (MAP_WIDTH - SPRITE_SIZE));
      y = Math.floor(Math.random() * (MAP_HEIGHT - SPRITE_SIZE));
    } while (isInRestrictedZone(x, y));
    return { x, y };
  };



  const getRockFrame = () => {
    if (gameStage === 1) return rockBg1;
    if (gameStage === 2) return rockBg2;
    if (gameStage === 3) return rockBg3;
    return rockBg4; // final
  };

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
  const playerData = JSON.parse(localStorage.getItem("playerData") || "{}");
  const playerTime = JSON.parse(localStorage.getItem("playerTime") || "{}");
  const currentDayIndex = playerTime.savedDay ?? 0;

  // Hapus buff jika sudah lewat 3 hari
  if (playerData.megalodonBuffUntil !== undefined && playerData.megalodonBuffUntil < currentDayIndex) {
    delete playerData.megalodonBuffUntil;
    localStorage.setItem("playerData", JSON.stringify(playerData));
  }

  // Jika buff masih aktif, status tetap 100
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
    let animationId

    const isInRockZone = (x, y) => {
      return x >= 1200 && x <= 1630 && y >= 500 && y <= 830;
    };

    ;
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

        // ⛏️ Deteksi dulu status rock zone agar tetap bisa set state meski karakter tidak masuk
        const rockStatus = isInRockZone(newPos.x, newPos.y);
        setInRockZone(rockStatus);
        
        if (glassPos) {
          // Titik tengah karakter dan ancient glass
          const charCenterX = newPos.x + SPRITE_SIZE / 2;
          const charCenterY = newPos.y + SPRITE_SIZE / 2;
          const glassCenterX = glassPos.x + 20;
          const glassCenterY = glassPos.y + 20;
          // Lebarkan area deteksi (dari 40 → 60)
          const near = Math.abs(glassCenterX - charCenterX) < 60 && Math.abs(glassCenterY - charCenterY) < 60;
          setNearGlass(near);
        }


        if (isInWater(newPos.x, newPos.y)) return prev;
        if (rockStatus) return prev;


        if (isInWater(newPos.x, newPos.y)) return prev;
        if (rockStatus) return prev;

        setIsMoving(moved);
        setNearExitZone(newPos.y >= MAP_HEIGHT - SPRITE_SIZE);
        setInCoconutZone(
          newPos.x >= 120 && newPos.x <= 320 &&
          newPos.y >= 800 && newPos.y <= 1000
        );
        setInSunbatheZone(
          newPos.x >= 880 && newPos.x <= 1050 &&
          newPos.y >= 240 && newPos.y <= 380
        );



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

  useEffect(() => {
    const x = position.x;
    const y = position.y;
    const sprite = SPRITE_SIZE;
const inRock = x >= 1200 && x <= 1630 && y >= 500 && y <= 830;

    setInRockZone(inRock);
  }, [position]);

 const pointerDir = useRef(1); // arah pointer tetap terjaga (1 = kanan, -1 = kiri)

useEffect(() => {
  if (!showRockMinigame) return;

  const speed = gameStage === 1 ? 1 : gameStage === 2 ? 1.8 : 2.5;

  const interval = setInterval(() => {
    if (!isPointerFrozen) {
      setPointerX(prev => {
        let next = prev + pointerDir.current * speed;

        if (next >= 100 || next <= 0) {
          pointerDir.current *= -1; // ganti arah
          next = Math.max(0, Math.min(100, next));
        }

        return next;
      });
    }
  }, 16);

  return () => clearInterval(interval);
}, [showRockMinigame, gameStage, isPointerFrozen]);



  useEffect(() => {
    if (!levelCleared) return;

    if (gameStage < 3) {
      setGameStage(prev => prev + 1);
      setPointerX(0);
      setTargetX(Math.random() * 80 + 10);
      setLevelCleared(false);
    } else {
      setGameStage(4); // tampilkan frame pecah
      setTimeout(() => {
        setFadeOverlay(true); // ⬅️ fade out
        setTimeout(() => {
          setShowRockMinigame(false);
          setInventory(prev => [...prev, "Rusty Iron"]);
          addActivity("Rock Mining");
          setShowRustyResult(true); // Tampilkan banner!
          setGameStage(1);
          setPointerX(0);
          setTargetX(Math.random() * 80 + 10);
          setFadeOverlay(false);
          setLevelCleared(false);
        }, 1000); // ⬅️ waktu fade hitam sebelum balik
      }, 2000); // ⬅️ waktu tampil frame 4
    }

  }, [levelCleared]);

  useEffect(() => {
    const hasGlass = inventory.includes("Ancient Glass");
    if (!glassPos && !inventory.includes("Ancient Glass")) {
      setGlassPos(generateGlassPos());
    }
  }, [glassPos, inventory]);

  useEffect(() => {
    if (glassPos && position) {
      const charCenterX = position.x + SPRITE_SIZE / 2;
      const charCenterY = position.y + SPRITE_SIZE / 2;
      const glassCenterX = glassPos.x + 20;
      const glassCenterY = glassPos.y + 20;
      const near = Math.abs(glassCenterX - charCenterX) < 60 && Math.abs(glassCenterY - charCenterY) < 60;
      setNearGlass(near);
    } else {
      setNearGlass(false);
    }
  }, [glassPos, position]);



    const getEventText = () => {
    if (nearGlass) return "🍶 Press Interact to collect Ancient Glass";
    if (inSunbatheZone) return "🌞 Press Interact to sunbathe";
    if (inCoconutZone) return "🥥 Press Interact to shake the coconut tree";
    if (inRockZone) return "⛏️ Press Interact to mine the rock";
    if (nearBeachNPC) return "🏝️ Press Interact to talk to Beach Guy";
    if (nearExitZone) return "🔙 Press Interact to return to the main map";
    return "📍 Event info will appear here...";
  };


  const handleInteract = () => {

    if (nearGlass && glassPos) {
      setInventory(prev => {
        const updated = addItemToInventory(prev, "Ancient Glass");
        localStorage.setItem("playerData", JSON.stringify({
          status,
          money,
          inventory: updated,
          character,
          position
        }));
        return updated;
      });

      setGlassPos(null); // hapus dari map
      setShowGlassResult(true); // ⬅️ tampilkan banner
      return;
    }

    if (inSunbatheZone) {
      addActivity("Sunbathe");
      setIsSunbathing(true);
      setSkipRequested(false);
      const isLeft = position.x < 825;
      const targetX = isLeft ? 900 : 940;
      const targetY = 330;
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

    if (inRockZone) {
      setFadeOverlay(true); // ⬅️ aktifkan overlay
      setTimeout(() => {
        setProgress(0);
        setPointerX(0);
        setTargetX(Math.random() * 80 + 10);
        setShowRockMinigame(true);
        setFadeOverlay(false); // ⬅️ hilangkan setelah masuk
      }, 800); // durasi fade
      return;
    }

    if (nearBeachNPC) {
      addNPCInteract("BeachNPC");
      setShowBeachNPCDialog(true);
      setBeachNPCDialogState({ stage: 0, textIdx: 0 });
      return;
    }

    
  if (nearExitZone) {
    // Ambil posisi gameplay sebelum masuk ke Beach
    const lastMainMapPos = JSON.parse(localStorage.getItem("lastGameplayPosition")) || { x: 600, y: 2500 };
    const saved = JSON.parse(localStorage.getItem("playerData")) || {};
    localStorage.setItem("playerData", JSON.stringify({
      ...saved,
      status,
      money,
      inventory,
      position: lastMainMapPos // <- KEMBALIKAN POSISI KE MAIN MAP!
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

  const offsetX = Math.min(Math.max(-(position.x + SPRITE_SIZE / 2) + window.innerWidth / 2, -(MAP_WIDTH - window.innerWidth)), 0);
  const offsetY = Math.min(Math.max(-(position.y + SPRITE_SIZE / 2) + window.innerHeight / 2, -(MAP_HEIGHT - window.innerHeight)), 0);


  const handleAnalog = (key, value) => {
    keysPressed.current[key] = value;
    if (!isSunbathing) keysPressed.current[key] = value;
  };

  const formatTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 1; // atau angka lain (0-1)
      audioRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const dx = position.x + SPRITE_SIZE / 2 - beachNPCPos.x;
    const dy = position.y + SPRITE_SIZE / 2 - beachNPCPos.y;
    setNearBeachNPC(Math.sqrt(dx * dx + dy * dy) < 60); // Radius interaksi
  }, [position]);

  
  return (
    <>
      <audio
        ref={audioRef}
        src={beachMusic}
        autoPlay
        loop
        />
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

      {showRustyResult && (
        <div className="coconut-overlay result">
          <div
            className="obtained-banner"
            style={{ backgroundImage: `url(${scrollBanner})` }}
          >
            <div className="obtained-text">You have obtained</div>
            <img src={rustyIronIcon} alt="Rusty Iron" className="coconut-icon" />
            <div className="item-name">Rusty Iron</div>
            <button className="ok-button" onClick={() => setShowRustyResult(false)}>OK</button>
          </div>
        </div>
      )}


      {showGlassResult && (
        <div className="coconut-overlay result">
          <div
            className="obtained-banner"
            style={{ backgroundImage: `url(${scrollBanner})` }}
          >
            <div className="obtained-text">You have obtained</div>
            <img src={ancientGlassImg} alt="Ancient Glass" className="coconut-icon" />
            <div className="item-name">Ancient Glass</div>
            <button className="ok-button" onClick={() => setShowGlassResult(false)}>OK</button>
          </div>
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
              setInventory(prev => {
                const updated = addItemToInventory(prev, "Coconut");
                localStorage.setItem("playerData", JSON.stringify({
                  status,
                  money,
                  inventory: updated,
                  character,
                  position
                }));
                return updated;
              });
              addActivity("Coconut Minigame"); // baris ini tetap di luar return
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

  {showRockMinigame && (
  <div
    className="rock-minigame-overlay"
    onClick={() => {
      if (gameStage === 4 || isPointerFrozen) return;

      setIsPointerFrozen(true); // ❄️ pointer stop
      setPickaxeSwinging(true); // ⛏️ animasi

      setTimeout(() => setPickaxeSwinging(false), 1000); // hanya 1x ayun
const hitWidth = 15; // atau 8, atau nilai sesuai width bar kamu
const inZone = pointerX >= targetX && pointerX <= targetX + hitWidth;


      setTimeout(() => {
        if (inZone) {
          setLevelCleared(true); // ⏫ lanjut stage
        }
        setIsPointerFrozen(false); // pointer jalan lagi (kalau gagal)
      }, 500);
    }}
  >
    <img src={getRockFrame()} alt="Rock Minigame" className="rock-minigame-background" />

    <img
  src={pickaxeImg}
  alt="Pickaxe"
  className={`rock-pickaxe ${pickaxeSwinging ? 'active' : ''}`}
/>

{gameStage !== 4 && (
  <>
    <div className="rock-bar-container">
      <div
        className="rock-target-zone"
        style={{
          left: `${targetX}%`,
          width: "8%",
        }}
      ></div>

      <div className="rock-moving-pointer" style={{ left: `${pointerX}%` }}></div>
    </div>

    <div className="rock-hit-zone"></div>

    <div className="rock-minigame-bar">
      <div
        className="rock-minigame-bar-fill"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </>
)}

  </div>
)}


    {fadeOverlay && (
      <div className="fade-black"></div>
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

        {/* NPC Beach Guy di map */}
        <img
          src={beachNPCImg}
          alt="Beach Guy"
          style={{
            position: "absolute",
            left: beachNPCPos.x,
            top: beachNPCPos.y,
            width: 64,
            height: 64,
            zIndex: 6,
            filter: nearBeachNPC ? "drop-shadow(0 0 12px #ffe66a)" : "none"
          }}
          draggable={false}
        />


        {debugZones && (
  <div style={{
    position: "absolute",
    left: 1200,
    top: 500,
    width: 430,
    height: 330,
    backgroundColor: "rgba(0, 128, 128, 0.3)", // warna teal transparan
    border: "2px dashed teal",
    zIndex: 5,
    pointerEvents: "none"
  }} />
)}


        {glassPos && (
          <>
            <img
              src={ancientGlassImg}
              alt="Ancient Glass"
              style={{
                position: "absolute",
                left: glassPos.x,
                top: glassPos.y,
                width: 32,
                height: 32,
                zIndex: 4
              }}
            />
            {/* Tambahkan visualisasi hitbox */}
            <div
              className="glass-hitbox"
              style={{
                left: glassPos.x - 4,
                top: glassPos.y - 4
              }}
            ></div>
          </>
        )}

    


{debugZones && (
  <div style={{
    position: "absolute",
    left: 0,
    top: MAP_HEIGHT - SPRITE_SIZE,
    width: MAP_WIDTH,
    height: SPRITE_SIZE,
    backgroundColor: "rgba(0, 0, 255, 0.3)",
    borderTop: "2px dashed blue",
    zIndex: 5,
    pointerEvents: "none"
  }} />
)}



        
        <div className="exit-gradient-zone"></div>

        <div className="water-zone"></div>
        <div className="sunbathe-zone"></div>
        <div className="coconut-zone"></div>
        <div className="rock-zone"></div>
        
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
                    if (e.target === e.currentTarget) {
                      setInventoryVisible(false);
                    }
                  }}
                  style={{
                    background: 'transparent',
                    padding: '20px',
                    maxWidth: '600px',
                    width: '90%',
                    height: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div className="inventory-scroll-area" style={{ flex: 1, overflowY: 'auto' }}>
                    <Inventory
                      inventory={inventory}
                      onUseItem={itemName => {
                        // --- logic sama persis ---
                        const saved = JSON.parse(localStorage.getItem("playerData")) || {};
                        const inv = saved.inventory || [];
                        const idx = inv.findIndex(it => it === itemName);
                        if (idx !== -1) {
                          const details = itemDetails[itemName];
                          let updatedStatus = status;
                          if (details && typeof details.useEffect === "function") {
                            updatedStatus = details.useEffect(status);
                            setStatus(updatedStatus);
                          }
                          const newInventory = [...inv];
                          newInventory.splice(idx, 1);
                          setInventory(newInventory);
                          localStorage.setItem(
                            "playerData",
                            JSON.stringify({ ...saved, inventory: newInventory, status: updatedStatus })
                          );
                        }
                      }}
                      onSellItem={itemName => {
                        const saved = JSON.parse(localStorage.getItem("playerData")) || {};
                        const inv = saved.inventory || [];
                        const idx = inv.findIndex(it => it === itemName);
                        if (idx !== -1) {
                          const details = itemDetails[itemName];
                          const price = details?.sellGold || 0;
                          if (price > 0) {
                            setMoney(prev => prev + price);
                          } else {
                            alert("Item cannot be sold!");
                          }
                          const newInventory = [...inv];
                          newInventory.splice(idx, 1);
                          setInventory(newInventory);
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




      <div className="event-panel">
        <p className="event-text">{getEventText()}</p>
        <button className="event-button" onClick={handleInteract}>Interact</button>
      </div>
    </>
    )}


    // Render (mirip render panel lain)
    {showBeachNPCDialog && (
      <div className="coconut-overlay" style={{ background: "rgba(0,0,0,0.87)", zIndex: 350 }}>
        <BeachNPCDialogPanel
          state={beachNPCDialogState}
          setState={setBeachNPCDialogState}
          setShowDialog={setShowBeachNPCDialog}
          characterSprite={character?.sprite}
          username={username}
        />
      </div>
    )}
    </div>
    </>
  );
}

function BeachNPCDialogPanel({
  state, setState, setShowDialog, characterSprite, username
}) {
  // === SCRIPT DIALOG
  const dialogScript = [
    // AWAL INTERAKSI (pilihan)
    [
      { npc: "Hey there, welcome to the beach! Great weather today, huh? You can almost smell the salt in the air." },
      { npc: "I come here almost every day, just to feel the breeze and listen to the waves." },
      { npc: "Not many people take the time to really look around, you know. Sometimes, the beach has secrets for those who pay attention." },
      { choice: true }
    ],
    // COOL BEACH!
    [
      { player: "Cool beach!" },
      { npc: "You bet! This place is my paradise." },
      { npc: "But did you know, people say there’s an ancient cup hidden somewhere under the sand?" },
      { player: "Like, a real treasure?" },
      { npc: "Kind of a local legend. Nobody I know has actually found it." },
      { npc: "If you feel lucky, why not give it a try? You never know what you’ll find." },
      { npc: "Good luck finding that ancient cup. Who knows, maybe you’ll be the first!" },
      { loop: true }
    ],
    // SECRETS?
    [
      { player: "You said something about secrets?" },
      { npc: "Absolutely, dude! There’s a rumor of an ancient cup buried near the big rock by the shore." },
      { player: "Really? Has anyone ever found it?" },
      { npc: "Some dig for it, but no one I’ve met succeeded. If you’ve got sharp eyes, maybe you’ll uncover it." },
      { npc: "Don’t be afraid to explore. Sometimes, the beach rewards the curious." },
      { loop: true }
    ],
    // NEVERMIND
    [
      { player: "Nevermind." },
      { npc: "No worries! Just chill and enjoy the beach." },
      { npc: "If you ever want to talk or need some tips, I’m always here." },
      { end: true }
    ]
  ];

  const choices = [
    "Cool beach!",
    "Secrets?",
    "Nevermind."
  ];

  const [shownText, setShownText] = React.useState("");
  const textDone = React.useRef(true);

  // Dialog data
  const d = dialogScript[state.stage][state.textIdx];

  React.useEffect(() => {
    setShownText("");
    textDone.current = false;
    if (!d) return;
    let idx = 0;
    function type() {
      setShownText(d.npc?.slice(0, idx) || d.player?.slice(0, idx) || "");
      if (idx < (d.npc?.length || d.player?.length || 0)) {
        idx++;
        setTimeout(type, 17 + Math.random() * 13);
      } else {
        textDone.current = true;
      }
    }
    type();
  }, [state.stage, state.textIdx]);

  function handleDialogClick() {
    if (!textDone.current) {
      setShownText(d.npc || d.player || "");
      textDone.current = true;
      return;
    }
    // Jika ada pilihan, tidak lanjut tap (harus pilih)
    if (d?.choice) return;

    // Loop kembali ke awal dialog setelah selesai (kecuali Nevermind)
    if (d?.loop) {
      setState({ stage: 0, textIdx: 3 }); // kembali ke panel pilihan
      return;
    }
    // Tutup jika end
    if (d?.end) {
      setShowDialog(false);
      return;
    }
    // Lanjut baris berikutnya
    if (state.textIdx < dialogScript[state.stage].length - 1) {
      setState({ ...state, textIdx: state.textIdx + 1 });
    }
  }

  // Render panel pilihan (choice)
  if (state.stage === 0 && d?.choice) {
    return (
      <div className="npc-dialog-panel" style={{
        display: "flex", width: 740, height: 320,
        background: "rgba(0,0,0,0.87)", borderRadius: 32, alignItems: "center", boxShadow: "0 3px 60px #000a"
      }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={beachNPCImg} alt="Beach NPC" style={{ width: 165, height: 165, objectFit: "contain" }} />
        </div>
        <div style={{ flex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 22, color: "#ffe69c", margin: "12px 0 16px" }}>What do you want to talk about?</div>
          {choices.map((ch, i) => (
            <button key={i}
              className="event-button"
              style={{ fontSize: 17, marginBottom: 7, width: 320 }}
              onClick={() => setState({ stage: i + 1, textIdx: 0 })}>
              {ch}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: 165, height: 165, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="player-dialog-sprite" style={{
              width: 32, height: 32,
              background: `url(${characterSprite})`,
              backgroundPosition: "0px 0px",
              backgroundSize: "128px 128px",
              imageRendering: "pixelated",
              transform: "scale(5.15625)",
              transformOrigin: "center"
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Render dialog branch/baris dialog biasa
  return (
    <div
      className="npc-dialog-panel"
      style={{
        display: "flex",
        width: 740,
        height: 320,
        background: "rgba(0,0,0,0.89)",
        borderRadius: 32,
        alignItems: "center",
        boxShadow: "0 3px 60px #000a",
        cursor: "pointer",
        userSelect: "none"
      }}
      onClick={handleDialogClick}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <img src={beachNPCImg} alt="Beach NPC" style={{ width: 165, height: 165, objectFit: "contain" }} />
        <div style={{ color: "#ffecb0", fontSize: 15, marginTop: 8, opacity: 0.82 }}>Beach Guy</div>
      </div>
      <div style={{ flex: 2.1, minHeight: 60, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {d.npc ? (
          <div style={{
            background: "rgba(70,50,10,0.18)",
            borderRadius: 14,
            fontSize: 19,
            color: "#ffeec9",
            padding: "23px 26px",
            margin: "0 6px",
            fontFamily: "inherit",
            textAlign: "left"
          }}>
            <b style={{ color: "#ffe69c", fontSize: 17 }}>Beach Guy</b>
            <span style={{ display: "block", marginTop: 4 }}>{shownText}</span>
            {!textDone.current && <span className="writing-cursor" style={{ color: "#ffd868", fontWeight: "bold", marginLeft: 1 }}>|</span>}
          </div>
        ) : (
          <div style={{
            background: "rgba(70,50,10,0.18)",
            borderRadius: 14,
            fontSize: 19,
            color: "#aaf4fd",
            padding: "23px 26px",
            margin: "0 6px",
            fontFamily: "inherit",
            textAlign: "right"
          }}>
            <b style={{ color: "#aaf4fd", fontSize: 17 }}>{username}</b>
            <span style={{ display: "block", marginTop: 4 }}>{shownText}</span>
            {!textDone.current && <span className="writing-cursor" style={{ color: "#ffd868", fontWeight: "bold", marginLeft: 1 }}>|</span>}
          </div>
        )}
        <div style={{ fontSize: 12, color: "#e6d9a7", margin: "10px 0 0 8px" }}>Click to continue…</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 165, height: 165, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="player-dialog-sprite" style={{
            width: 32, height: 32,
            background: `url(${characterSprite})`,
            backgroundPosition: "0px 0px",
            backgroundSize: "128px 128px",
            imageRendering: "pixelated",
            transform: "scale(5.15625)",
            transformOrigin: "center"
          }}></div>
        </div>
        <div style={{ color: "#a4f1fd", fontSize: 15, marginTop: 8, opacity: 0.81 }}>{username}</div>
      </div>
    </div>
  );
}