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
import scrollBanner from "../assets/ui/ScrollObtainedItem.png";
import houseNPCImg from "../assets/NPC/HouseNPC.png"; // path disesuaikan dengan struktur project kamu
import lakeNPCImg from "../assets/NPC/LakeNPC.png"; // ganti ke path gambar NPC kamu
import mountainNPCImg from "../assets/NPC/MountainNPC.png"; // ganti path sesuai aset


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
  const [showClothBanner, setShowClothBanner] = useState(false);

  const [showHouseNPCDialog, setShowHouseNPCDialog] = useState(false);
  const [npcDialogState, setNPCDialogState] = useState({ stage: 0, textIdx: 0 });

  const houseNPCPos = { x: 625, y: 2460 }; // Sesuaikan posisinya di map
  const [nearHouseNPC, setNearHouseNPC] = useState(false);

  useEffect(() => {
    // Hitung jarak char ke NPC
    const dx = position.x + SPRITE_SIZE / 2 - houseNPCPos.x;
    const dy = position.y + SPRITE_SIZE / 2 - houseNPCPos.y;
    setNearHouseNPC(Math.sqrt(dx * dx + dy * dy) < 60); // Radius interaksi
  }, [position]);

  const lakeNPCPos = { x: 600, y: 1910 }; // Contoh, geser sesuai posisi di map-mu
  const [showLakeNPCDialog, setShowLakeNPCDialog] = useState(false);
  const [lakeDialogState, setLakeDialogState] = useState({ stage: 0, textIdx: 0 });
  const [nearLakeNPC, setNearLakeNPC] = useState(false);

  useEffect(() => {
    const dx = position.x + SPRITE_SIZE / 2 - lakeNPCPos.x;
    const dy = position.y + SPRITE_SIZE / 2 - lakeNPCPos.y;
    setNearLakeNPC(Math.sqrt(dx * dx + dy * dy) < 60);
  }, [position]);

  const mountainNPCPos = { x: 1670, y: 1810 }; // bawah gunung, edit sesuai map kamu
  const [showMountainNPCDialog, setShowMountainNPCDialog] = useState(false);
  const [mountainDialogState, setMountainDialogState] = useState({ stage: 0, textIdx: 0, followUp: false });
  const [nearMountainNPC, setNearMountainNPC] = useState(false);

  const [lakeRodNotif, setLakeRodNotif] = useState(false);
  const [lakeRodNotifFade, setLakeRodNotifFade] = useState(false);


  useEffect(() => {
    const dx = position.x + SPRITE_SIZE / 2 - mountainNPCPos.x;
    const dy = position.y + SPRITE_SIZE / 2 - mountainNPCPos.y;
    setNearMountainNPC(Math.sqrt(dx * dx + dy * dy) < 64);
  }, [position]);

  // Tambah di state Gameplay.jsx
  const [atMysticShore, setAtMysticShore] = useState(false);

  // Tambah di useEffect([position]) di bawah setNearForestZone:
  useEffect(() => {
    // ... logic lain
    const atMystic = (
      position.x >= 3500 && position.x <= 3700 && // X range
      position.y >= 3300 && position.y <= 3440   // Y range
    );
    setAtMysticShore(atMystic);
  }, [position]);


  const [mysticNotif, setMysticNotif] = useState(false);
  const [mysticNotifFade, setMysticNotifFade] = useState(false);



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

  useEffect(() => {
    const atMystic =
      position.x + SPRITE_SIZE / 2 >= 3000 &&
      position.x + SPRITE_SIZE / 2 <= 3100 &&
      position.y + SPRITE_SIZE / 2 >= 1300 &&
      position.y + SPRITE_SIZE / 2 <= 1380;
    setAtMysticShore(atMystic);
  }, [position]);

  const getSpriteOffset = () => {
    const directionMap = { down: 0, left: 1, right: 2, up: 3 };
    const row = directionMap[direction];
    const col = isMoving ? Math.floor(Date.now() / 150) % 4 : 1;
    return `-${col * SPRITE_SIZE}px -${row * SPRITE_SIZE}px`;
  };

  const offsetX = Math.min(Math.max(-(position.x + SPRITE_SIZE / 2) + window.innerWidth / 2, -(MAP_WIDTH - window.innerWidth)), 0);
  const offsetY = Math.min(Math.max(-(position.y + SPRITE_SIZE / 2) + window.innerHeight / 2, -(MAP_HEIGHT - window.innerHeight)), 0);

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
      setDiscoveredItems(getDiscoveredItems()); // <-- Sudah ada
      // TAMBAHKAN INI:
      setShowClothBanner(true);
      return;
    }

    if (nearHouseNPC) {
      setShowHouseNPCDialog(true);
      setNPCDialogState({ stage: 0, textIdx: 0 });
      return;
    }

    if (nearLakeNPC) {
      setShowLakeNPCDialog(true);
      setLakeDialogState({ stage: 0, textIdx: 0 });
      return;
    }

    if (nearMountainNPC) {
      setShowMountainNPCDialog(true);
      setMountainDialogState({ stage: 0, textIdx: 0, followUp: false });
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
      if (inventory.includes("Rod")) {
        window.location.href = "/fishing";
      } else {
        setLakeRodNotif(true);
        setLakeRodNotifFade(false);
        setTimeout(() => setLakeRodNotifFade(true), 2000); // mulai fade setelah 2 detik
        setTimeout(() => setLakeRodNotif(false), 2500); // hapus dari DOM setelah fade
      }
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
    } else if (atMysticShore) {
      if (inventory.includes("Boat")) {
        // Simpan data jika mau
        window.location.href = "/secret"; // atau "/Secret" sesuai routing-mu
      } else {
        setMysticNotif(true);
        setMysticNotifFade(false);
        setTimeout(() => setMysticNotifFade(true), 2000);
        setTimeout(() => setMysticNotif(false), 2500);
      }
      return;
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

        {/* NPC di depan rumah */}
      <img
        src={houseNPCImg}
        alt="House NPC"
        className="map-npc"
        style={{
          position: "absolute",
          left: houseNPCPos.x,
          top: houseNPCPos.y,
          width: 64,
          height: 64,
          zIndex: 9,
          imageRendering: "pixelated",
          filter: showHouseNPCDialog ? "brightness(0.7)" : "none",
          transition: "filter 0.2s"
        }}
        draggable={false}
      />

      <img
        src={lakeNPCImg}
        alt="Lake NPC"
        className="map-npc"
        style={{
          position: "absolute",
          left: lakeNPCPos.x,
          top: lakeNPCPos.y,
          width: 64,
          height: 64,
          zIndex: nearLakeNPC ? 7 : 11,
          imageRendering: "pixelated",
          filter: showLakeNPCDialog ? "brightness(0.7)" : "none",
          transition: "filter 0.2s"
        }}
        draggable={false}
      />

      <img
        src={mountainNPCImg}
        alt="Mountain NPC"
        className={`map-npc mountain-floating`}
        style={{
          position: "absolute",
          left: mountainNPCPos.x,
          top: mountainNPCPos.y,
          width: 64,
          height: 64,
          zIndex: nearMountainNPC ? 7 : 11,
          imageRendering: "pixelated",
          filter: showMountainNPCDialog ? "brightness(0.7)" : "none",
          transition: "filter 0.2s"
        }}
        draggable={false}
      />



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
      <div className="mystic-shore-zone"></div>


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

    {showClothBanner && (
      <div className="coconut-overlay result">
        <div className="obtained-banner" style={{ backgroundImage: `url(${scrollBanner})` }}>
          <div className="obtained-text">You found Ripped Cloth!</div>
          <img src={itemIcons["Ripped Cloth"]} alt="Ripped Cloth" className="coconut-icon" />
          <div className="item-name">Ripped Cloth</div>
          <button className="ok-button" onClick={() => setShowClothBanner(false)}>OK</button>
        </div>
      </div>
    )}

    {mysticNotif && (
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 110,
          transform: "translateX(-50%)",
          fontSize: 21,
          color: "#ff4545",
          fontWeight: "bold",
          textShadow: "1px 2px 8px #000, 0 0 14px #0008",
          zIndex: 3000,
          pointerEvents: "none",
          opacity: mysticNotifFade ? 0 : 1,
          transition: "opacity 0.42s",
          userSelect: "none",
          background: "none"
        }}
      >
        You need a boat to cross the sea!
      </div>
    )}


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
    
    {lakeRodNotif && (
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 110,
          transform: "translateX(-50%)",
          fontSize: 21,
          color: "#ff4545",
          fontWeight: "bold",
          textShadow: "1px 2px 8px #000, 0 0 14px #0008",
          zIndex: 3000,
          pointerEvents: "none",
          opacity: lakeRodNotifFade ? 0 : 1,
          transition: "opacity 0.42s",
          userSelect: "none",
          background: "none"
        }}
      >
        You need a rod to fish at the lake!
      </div>
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


    {/* Semua UI bawah, panel event, analog, map, dsb HANYA tampil kalau inventory tidak terbuka */}
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
          <p className="event-text">
            {nearCloth
              ? "🧣 Press Interact to collect Ripped Cloth"
              : nearHouseNPC
              ? "👩 Press Interact to talk to Mom"
              : nearLakeNPC
              ? "🎣 Press Interact to talk to Fisherman"
              : nearMountainNPC
              ? "⛰️ Press Interact to talk to Hermit"
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
              : atMysticShore
              ? "🚤 Press Interact to cross to the Isle of The Sacred Oath"
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

    {nearHouseNPC && !showHouseNPCDialog && (
      <button
        className="event-button"
        style={{
          position: "absolute",
          left: houseNPCPos.x - offsetX,
          top: houseNPCPos.y - offsetY + 70,
          zIndex: 100
        }}
        onClick={() => {
          setShowHouseNPCDialog(true);
          setNPCDialogState({ stage: 0, textIdx: 0 });
        }}
      >
        Interact
      </button>
    )}

    {showHouseNPCDialog && (
      <div className="coconut-overlay" style={{ background: "rgba(0,0,0,0.87)", zIndex: 350 }}>
        <HouseNPCDialogPanel
          state={npcDialogState}
          setState={setNPCDialogState}
          setShowDialog={setShowHouseNPCDialog}
          characterSprite={character?.sprite}
          username={username}
        />
      </div>
    )}

    {nearLakeNPC && !showLakeNPCDialog && (
      <button
        className="event-button"
        style={{
          position: "absolute",
          left: lakeNPCPos.x - offsetX,
          top: lakeNPCPos.y - offsetY + 70,
          zIndex: 100
        }}
        onClick={() => {
          setShowLakeNPCDialog(true);
          setLakeDialogState({ stage: 0, textIdx: 0 });
        }}
      >
        Interact
      </button>
    )}

    {showLakeNPCDialog && (
      <div className="coconut-overlay" style={{ background: "rgba(0,0,0,0.87)", zIndex: 350 }}>
        <LakeNPCDialogPanel
          state={lakeDialogState}
          setState={setLakeDialogState}
          setShowDialog={setShowLakeNPCDialog}
          characterSprite={character?.sprite}
          username={username}
          condition={
            !inventory.includes("Fish Nail")
              ? 0
              : !inventory.includes("Rod")
                ? 1
                : 2
          }
          giveFishNail={() => {
            // Dapat Fish Nail (Fish Claw)
            if (!inventory.includes("Fish Nail")) {
              const newInv = [...inventory, "Fish Nail"];
              setInventory(newInv);
              addDiscoveredItem("Fish Nail");
            }
          }}
        />
      </div>
    )}

    {nearMountainNPC && !showMountainNPCDialog && (
      <button
        className="event-button"
        style={{
          position: "absolute",
          left: mountainNPCPos.x - offsetX,
          top: mountainNPCPos.y - offsetY + 70,
          zIndex: 100
        }}
        onClick={() => {
          setShowMountainNPCDialog(true);
          setMountainDialogState(prev => ({ stage: 0, textIdx: 0, followUp: prev.followUp }));
        }}

      >
        Interact
      </button>
    )}

    {showMountainNPCDialog && (
      <div className="coconut-overlay" style={{ background: "rgba(0,0,0,0.87)", zIndex: 350 }}>
        <MountainNPCDialogPanel
          state={mountainDialogState}
          setState={setMountainDialogState}
          setShowDialog={setShowMountainNPCDialog}
          characterSprite={character?.sprite}
          username={username}
          inventory={inventory}
          setInventory={setInventory}
          addDiscoveredItem={addDiscoveredItem}
        />
      </div>
    )}




  </div>
)
}

// Komponen Dialog Panel NPC House
function HouseNPCDialogPanel({
  state, setState, setShowDialog, characterSprite, username
}) {
  const dialogScript = [
    // Awal interaksi
    [
      { npc: "Dear, have you eaten? I just finished cooking. The house smells warm, doesn’t it?" },
      { npc: "You look tired. You can always rest here." },
      { npc: "And if there’s something on your mind, just say the word." },
      { choice: true }
    ],
    // Who am I?
    [
      { player: "Do you know who I am?" },
      { npc: "Honestly… I wish I knew more." },
      { npc: "I found you by the river after the storm, all alone." },
      { player: "I don’t remember anything before that." },
      { npc: "That’s what worries me. Maybe you’re from another world." },
      { npc: "Whatever the reason, you’re safe now. This home is yours." }
    ],
    // Can I stay here?
    [
      { player: "Can I… stay here for a while?" },
      { npc: "Of course you can, dear. This house is your home now." },
      { player: "I’m not sure where else to go." },
      { npc: "You can eat, rest, and stay as long as you want. You’re not a burden." }
    ],
    // How do I go back?
    [
      { player: "Do you know how I can return to… my world?" },
      { npc: "That’s something I’ve wondered too…" },
      { npc: "I don’t know how—but someone might." },
      { player: "Who?" },
      { npc: "There’s an old man near the mountain. A hermit, they say. He knows things most people forgot." },
      { npc: "If there’s a way back, I think he’d be the one to help." }
    ],
    // Nevermind
    [
      { player: "Nevermind, sorry." },
      { npc: "That’s okay, sweetie. I’m always here if you need to talk." }
    ]
  ];
  const choices = [
    "Who am I?",
    "Can I stay here?",
    "How do I go back to my world?",
    "Nevermind."
  ];

  const [shownText, setShownText] = React.useState("");
  const textDone = React.useRef(true);

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
    if (state.stage === 0) {
      if (d?.choice) return;
      if (state.textIdx < dialogScript[0].length - 1) {
        setState({ ...state, textIdx: state.textIdx + 1 });
      }
    } else {
      if (state.textIdx < dialogScript[state.stage].length - 1) {
        setState({ ...state, textIdx: state.textIdx + 1 });
      } else {
        if (state.stage === 4) {
          setShowDialog(false);
        } else {
          setState({ stage: 0, textIdx: dialogScript[0].length - 1 });
        }
      }
    }
  }

  // INI FIX PALING BENER
  if (state.stage === 0 && d?.choice) {
    return (
      <div className="npc-dialog-panel" style={{ display: "flex", width: 740, height: 320, background: "rgba(0,0,0,0.87)", borderRadius: 32, alignItems: "center", boxShadow: "0 3px 60px #000a" }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={houseNPCImg} alt="NPC" style={{ width: 165, height: 165, objectFit: "contain" }} />
        </div>
        <div style={{ flex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 22, color: "#ffe69c", margin: "12px 0 16px" }}>What do you want to ask?</div>
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
              width: 32,
              height: 32,
              background: `url(${characterSprite})`,
              backgroundPosition: "0px 0px",         // frame kiri atas
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

  // Render dialog branch atau baris dialog utama (bukan pilihan)
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
        <img src={houseNPCImg} alt="NPC" style={{ width: 165, height: 165, objectFit: "contain" }} />
        <div style={{ color: "#ffecb0", fontSize: 15, marginTop: 8, opacity: 0.82 }}>Mom</div>
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
          <b style={{ color: "#ffe69c", fontSize: 17 }}>Mom</b>
          <br />
          <span style={{ transition: "all 0.12s", display: "block", textAlign: "left" }}>{shownText}</span>
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
          <br />
          <span style={{ transition: "all 0.12s", display: "block", textAlign: "right" }}>{shownText}</span>
          {!textDone.current && <span className="writing-cursor" style={{ color: "#ffd868", fontWeight: "bold", marginLeft: 1 }}>|</span>}
        </div>
      )}

        <div style={{ fontSize: 12, color: "#e6d9a7", margin: "10px 0 0 8px" }}>Click to continue…</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 165, height: 165, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="player-dialog-sprite" style={{
              width: 32,
              height: 32,
              background: `url(${characterSprite})`,
              backgroundPosition: "0px 0px",         // frame kiri atas
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

function LakeNPCDialogPanel({
  state, setState, setShowDialog, characterSprite, username, giveFishNail, condition // condition: 0,1,2
}) {
  // Dialog Script berdasarkan kondisi
  // 0 = Belum punya fish claw
  // 1 = Sudah punya fish claw tapi belum rod
  // 2 = Sudah punya rod
  const dialogScripts = [
    [ // KONDISI 0
      // Dialog utama, menu pilihan
      [
        { npc: "Shhh… the fish here are sensitive to noise." },
        { npc: "The lake looks peaceful, but it’s full of stories. You need the right tools to fish here." },
        { choice: true }
      ],
      // Teach me?
      [
        { player: "Can you teach me how to fish here?" },
        { npc: "Of course. Fishing takes patience, not just luck." },
        { npc: "Here, take this fish claw. Craft it into a hook, and you’ll be ready." },
        { player: "A fish claw?" },
        { npc: "Yes. With it, you might even catch something… legendary." }
      ],
      // Special item?
      [
        { player: "You mentioned special items in the lake?" },
        { npc: "There are a few rare things here. One of them is this—take it." },
        { npc: "It’s a fish claw. Might be useful one day." },
        { player: "Thanks. I’ll be careful." },
        { npc: "And patient. The lake hides secrets under its silence." }
      ],
      // Nevermind
      [
        { player: "Nevermind." },
        { npc: "Sometimes, just listening to the lake is enough." }
      ]
    ],
    [ // KONDISI 1 (punya fish claw, belum rod)
      [
        { npc: "Back again, I see. Did you catch anything?" },
        { npc: "Wait—that’s a fish claw in your bag, isn’t it?" },
        { player: "Yeah… but I haven’t done anything with it yet." },
        { npc: "You need to craft it into a rod first. Stick, line, and claw." },
        { choice: true }
      ],
      // What should I do?
      [
        { player: "What should I do again?" },
        { npc: "Take the claw, combine it with a stick and strong thread. Then it’s ready." },
        { npc: "Check your crafting menu if you’re unsure." }
      ],
      // Nevermind
      [
        { player: "Nevermind." },
        { npc: "Alright. Come back when you’re ready." }
      ]
    ],
    [ // KONDISI 2 (punya rod)
      [
        { npc: "Ah! That rod looks well made. I’m impressed." },
        { player: "Thanks. So… now what?" },
        { npc: "Now you can reach the deeper fish." },
        { choice: true }
      ],
      // Where to fish?
      [
        { player: "Where should I fish?" },
        { npc: "Try near the willow tree or old dock." },
        { npc: "And be quiet. They sense everything." }
      ],
      // Special fish?
      [
        { player: "Any rare fish around here?" },
        { npc: "A golden-scaled one at dawn, and a glowing shadow fish at night, they say." },
        { player: "Sounds… mysterious." },
        { npc: "Keep your eyes open." }
      ],
      // Nevermind
      [
        { player: "Nevermind." },
        { npc: "Enjoy the calm while it lasts." }
      ]
    ]
  ];

  // Choice untuk tiap kondisi
  const choicesArr = [
    ["Teach me?", "Special item?", "Nevermind."],
    ["What should I do?", "Nevermind."],
    ["Where to fish?", "Special fish?", "Nevermind."]
  ];
  const dialogScript = dialogScripts[condition];
  const choices = choicesArr[condition];
  const d = dialogScript[state.stage][state.textIdx];

  const [shownText, setShownText] = React.useState("");
  const textDone = React.useRef(true);

  React.useEffect(() => {
    setState({ stage: 0, textIdx: 0 });
  }, []);


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
    if (d?.choice) return;

    if (state.stage === 0) {
      if (state.textIdx < dialogScript[0].length - 1) {
        setState({ ...state, textIdx: state.textIdx + 1 });
      }
    } else {
      if (state.textIdx < dialogScript[state.stage].length - 1) {
        setState({ ...state, textIdx: state.textIdx + 1 });
      } else {
        // === Logic close dialog ===
        if (condition === 0) {
          // Give fish claw setelah pilih 1/2, selesai tutup
          if (state.stage === 1 || state.stage === 2) {
            giveFishNail();
          }
        }
        setShowDialog(false);
      }
    }
  }

  // Render pilihan
  if (d?.choice) {
    return (
      <div className="npc-dialog-panel" style={{ display: "flex", width: 740, height: 320, background: "rgba(0,0,0,0.87)", borderRadius: 32, alignItems: "center", boxShadow: "0 3px 60px #000a" }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={lakeNPCImg} alt="Old Fisherman" style={{ width: 165, height: 165, objectFit: "contain" }} />
        </div>
        <div style={{ flex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 22, color: "#ffe69c", margin: "12px 0 16px" }}>
            {condition === 0 ? "What do you want to ask?" : condition === 1 ? "Still confused?" : "Curious?"}
          </div>
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
              width: 32,
              height: 32,
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

  // Render percakapan (dialog branch)
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
        <img src={lakeNPCImg} alt="Old Fisherman" style={{ width: 165, height: 165, objectFit: "contain" }} />
        <div style={{ color: "#ffecb0", fontSize: 15, marginTop: 8, opacity: 0.82 }}>Old Fisherman</div>
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
          <b style={{ color: "#ffe69c", fontSize: 17 }}>Old Fisherman</b>
          <br />
          <span style={{ transition: "all 0.12s", display: "block", textAlign: "left" }}>{shownText}</span>
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
          <br />
          <span style={{ transition: "all 0.12s", display: "block", textAlign: "right" }}>{shownText}</span>
          {!textDone.current && <span className="writing-cursor" style={{ color: "#ffd868", fontWeight: "bold", marginLeft: 1 }}>|</span>}
        </div>
      )}

        <div style={{ fontSize: 12, color: "#e6d9a7", margin: "10px 0 0 8px" }}>Click to continue…</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 165, height: 165, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="player-dialog-sprite" style={{
            width: 32,
            height: 32,
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

function MountainNPCDialogPanel({
  state, setState, setShowDialog, characterSprite, username, inventory, setInventory, addDiscoveredItem
}) {
  // State for multi-step dialog after crafting talisman
  const [talismanDialogStep, setTalismanDialogStep] = React.useState(0);

  // Inventory checks
  const hasRareHerbalGrass = inventory.includes("Rare Herbal Grass");
  const hasTalisman = inventory.includes("Archipelago Talisman");

  // Default: quest logic
  const [questStarted, setQuestStarted] = React.useState(() =>
    localStorage.getItem("mountainQuestStarted") === "true"
  );
  const [whereAmIDone, setWhereAmIDone] = React.useState(false);
  const [yourStoryDone, setYourStoryDone] = React.useState(false);

  // Reset done state on open
  React.useEffect(() => {
    setWhereAmIDone(false);
    setYourStoryDone(false);
    setTalismanDialogStep(0);
  }, [setShowDialog]);

  // Normal quest dialog (before and after quest started)
  const hasWildFruitJuice = inventory.includes("Juice Wild Fruit");
  const hasCoconutJuice = inventory.includes("Juice Coconut");

  function triggerQuest() {
    if (!questStarted) {
      setQuestStarted(true);
      localStorage.setItem("mountainQuestStarted", "true");
    }
  }

  const dialogMain = [
    [
      { npc: "Whoa, a traveler? Haven’t seen anyone up here in ages." },
      { npc: "Most who come here are searching for something." },
      { player: "I think… I want to go home." },
      { choice: true }
    ],
    [
      { player: "Where am I, exactly?" },
      { npc: "You’re in a world far from yours. This land has its own rules." },
      { npc: "To go home, you’ll need the Archipelago Talisman." },
      { player: "How do I get it?" },
      { npc: "I can make it—but I need rare herbal grass. Bring me wild fruit juice and coconut juice." },
      { endQuest: true }
    ],
    [
      { player: "What’s your story?" },
      { npc: "I’ve lived here longer than I can count." },
      { npc: "I’ve helped others like you. But nothing is ever easy." },
      { player: "So you’ll help me too?" },
      { npc: "If you help me first. Find the juices, and I’ll show you the way." },
      { endQuest: true }
    ],
    [
      { player: "Nevermind." },
      { npc: "Then take care. The mountain watches." },
      { endQuest: true }
    ]
  ];

  const choicesMain = [
    "Where am I?",
    "Your story?",
    "Nevermind."
  ];

  const dialogFollowUp = [
    [
      { npc: "Did you find the wild fruit juice and coconut juice?" },
      { choice: true }
    ],
    // Not yet: langsung selesai setelah info
    [
      { player: "Not yet." },
      { npc: "Go find wild fruit juice from the forest and coconut juice from the beach, then come back here." },
      { close: true }
    ],
    // Here you go! (punya item → kasih, tidak punya item → langsung tutup)
    hasWildFruitJuice && hasCoconutJuice
      ? [
          { player: "Here you go!" },
          { npc: "Perfect. Thank you." },
          { npc: "Here’s the rare herbal grass. Treat it well—your journey home depends on it." },
          { giveItem: "Rare Herbal Grass" }
        ]
      : [
          { player: "Here you go!" },
          { npc: "You’re still missing something. Please bring both juices before I can help." },
          { close: true }
        ],
    // What should I do again? → info, lalu selesai
    [
      { player: "What should I do again?" },
      { npc: "You need wild fruit juice from berries in the forest, and coconut juice from the beach. Bring both here." },
      { close: true }
    ],
    // Nevermind
    [
      { player: "Nevermind." },
      { npc: "Come back when you’re ready. The mountain will be here." },
      { close: true }
    ]
  ];

  const choicesFollowUp = [
    "Not yet.",
    "Here you go!",
    "What should I do again?",
    "Nevermind."
  ];

  // 1. TALISMAN DIALOG: PRIORITY
  if (hasTalisman) {
    const talismanDialogs = [
      "So you’ve crafted the Archipelago Talisman.",
      "If you wish to return home, you must perform the ritual on the Isle of the Sacred Oath.",
      "To reach the isle, you’ll need a boat to cross the water.",
      "The crossing point is at Mystic Shore, along the edge of this island."
    ];

    const [shownText, setShownText] = React.useState("");
    const [step, setStep] = React.useState(0);
    const [justNevermind, setJustNevermind] = React.useState(false);
    const textDone = React.useRef(true);

    React.useEffect(() => {
      setStep(0);
      setShownText("");
      setJustNevermind(false);
      textDone.current = false;
    }, [setShowDialog]);

    React.useEffect(() => {
      setShownText("");
      textDone.current = false;
      let idx = 0;
      function type() {
        setShownText(talismanDialogs[step].slice(0, idx));
        if (idx < talismanDialogs[step].length) {
          idx++;
          setTimeout(type, 17 + Math.random() * 13);
        } else {
          textDone.current = true;
        }
      }
      if (!justNevermind) type();
    }, [step, justNevermind]);

    function handleTalismanDialogClick() {
      if (justNevermind) return;
      if (!textDone.current) {
        setShownText(talismanDialogs[step]);
        textDone.current = true;
        return;
      }
      if (step < talismanDialogs.length - 1) {
        setStep(step + 1);
      } else {
        // Habis dialog terakhir, tap sekali lagi untuk tampil panel Nevermind saja
        setJustNevermind(true);
      }
    }

    // Setelah selesai, tampilkan panel NPC seperti biasa, tengah cuma tombol Nevermind
    if (justNevermind) {
      return (
        <div className="npc-dialog-panel"
          style={{
            display: "flex",
            width: 740,
            height: 320,
            background: "rgba(0,0,0,0.89)",
            borderRadius: 32,
            alignItems: "center",
            boxShadow: "0 3px 60px #000a",
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <img src={mountainNPCImg} alt="Mountain NPC" style={{ width: 165, height: 165, objectFit: "contain" }} />
            <div style={{ color: "#ffecb0", fontSize: 15, marginTop: 8, opacity: 0.82 }}>Hermit</div>
          </div>
          <div style={{ flex: 2.1, minHeight: 60, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <button
              className="event-button"
              style={{ fontSize: 22, padding: "15px 48px", minWidth: 180, marginTop: 40 }}
              onClick={e => { e.stopPropagation(); setShowDialog(false); }}
            >
              Okay...
            </button>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div className="player-dialog-sprite" style={{
              width: 32, height: 32,
              background: `url(${characterSprite})`,
              backgroundPosition: "0px 0px",
              backgroundSize: "128px 128px",
              imageRendering: "pixelated",
              transform: "scale(5.15625)",
              transformOrigin: "center"
            }}></div>
            <div style={{ color: "#a4f1fd", fontSize: 15, marginTop: 8, opacity: 0.81 }}>{username}</div>
          </div>
        </div>
      );
    }

    // Panel dialog normal (animasi typing)
    return (
      <div className="npc-dialog-panel"
        style={{
          display: "flex",
          width: 740,
          height: 320,
          background: "rgba(0,0,0,0.89)",
          borderRadius: 32,
          alignItems: "center",
          boxShadow: "0 3px 60px #000a",
          cursor: "pointer"
        }}
        onClick={handleTalismanDialogClick}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <img src={mountainNPCImg} alt="Mountain NPC" style={{ width: 165, height: 165, objectFit: "contain" }} />
          <div style={{ color: "#ffecb0", fontSize: 15, marginTop: 8, opacity: 0.82 }}>Hermit</div>
        </div>
        <div style={{ flex: 2.1, minHeight: 60, display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
            <b style={{ color: "#ffe69c", fontSize: 17 }}>Hermit</b>
            <span style={{ display: "block", marginTop: 4 }}>{shownText}</span>
            {!textDone.current && <span className="writing-cursor" style={{ color: "#ffd868", fontWeight: "bold", marginLeft: 1 }}>|</span>}
          </div>
          <div style={{ fontSize: 12, color: "#e6d9a7", margin: "10px 0 0 8px" }}>Click to continue…</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="player-dialog-sprite" style={{
            width: 32, height: 32,
            background: `url(${characterSprite})`,
            backgroundPosition: "0px 0px",
            backgroundSize: "128px 128px",
            imageRendering: "pixelated",
            transform: "scale(5.15625)",
            transformOrigin: "center"
          }}></div>
          <div style={{ color: "#a4f1fd", fontSize: 15, marginTop: 8, opacity: 0.81 }}>{username}</div>
        </div>
      </div>
    );
  }



  // 2. RARE HERBAL GRASS: SECOND PRIORITY
  if (hasRareHerbalGrass) {
    return (
      <div className="npc-dialog-panel" style={{ display: "flex", width: 740, height: 320, background: "rgba(0,0,0,0.89)", borderRadius: 32, alignItems: "center", boxShadow: "0 3px 60px #000a" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <img src={mountainNPCImg} alt="Mountain NPC" style={{ width: 165, height: 165, objectFit: "contain" }} />
          <div style={{ color: "#ffecb0", fontSize: 15, marginTop: 8, opacity: 0.82 }}>Hermit</div>
        </div>
        <div style={{ flex: 2.1, minHeight: 60, display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
            <b style={{ color: "#ffe69c", fontSize: 17 }}>Hermit</b>
            <span style={{ display: "block", marginTop: 4 }}>
              You’ve found the rare herbal grass. Now, craft the Archipelago Talisman. Return to me once it’s ready.
            </span>
          </div>
          <button
            className="event-button"
            style={{ marginTop: 22, fontSize: 18 }}
            onClick={() => setShowDialog(false)}
          >
            Nevermind.
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="player-dialog-sprite" style={{
            width: 32, height: 32,
            background: `url(${characterSprite})`,
            backgroundPosition: "0px 0px",
            backgroundSize: "128px 128px",
            imageRendering: "pixelated",
            transform: "scale(5.15625)",
            transformOrigin: "center"
          }}></div>
          <div style={{ color: "#a4f1fd", fontSize: 15, marginTop: 8, opacity: 0.81 }}>{username}</div>
        </div>
      </div>
    );
  }

  // --- Else: normal quest dialog (before/after quest started)
  let dialogScript, choices;
  if (questStarted) {
    dialogScript = dialogFollowUp;
    choices = choicesFollowUp;
  } else {
    dialogScript = dialogMain;
    choices = choicesMain;
  }
  const d = dialogScript[state.stage][state.textIdx];

  // Typing effect
  const [shownText, setShownText] = React.useState("");
  const textDone = React.useRef(true);

  React.useEffect(() => {
    setShownText("");
    textDone.current = false;
    if (!d) return;
    let idx = 0;
    function type() {
      setShownText(d.npc?.slice(0, idx) || d.player?.slice(0, idx) || "");
      if (idx < (d.npc?.length || d.player?.length || 0)) {
        idx++;
        setTimeout(type, 16 + Math.random() * 14);
      } else {
        textDone.current = true;
      }
    }
    type();
    // eslint-disable-next-line
  }, [state.stage, state.textIdx, hasWildFruitJuice, hasCoconutJuice]);

  // Handler klik dialog
  function handleDialogClick() {
    if (!textDone.current) {
      setShownText(d.npc || d.player || "");
      textDone.current = true;
      return;
    }
    if (d?.choice) return;

    // SESUDAH QUEST
    if (questStarted) {
      const nextIdx = state.textIdx + 1;
      const nextStep = dialogScript[state.stage][nextIdx];
      if (nextStep?.close) {
        setShowDialog(false);
        return;
      }
      if (nextStep?.giveItem) {
        setInventory(inv => {
          let newInv = inv.filter(x => x !== "Juice Wild Fruit" && x !== "Juice Coconut");
          newInv.push("Rare Herbal Grass");
          addDiscoveredItem("Rare Herbal Grass");
          return newInv;
        });
        setShowDialog(false);
        return;
      }
      if (state.textIdx === dialogScript[state.stage].length - 1) {
        setShowDialog(false);
        return;
      }
      setState({ ...state, textIdx: state.textIdx + 1 });
      return;
    }

    // SEBELUM QUEST
    if (!questStarted) {
      if (state.stage === 0) {
        if (state.textIdx < dialogScript[0].length - 1) {
          setState({ ...state, textIdx: state.textIdx + 1 });
        }
      } else {
        const nextIdx = state.textIdx + 1;
        const nextStep = dialogScript[state.stage][nextIdx];
        if (nextStep?.endQuest) {
          if (state.stage === 1) setWhereAmIDone(true);
          if (state.stage === 2) setYourStoryDone(true);

          if (
            ((state.stage === 1 && yourStoryDone) || (state.stage === 2 && whereAmIDone))
          ) {
            triggerQuest();
            setShowDialog(false);
          } else {
            setState({ stage: 0, textIdx: dialogScript[0].length - 1 });
          }
          return;
        }
        if (state.textIdx < dialogScript[state.stage].length - 1) {
          setState({ ...state, textIdx: state.textIdx + 1 });
        } else {
          setShowDialog(false);
        }
      }
      return;
    }

    setShowDialog(false);
  }

  // Render CHOICE PANEL
  if (d?.choice) {
    return (
      <div className="npc-dialog-panel" style={{ display: "flex", width: 740, height: 320, background: "rgba(0,0,0,0.87)", borderRadius: 32, alignItems: "center", boxShadow: "0 3px 60px #000a" }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={mountainNPCImg} alt="Mountain NPC" style={{ width: 165, height: 165, objectFit: "contain" }} />
        </div>
        <div style={{ flex: 2, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 0 }}>
          <div style={{ fontSize: 22, color: "#ffe69c", margin: "12px 0 14px" }}>
            {!questStarted ? "What do you want to ask?" : "Did you bring the juices or need help?"}
          </div>
          <div style={{
            display: "flex",
            flexDirection: "column",
            width: "95%",
            background: "rgba(255,255,255,0.02)",
            borderRadius: 13,
            margin: "0 auto"
          }}>
            {choices.map((ch, i) => {
              const disabled = (
                (!questStarted && i === 0 && whereAmIDone) ||
                (!questStarted && i === 1 && yourStoryDone)
              );
              return (
                <button
                  key={i}
                  className="story-choice-btn"
                  style={{
                    border: "none",
                    background: disabled ? "rgba(180,180,180,0.17)" : "transparent",
                    color: disabled ? "#aaadad" : "#ffeab3",
                    fontSize: 20,
                    padding: "13px 0 12px 0",
                    borderBottom: i < choices.length - 1 ? "1.2px solid #e8c26a50" : "none",
                    outline: "none",
                    cursor: disabled ? "not-allowed" : "pointer",
                    textAlign: "center"
                  }}
                  onClick={() => !disabled && setState({ stage: i + 1, textIdx: 0 })}
                  disabled={disabled}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
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
    );
  }

  // Render dialog one by one
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
        <img src={mountainNPCImg} alt="Mountain NPC" style={{ width: 165, height: 165, objectFit: "contain" }} />
        <div style={{ color: "#ffecb0", fontSize: 15, marginTop: 8, opacity: 0.82 }}>Hermit</div>
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
            <b style={{ color: "#ffe69c", fontSize: 17 }}>Hermit</b>
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
        <div className="player-dialog-sprite" style={{
          width: 32, height: 32,
          background: `url(${characterSprite})`,
          backgroundPosition: "0px 0px",
          backgroundSize: "128px 128px",
          imageRendering: "pixelated",
          transform: "scale(5.15625)",
          transformOrigin: "center"
        }}></div>
        <div style={{ color: "#a4f1fd", fontSize: 15, marginTop: 8, opacity: 0.81 }}>{username}</div>
      </div>
    </div>
  );


  
}
