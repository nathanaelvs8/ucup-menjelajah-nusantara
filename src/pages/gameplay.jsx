import React, { useEffect, useState, useRef } from "react";
import "./Gameplay.css";
import { getGreeting } from "./utils";
import craftingRecipes from "./craftingRecipes";
import { itemIcons } from "./Inventory.jsx";
import { itemDetails } from "./Inventory.jsx";
import Inventory from './Inventory.jsx';  // pastikan path benar
import inventoryIcon from "../assets/ui/Inventory.png"; // pastikan path sudah benar<button
import CraftIcon from "../assets/ui/Craft.png";
import mapImage from "../assets/map/Main.jpg";
import mainMapImage from "../assets/map/MainMap.jpg";
import mapIcon from "../assets/ui/Map.png";
import arrowUp from "../assets/ui/ArrowUP.png";
import arrowDown from "../assets/ui/ArrowDOWN.png";
import arrowLeft from "../assets/ui/ArrowLEFT.png";
import arrowRight from "../assets/ui/ArrowRight.png";
import gameplayAudio from "../assets/audio/gameplayaudio.mp3";
import hungryIcon from "../assets/ui/Hunger.png";
import sleepIcon from "../assets/ui/Sleep.png";
import happyIcon from "../assets/ui/Happiness.png";
import cleanIcon from "../assets/ui/Cleanliness.png";
import EncyclopediaIcon from "../assets/ui/Encyclopedia.png";

const MAP_WIDTH = 4616;
const MAP_HEIGHT = 3464;
const SPRITE_SIZE = 64;
const MINUTE_PER_REAL_SECOND = 4; // 1 detik = 4 menit in-game
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];



// Helper untuk discovered items
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

  const [showCraftModal, setShowCraftModal] = useState(false);
  const [craftingItem, setCraftingItem] = useState(null); // optional untuk animasi loading/craft

  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [encyclopediaSelected, setEncyclopediaSelected] = useState(null);
  const [discoveredItems, setDiscoveredItems] = useState(getDiscoveredItems());

  const [nearCloth, setNearCloth] = useState(false);


  const riverZones = [
    { x: 2990, y: 2080, w: 120, h: 50 },
    { x: 2920, y: 2130, w: 150, h: 50 },
    { x: 2860, y: 2180, w: 120, h: 30 },
    { x: 2730, y: 2310, w: 95,  h: 70 },
    { x: 2630, y: 2380, w: 130, h: 100 },
    { x: 2560, y: 2480, w: 140, h: 100 },
    { x: 2510, y: 2580, w: 130, h: 100 },
    { x: 2450, y: 2680, w: 110, h: 50 },
    { x: 2390, y: 2830, w: 80,  h: 100 },
    { x: 2350, y: 2930, w: 80,  h: 100 },
    { x: 2320, y: 3030, w: 80,  h: 100 },
    { x: 2300, y: 3130, w: 80,  h: 100 },
    { x: 2270, y: 3230, w: 80,  h: 100 },
    { x: 2250, y: 3330, w: 80,  h: 200 }
  ];

  const [clothPos, setClothPos] = useState(() => {
    // Cek apakah sudah pernah diambil, jika ya: null
    //const alreadyGot = JSON.parse(localStorage.getItem("gotRippedCloth"));
    //if (alreadyGot) return null;

    // Fungsi validasi spawn
    function isInBlockedZone(x, y) {
      // Cek semua zone, harus sama logika collision-mu
      // (pake area tengah bawah karakter biar adil)
      const charSize = 64;
      // Cek riverZones
      const inRiver = riverZones.some(zone =>
        x + charSize/2 >= zone.x && x + charSize/2 <= zone.x + zone.w &&
        y + charSize >= zone.y && y + charSize <= zone.y + zone.h
      );
      // Ocean block, bottom block, triangle
      const inBottom = x + charSize/2 >= 0 && x + charSize/2 <= 2316 &&
                      y + charSize >= 3150 && y + charSize <= 3554;
      const inRect1 = x + charSize/2 >= 1500 && x + charSize/2 <= 5000 && y + charSize >= 0 && y + charSize <= 350;
      const inRect2 = x + charSize/2 >= 2970 && x + charSize/2 <= 4670 && y + charSize >= 350 && y + charSize <= 1300;
      const inRect3 = x + charSize/2 >= 3080 && x + charSize/2 <= 4680 && y + charSize >= 1300 && y + charSize <= 2100;
      const inTri1 = (x + charSize/2 >= 2920 && x + charSize/2 <= 4920 && y + charSize >= 2100 && y + charSize <= 4100
        && y + charSize < ((2000/2000) * ((x + charSize/2) - 2920) + 2100));
      // Tambah zone lain kalau perlu
      return inRiver || inBottom || inRect1 || inRect2 || inRect3 || inTri1;
    }

    let x, y, tryCount = 0;
    do {
      x = Math.floor(Math.random() * (MAP_WIDTH - SPRITE_SIZE));
      y = Math.floor(Math.random() * (MAP_HEIGHT - SPRITE_SIZE));
      tryCount++;
      if (tryCount > 1000) break; // jaga2 infinite loop
    } while (isInBlockedZone(x, y));
    return { x, y };
  });


  const audioRef = useRef(null);

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


  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.6;  // atur volume jika perlu
      audioRef.current.loop = true;   // agar musik looping terus
      audioRef.current.play().catch(e => {
        // bisa gagal autoplay di browser karena kebijakan user gesture
        console.log("Audio play failed:", e);
      });
    }
  }, []);

  // Fungsi untuk handle use item dari komponen Inventory
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

  // Fungsi untuk handle sell item dari komponen Inventory
  const handleSellItem = (itemName) => {
    const itemIndex = inventory.findIndex(item => item === itemName);
    if (itemIndex === -1) return;

    const price = itemDetails[itemName]?.sellGold || 0;
    if (price <= 0) {
      alert(`Cannot sell ${itemName}`);
      return;
    }

    alert(`Sold ${itemName} for ${price} gold.`);
    
    // Remove item dan tambah money
    const newInventory = [...inventory];
    newInventory.splice(itemIndex, 1);
    setInventory(newInventory);
    setMoney(prev => prev + price);
  };

  function savePlayerData(inv, mon, stat) {
    const playerDataRaw = localStorage.getItem("playerData");
    let playerData = playerDataRaw ? JSON.parse(playerDataRaw) : {};
    playerData.inventory = inv;
    playerData.money = mon;
    playerData.status = stat;
    localStorage.setItem("playerData", JSON.stringify(playerData));
  }


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


      const charSize = 64; // ukuran karakter

      const inRiver = riverZones.some(zone => {
        // Cek keempat sudut karakter, bisa juga cek bagian bawah tengah agar lebih natural
        const charPoints = [
          // pojok kiri atas
          { x: newPos.x, y: newPos.y },
          // pojok kanan atas
          { x: newPos.x + charSize, y: newPos.y },
          // pojok kiri bawah
          { x: newPos.x, y: newPos.y + charSize },
          // pojok kanan bawah
          { x: newPos.x + charSize, y: newPos.y + charSize },
          // titik tengah bawah (penting buat RPG logic!)
          { x: newPos.x + charSize / 2, y: newPos.y + charSize }
        ];
        return charPoints.some(pt =>
          pt.x >= zone.x &&
          pt.x <= zone.x + zone.w &&
          pt.y >= zone.y &&
          pt.y <= zone.y + zone.h
        );
      });

        const inForest =
          newPos.x >= 0 && newPos.x <= 900 &&
          newPos.y >= 0 && newPos.y <= 1250;

        const inBottomBlock =
          newPos.x >= 0 &&
          newPos.x <= 2316 &&
          newPos.y >= 3150 &&
          newPos.y <= 3554;

        // Ocean block 1
        const inRect1 = (
          newPos.x >= 1500 && newPos.x <= 1500 + 3500 &&
          newPos.y >= 0 && newPos.y <= 0 + 350
        );

        // Ocean block 2
        // Persegi kedua (geser ke kiri 30px)
        const inRect2 = (
          newPos.x >= 2970 && newPos.x <= 2970 + 1700 &&
          newPos.y >= 350 && newPos.y <= 350 + 950
        );

        // Persegi ketiga (geser ke kiri 30px)
        const inRect3 = (
          newPos.x >= 3080 && newPos.x <= 3080 + 1600 &&
          newPos.y >= 1300 && newPos.y <= 1300 + 800
        );


        // Ocean triangle 1
        const inTri1 = (
          newPos.x >= 2920 && newPos.x <= 2920 + 2000 &&
          newPos.y >= 2100 && newPos.y <= 2100 + 2000 &&
          // Clip-path segitiga polygon(100% 0, 100% 100%, 0 0)
          // Artinya: y < kemiringan garis dari pojok kanan atas ke bawah kiri
          // Cek: y < slope * (x - left) + top
          newPos.y < ((2000/2000) * (newPos.x - 2920) + 2100) // Slope = height/width
        );




        if (!insideLake && !inMountain && !inRiver && !inForest && !inBottomBlock && !inRect1 &&!inRect2 && !inRect3 && !inTri1) {
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

  useEffect(() => {
    savePlayerData(inventory, money, status);
  }, [inventory, money, status]);

  useEffect(() => {
    function syncDiscovered() {
      setDiscoveredItems(getDiscoveredItems());
    }
    window.addEventListener('storage', syncDiscovered);
    return () => window.removeEventListener('storage', syncDiscovered);
  }, []);

  useEffect(() => {
    if (!clothPos) {
      setNearCloth(false); // <--- ini penting!
      return;
    }
    const charCenterX = position.x + SPRITE_SIZE / 2;
    const charCenterY = position.y + SPRITE_SIZE / 2;
    const itemCenterX = clothPos.x + 20;
    const itemCenterY = clothPos.y + 20;
    const near = Math.abs(charCenterX - itemCenterX) < 36 && Math.abs(charCenterY - itemCenterY) < 36;
    setNearCloth(near);
  }, [position, clothPos]);

  useEffect(() => {
    // Jika inventory tidak punya ripped cloth dan clothPos belum ada, spawn lagi!
    if (!inventory.includes("Ripped Cloth") && !clothPos) {
      // SPAWN ULANG, logic sama seperti awal
      function isInBlockedZone(x, y) {
        const charSize = 64;
        const inRiver = riverZones.some(zone =>
          x + charSize/2 >= zone.x && x + charSize/2 <= zone.x + zone.w &&
          y + charSize >= zone.y && y + charSize <= zone.y + zone.h
        );
        const inBottom = x + charSize/2 >= 0 && x + charSize/2 <= 2316 &&
                        y + charSize >= 3150 && y + charSize <= 3554;
        const inRect1 = x + charSize/2 >= 1500 && x + charSize/2 <= 5000 && y + charSize >= 0 && y + charSize <= 350;
        const inRect2 = x + charSize/2 >= 2970 && x + charSize/2 <= 4670 && y + charSize >= 350 && y + charSize <= 1300;
        const inRect3 = x + charSize/2 >= 3080 && x + charSize/2 <= 4680 && y + charSize >= 1300 && y + charSize <= 2100;
        const inTri1 = (x + charSize/2 >= 2920 && x + charSize/2 <= 4920 && y + charSize >= 2100 && y + charSize <= 4100
          && y + charSize < ((2000/2000) * ((x + charSize/2) - 2920) + 2100));
        return inRiver || inBottom || inRect1 || inRect2 || inRect3 || inTri1;
      }

      let x, y, tryCount = 0;
      do {
        x = Math.floor(Math.random() * (MAP_WIDTH - SPRITE_SIZE));
        y = Math.floor(Math.random() * (MAP_HEIGHT - SPRITE_SIZE));
        tryCount++;
        if (tryCount > 1000) break;
      } while (isInBlockedZone(x, y));
      setClothPos({ x, y });
    }
  }, [inventory, clothPos]);


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
    // Ambil ripped cloth jika di dekat item
    if (nearCloth && clothPos) {
      setInventory(inv => {
        const newInv = [...inv, "Ripped Cloth"];
        localStorage.setItem("playerData", JSON.stringify({
          character, position, status, money, inventory: newInv
        }));
        return newInv;
      });
      setClothPos(null);
      addDiscoveredItem("Ripped Cloth");
      setDiscoveredItems(getDiscoveredItems()); // <-- Tambahkan baris ini
      return;
    }

    // Simpan data player seperti biasa
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
      // Simpan posisi terakhir di main map sebelum masuk beach
      localStorage.setItem("lastGameplayPosition", JSON.stringify(position));
      // JANGAN overwrite playerData.position di sini!
      window.location.href = "/beach";
    } else if (inMarketZone) {
      window.location.href = "/market";
    } else if (nearForestZone) {
      // Simpan posisi terakhir sebelum masuk forest
      localStorage.setItem("lastGameplayPosition", JSON.stringify(position));
      window.location.href = "/forest";
    } 
  };

return (
  <div className="viewport">
    <audio ref={audioRef} src={gameplayAudio} />
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
      <div className="bottom-black-zone"></div>
      <div className="bottom-block-zone"></div>
      <div className="rect-block-zone ocean-block-1"></div>
      <div className="rect-block-zone ocean-block-2"></div>
      <div className="rect-block-zone ocean-block-3"></div>
      <div className="tri-block-zone ocean-tri-1"></div>

      {clothPos && (
        <img
          src={itemIcons["Ripped Cloth"]}
          alt="Ripped Cloth"
          className="map-item"
          style={{
            position: "absolute",
            left: clothPos.x,
            top: clothPos.y,
            width: 40,
            height: 40,
            zIndex: 12
          }}
        />
      )}

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


      </div>

    </div>

    {/* Inventory Modal DAN Overlay - TAMPIL kalau inventoryVisible */}
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


    {/* Semua UI bawah, panel event, analog, map, dsb HANYA tampil kalau inventory tidak terbuka */}
    {!inventoryVisible && !showCraftModal && !showEncyclopedia && (
      <>
        <div className="analog-controls">
          <button className="arrow up"
            onMouseDown={() => handleAnalog("arrowup", true)}
            onMouseUp={() => handleAnalog("arrowup", false)}
            onTouchStart={() => handleAnalog("arrowup", true)}
            onTouchEnd={() => handleAnalog("arrowup", false)}
          >
            <img src={arrowUp} alt="Up" className="arrow-img" />
          </button>

          <div className="horizontal">
            <button className="arrow left"
              onMouseDown={() => handleAnalog("arrowleft", true)}
              onMouseUp={() => handleAnalog("arrowleft", false)}
              onTouchStart={() => handleAnalog("arrowleft", true)}
              onTouchEnd={() => handleAnalog("arrowleft", false)}
            >
              <img src={arrowLeft} alt="Left" className="arrow-img" />
            </button>

            <button className="arrow right"
              onMouseDown={() => handleAnalog("arrowright", true)}
              onMouseUp={() => handleAnalog("arrowright", false)}
              onTouchStart={() => handleAnalog("arrowright", true)}
              onTouchEnd={() => handleAnalog("arrowright", false)}
            >
              <img src={arrowRight} alt="Right" className="arrow-img" />
            </button>
          </div>

          <button className="arrow down"
            onMouseDown={() => handleAnalog("arrowdown", true)}
            onMouseUp={() => handleAnalog("arrowdown", false)}
            onTouchStart={() => handleAnalog("arrowdown", true)}
            onTouchEnd={() => handleAnalog("arrowdown", false)}
          >
            <img src={arrowDown} alt="Down" className="arrow-img" />
          </button>
        </div>

        <div className="event-panel">
          <p className="event-text">
            {nearCloth
              ? "🧣 Press Interact to collect Ripped Cloth"
              : inHouseZone
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
      </>
    )}

    {/* Overlay map tetap di luar kondisi */}
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
)
}