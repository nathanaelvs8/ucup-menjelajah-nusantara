import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Gameplay.css";
import "./Forest.css";
import { getGreeting, addActivity, addNPCInteract, addVisitedArea } from "./utils";
import { addItemToInventory } from "./utils";

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
import forestMusic from "../assets/audio/forest.mp3";
import forestNPCImg from "../assets/NPC/ForestNPC.png";
import arrowUp from "../assets/ui/ArrowUP.png";
import arrowDown from "../assets/ui/ArrowDOWN.png";
import arrowLeft from "../assets/ui/ArrowLEFT.png";
import arrowRight from "../assets/ui/ArrowRIGHT.png";



const MAP_WIDTH = 1540;
const MAP_HEIGHT = 1247;
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
    x: 600,
    y: MAP_HEIGHT - SPRITE_SIZE
  });

  const [atBottom, setAtBottom] = useState(false);
  const audioRef = useRef();


  const fruitTree = {
    x: 380,
    y: 420,
    rx: 350 / 2,
    ry: 280 / 2
  };
  const [canInteractFruit, setCanInteractFruit] = useState(false);

  const woodTree = {
    x: 1300,
    y: 535,
    rx: 150,
    ry: 175
  };
  const [canInteractWood, setCanInteractWood] = useState(false);

  const dungeonZone = {
    x: 1450,
    y: 120,
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

  const [showRopeBanner, setShowRopeBanner] = useState(false);

  const [discoveredItems, setDiscoveredItems] = useState(() => {
    return JSON.parse(localStorage.getItem("discoveredItems") || "[]");
  });

  const [nearRope, setNearRope] = useState(false);

  const forestNPCPos = { x: 500, y: 1050 }; // EDIT sesuai posisi map kamu
  const [showForestNPCDialog, setShowForestNPCDialog] = useState(false);
  const [forestDialogState, setForestDialogState] = useState({ stage: 0, textIdx: 0 });
  const [nearForestNPC, setNearForestNPC] = useState(false);
  
  const [dungeonTorchNotif, setDungeonTorchNotif] = useState(false);
  const [dungeonTorchNotifFade, setDungeonTorchNotifFade] = useState(false);
  const [dungeonCooldownLeft, setDungeonCooldownLeft] = useState(0);

  // Cek apakah dekat dengan NPC (panggil di useEffect yang memonitor posisi karakter)
  useEffect(() => {
    const dx = position.x + 32 - forestNPCPos.x;
    const dy = position.y + 32 - forestNPCPos.y;
    setNearForestNPC(Math.sqrt(dx * dx + dy * dy) < 60);
  }, [position]);



  // Ukuran karakter (disamakan dengan sprite atau 64x64 misal)
  const CHAR_W = 64;
  const CHAR_H = 64;

  // Semua zona blok (A, B, C, dsb)
  const blockZones = [
    // --- Rectangle Atas map ---
    { x: 10, y: 10, w: 1130, h: 340 },         // .zone-top-rect
    { x: 1160, y: 10, w: 180, h: 190 },        // .zone-top-rect-b
    { x: 1360, y: 10, w: 180, h: 80 },         // .zone-top-rect-c

    // --- Triangle Kiri bawah ---
    {
      type: 'triangle',
      x: 10,
      y: 1247 - (1100 - 20) + 10, // = 157 + 10 = 167
      w: 555,
      h: 1080,
      points: [
        [0, 1080],    // kiri bawah
        [0, 0],       // kiri atas
        [555, 1080]   // kanan bawah
      ]
    },

    // --- Triangle Tengah terbalik 1 ---
    {
      type: 'triangle',
      x: 670 - ((290-20)/2) + 10, // 670-135+10 = 545
      y: 350 + 10,
      w: 270,
      h: 160,
      points: [
        [135, 160],  // tengah bawah (awal 145,180)
        [0, 0],      // kiri atas
        [270, 0]     // kanan atas
      ]
    },

    // --- Triangle Tengah terbalik 2 ---
    {
      type: 'triangle',
      x: 730 - ((470-20)/2) + 10, // 730-225+10=515
      y: 600 + 10,
      w: 450,
      h: 380,
      points: [
        [0.3*450, 380], // (135,400) -> (135,380)
        [0, 0],         // kiri atas
        [450, 20]       // kanan sedikit turun (470,40) -> (450,20)
      ]
    },

    // --- Triangle Kanan bawah ---
    {
      type: 'triangle',
      x: 1540 - (800-20) + 10,    // 1540-780+10=770
      y: 1247 - (1050-20) + 10,   // 1247-1030+10=227
      w: 780,
      h: 1030,
      points: [
        [780, 1030],    // kanan bawah
        [0, 1030],      // kiri bawah
        [780, 0]        // kanan atas
      ]
    }
  ];


  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return !(ax + aw <= bx || bx + bw <= ax || ay + ah <= by || by + bh <= ay);
  }

  // Cek apakah [px,py] di dalam segitiga [p0,p1,p2]
  function pointInTriangle(px, py, p0, p1, p2) {
    function sign(p1, p2, p3) {
      return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
    }
    let b1 = sign([px, py], p0, p1) < 0.0;
    let b2 = sign([px, py], p1, p2) < 0.0;
    let b3 = sign([px, py], p2, p0) < 0.0;
    return ((b1 === b2) && (b2 === b3));
  }

    const [ropePos, setRopePos] = useState(() => {
    // Cek sudah pernah dapat Rope, kalau sudah: null
    const savedData = JSON.parse(localStorage.getItem("playerData")) || {};
    const inv = savedData.inventory || [];
    if (inv.includes("Rope")) return null;


    // Fungsi spawn random, cek tidak overlap dengan blok
    function isInBlockedZone(x, y) {
      const charSize = 64;

      // --- CEK RECTANGLE / TRIANGLE COLLISION ---
      const collision = blockZones.some(zone => {
        if (!zone.type) {
          return (
            x + charSize/2 >= zone.x &&
            x + charSize/2 <= zone.x + zone.w &&
            y + charSize/2 >= zone.y &&
            y + charSize/2 <= zone.y + zone.h
          );
        } else if (zone.type === "triangle") {
          return pointInTriangle(x + charSize/2, y + charSize/2, 
            ...zone.points.map(([xx,yy])=>[zone.x+xx,zone.y+yy])
          );
        }
        return false;
      });
      if (collision) return true;

      // --- CEK ZONA INTERAKSI FRUIT TREE ---
      const dxFruit = (x + charSize/2 - fruitTree.x) / fruitTree.rx;
      const dyFruit = (y + charSize/2 - fruitTree.y) / fruitTree.ry;
      if ((dxFruit * dxFruit + dyFruit * dyFruit) < 1.1) return true; // lebih besar biar aman

      // --- CEK ZONA INTERAKSI WOOD TREE ---
      const dxWood = (x + charSize/2 - woodTree.x) / woodTree.rx;
      const dyWood = (y + charSize/2 - woodTree.y) / woodTree.ry;
      if ((dxWood * dxWood + dyWood * dyWood) < 1.1) return true;

      // --- CEK ZONA INTERAKSI DUNGEON ---
      const dxDung = (x + charSize/2 - dungeonZone.x) / dungeonZone.rx;
      const dyDung = (y + charSize/2 - dungeonZone.y) / dungeonZone.ry;
      if ((dxDung * dxDung + dyDung * dyDung) < 1.2) return true;

      // --- BAWAH MAP ---
      if (y > 960) return true; // biar ga spawn di bawah map

      return false;
    }


    let x, y, tryCount = 0;
    do {
      x = Math.floor(Math.random() * (MAP_WIDTH - SPRITE_SIZE));
      y = Math.floor(Math.random() * (MAP_HEIGHT - SPRITE_SIZE));
      tryCount++;
      if (tryCount > 2000) return null; // Tidak ketemu, skip
    } while (isInBlockedZone(x, y));
    return { x, y };
  });


  function isBlocked(newX, newY) {
    // rectangle hitbox karakter
    for (let zone of blockZones) {
      if (!zone.type) {
        if (rectsOverlap(newX, newY, CHAR_W, CHAR_H, zone.x, zone.y, zone.w, zone.h)) {
          return true;
        }
      } else if (zone.type === 'triangle') {
        // Cek semua sudut karakter, asal ada satu di dalam, blok
        const corners = [
          [newX, newY],
          [newX+CHAR_W, newY],
          [newX, newY+CHAR_H],
          [newX+CHAR_W, newY+CHAR_H]
        ];
        const absPoints = zone.points.map(([xx,yy]) => [zone.x+xx, zone.y+yy]);
        for (let [cx, cy] of corners) {
          if (pointInTriangle(cx, cy, absPoints[0], absPoints[1], absPoints[2])) return true;
        }
      }
    }
    return false;
  }



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
      setPosition({ x: 600, y: MAP_HEIGHT - SPRITE_SIZE });  // ← spawn agak ke kanan bawah
    } else {
      setPosition({ x: 600, y: MAP_HEIGHT - SPRITE_SIZE });
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
        // ---- BLOKIR DI SINI ----
        if (isBlocked(newPos.x, newPos.y)) return prev;
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
  if (audioRef.current) {
    audioRef.current.volume = 1; // bisa diubah sesuai keinginan
    audioRef.current.play().catch(() => {});
  }
}, []);


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
            const itemHeight = item.isFruit ? 100 : 100;
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
        const basketWidth = basketRef.current?.offsetWidth || 90; // fallback ke 90px
        const basketHeight = basketRef.current?.offsetHeight || 90;

        if (leftPressed) return Math.max(prev - 12, 0);
        if (rightPressed) return Math.min(prev + 12, window.innerWidth - basketWidth);
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
    // Handler untuk mouse click (atau tap di hp)
    const handleClick = (e) => {
      if (!showChopMinigame || chopResult) return;
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
    };

    // Pakai event global supaya di mana pun klik di layar bisa terdeteksi
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("touchstart", handleClick);

    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("touchstart", handleClick);
    };
  }, [showChopMinigame, chopResult]);

  useEffect(() => {
    if (!ropePos) {
      setNearRope(false);
      return;
    }
    const charCenterX = position.x + SPRITE_SIZE / 2;
    const charCenterY = position.y + SPRITE_SIZE / 2;
    const itemCenterX = ropePos.x + 20;
    const itemCenterY = ropePos.y + 20;
    const near = Math.abs(charCenterX - itemCenterX) < 36 && Math.abs(charCenterY - itemCenterY) < 36;
    setNearRope(near);
  }, [position, ropePos]);

  useEffect(() => {
    const lastDungeonTimeRaw = localStorage.getItem("lastDungeonEntry");
    if (lastDungeonTimeRaw) {
      const lastDungeonTime = JSON.parse(lastDungeonTimeRaw);
      let curr = { day: currentDayIndex, hour: currentHour, minute: currentMinute };
      const toMinute = t => (t.day * 24 * 60) + (t.hour * 60) + t.minute;
      const diff = toMinute(curr) - toMinute(lastDungeonTime);
      if (diff < 180 && diff >= 0) {
        setDungeonCooldownLeft(180 - diff); // sisa menit
      } else {
        setDungeonCooldownLeft(0);
      }
    } else {
      setDungeonCooldownLeft(0);
    }
  }, [currentMinute, currentHour, currentDayIndex]);



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
    if (showMinigame || showChopMinigame) return;

    if (canInteractDungeon && dungeonCooldownLeft > 0) return;


    if (nearForestNPC && !showForestNPCDialog) {
      addNPCInteract("ForestNPC");
      setShowForestNPCDialog(true);
      setForestDialogState({ stage: 0, textIdx: 0 });
      return;
    }


      // --- Rope Pickup Logic ---
    if (nearRope && ropePos && !inventory.includes("Rope")) {
      setInventory(inv => {
        const newInv = addItemToInventory(inv, "Rope");
        // Simpan ke localStorage
        const saved = JSON.parse(localStorage.getItem("playerData")) || {};
        localStorage.setItem(
          "playerData",
          JSON.stringify({ ...saved, inventory: newInv })
        );
        return newInv;
      });

      setRopePos(null);

      // Update encyclopedia/discovered
      const discovered = JSON.parse(localStorage.getItem("discoveredItems") || "[]");
      if (!discovered.includes("Rope")) {
        discovered.push("Rope");
        localStorage.setItem("discoveredItems", JSON.stringify(discovered));
        setDiscoveredItems([...discovered]);
      }

      setShowRopeBanner(true); // <-- Tambahkan ini
      return;
    }



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
      // Ambil waktu terakhir masuk dungeon (dalam satuan jam dan menit game)
      const lastDungeonTimeRaw = localStorage.getItem("lastDungeonEntry");
      let canEnter = true;
      if (lastDungeonTimeRaw) {
        const lastDungeonTime = JSON.parse(lastDungeonTimeRaw); // { hour, minute, day }
        let curr = { day: currentDayIndex, hour: currentHour, minute: currentMinute };
        // Konversi semua ke menit sejak hari Senin jam 00:00
        const toMinute = t => (t.day * 24 * 60) + (t.hour * 60) + t.minute;
        const diff = toMinute(curr) - toMinute(lastDungeonTime);
        if (diff < 180 && diff >= 0) { // Kurang dari 3 jam (180 menit) sejak terakhir masuk
          canEnter = false;
        }
      }

      if (!canEnter) {
        setDungeonTorchNotif(true);
        setDungeonTorchNotifFade(false);
        setTimeout(() => setDungeonTorchNotifFade(true), 2000);
        setTimeout(() => setDungeonTorchNotif(false), 2500);
        // Ganti isi notifikasinya (lihat bawah)
        setCustomDungeonMsg("Dungeon is sealed. Come back in 3 in-game hours!");
        return;
      }

      if (inventory.includes("Torch")) {
        addActivity("Dungeon Minigame");   // <-- ACTIVITY
        addVisitedArea("Dungeon");         // <-- AREA
        // Simpan waktu sekarang ke localStorage
        localStorage.setItem("lastDungeonEntry", JSON.stringify({
          hour: currentHour,
          minute: currentMinute,
          day: currentDayIndex
        }));
        // Simpan posisi terakhir sebelum ke Dungeon
        localStorage.setItem("lastForestPosition", JSON.stringify(position));
        saveGameState();
        navigate('/dungeon');
      } else {
        setDungeonTorchNotif(true);
        setDungeonTorchNotifFade(false);
        setTimeout(() => setDungeonTorchNotifFade(true), 2000);
        setTimeout(() => setDungeonTorchNotif(false), 2500);
        setCustomDungeonMsg("You need a torch to enter the dungeon!");
      }
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
    if (showForestNPCDialog) return "";
    if (nearForestNPC) return "🌲 Press Interact to talk to Forest Sage";
    if (canInteractFruit) return "🍎 Press Interact to pick wild fruit";
    if (canInteractWood) return "🪓 Press Interact to chop wood";
    if (canInteractDungeon) return "🕳️ Press Interact to enter dungeon";
    if (nearRope && ropePos && !inventory.includes("Rope")) return "🪢 Press Interact to pick up Rope";
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
        setInventory(prev => addItemToInventory(prev, "Wild Fruit"));
        addActivity("Wild Fruit Minigame");
        setStatus(prev => ({ ...prev, happiness: Math.min(prev.happiness + 20, 100) }));
      } else {
        setStatus(prev => ({ ...prev, happiness: Math.max(prev.happiness - 20, 0) }));
      }
    }, 800);
  };

  const keysPressed = useRef({});

  const handleAnalog = (key, value) => {
    keysPressed.current[key] = value;
  };


  return (
    <>
  <audio
    ref={audioRef}
    src={forestMusic}
    autoPlay
    loop
  />
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

        <img
          src={forestNPCImg}
          alt="Forest NPC"
          className="map-npc"
          style={{
            position: "absolute",
            left: forestNPCPos.x,
            top: forestNPCPos.y,
            width: 64,
            height: 64,
            zIndex: nearForestNPC ? 1 : 11,
            imageRendering: "pixelated",
            filter: showForestNPCDialog ? "brightness(0.7)" : "none",
            transition: "filter 0.2s"
          }}
          draggable={false}
        />


        {/* Visualisasi Zona Interaksi */}
        {/*
        <div
          style={{
            position: "absolute",
            left: fruitTree.x - fruitTree.rx,
            top: fruitTree.y - fruitTree.ry,
            width: fruitTree.rx * 2,
            height: fruitTree.ry * 2,
            backgroundColor: "rgba(255, 0, 0, 0.3)", 
            border: "2px dashed red",
            zIndex: 3,
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "absolute",
            left: woodTree.x - woodTree.rx,
            top: woodTree.y - woodTree.ry,
            width: woodTree.rx * 2,
            height: woodTree.ry * 2,
            backgroundColor: "rgba(0, 128, 0, 0.3)", 
            border: "2px dashed green",
            zIndex: 3,
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "absolute",
            left: dungeonZone.x - dungeonZone.rx,
            top: dungeonZone.y - dungeonZone.ry,
            width: dungeonZone.rx * 2,
            height: dungeonZone.ry * 2,
            backgroundColor: "rgba(0, 0, 255, 0.3)", 
            border: "2px dashed blue",
            zIndex: 3,
            pointerEvents: "none"
          }}
        />
        */}


        {ropePos && !inventory.includes("Rope") && (
          <img
            src={itemIcons["Rope"]}
            alt="Rope"
            className="map-item"
            style={{
              position: "absolute",
              left: ropePos.x,
              top: ropePos.y,
              width: 40,
              height: 40,
              zIndex: 12
            }}
          />
        )}


        <div className="fruit-block-zone"></div>
        <div className="wood-block-zone"></div>
        <div className="dungeon-block-zone"></div>

        {/* Persegi panjang bagian atas */}
        <div className="zone-top-rect"></div>
        <div className="zone-top-rect-b"></div>
        <div className="zone-top-rect-c"></div>

        {/* Segitiga siku-siku kiri bawah */}
        <div className="zone-bottom-left-triangle"></div>

        {/* Segitiga terbalik di tengah (2x) */}
        <div className="zone-mid-inverted-triangle1"></div>
        <div className="zone-mid-inverted-triangle2"></div>

        {/* Segitiga siku-siku kanan bawah (2x) */}
        <div className="zone-bottom-right-triangle1"></div>



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

          {nearForestNPC && !showForestNPCDialog && (
            <button
              className="event-button"
              style={{
                position: "absolute",
                left: forestNPCPos.x - offsetX,
                top: forestNPCPos.y - offsetY + 70,
                zIndex: 100
              }}
              onClick={() => {
                setShowForestNPCDialog(true);
                setForestDialogState({ stage: 0, textIdx: 0 });
              }}
            >
              Interact
            </button>
          )}

          {showForestNPCDialog && (
            <div className="coconut-overlay" style={{ background: "rgba(0,0,0,0.87)", zIndex: 350 }}>
              <ForestNPCDialogPanel
                state={forestDialogState}
                setState={setForestDialogState}
                setShowDialog={setShowForestNPCDialog}
                characterSprite={character?.sprite}
                username={username}
              />
            </div>
          )}

          {dungeonTorchNotif && (
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
                opacity: dungeonTorchNotifFade ? 0 : 1,
                transition: "opacity 0.42s",
                userSelect: "none",
                background: "none"
              }}
            >
              You need a torch to enter the dungeon!
            </div>
          )}



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
                          // Buang bahan
                          Object.entries(materialCounts).forEach(([mat, qty]) => {
                            for (let i = 0; i < qty; i++) {
                              const idx = newInv.indexOf(mat);
                              if (idx !== -1) newInv.splice(idx, 1);
                            }
                          });
                          let newMoney = money;
                          if (recipe.gold) newMoney -= recipe.gold;
                          // Tambahkan hasil craft (jika slot masih ada)
                          newInv = addItemToInventory(newInv, recipe.result);
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
        {!showForestNPCDialog && (
          <button
            className="event-button"
            onClick={handleInteract}
            disabled={canInteractDungeon && dungeonCooldownLeft > 0}
            style={{
              opacity: canInteractDungeon && dungeonCooldownLeft > 0 ? 0.65 : 1,
              cursor: canInteractDungeon && dungeonCooldownLeft > 0 ? "not-allowed" : "pointer",
              color: canInteractDungeon && dungeonCooldownLeft > 0 ? "#ff4545" : undefined // Merah saat cooldown
            }}
          >
            {canInteractDungeon && dungeonCooldownLeft > 0
              ? (() => {
                  const min = dungeonCooldownLeft % 60;
                  const hour = Math.floor(dungeonCooldownLeft / 60);
                  const str = hour > 0 ? `${hour}:${min.toString().padStart(2, "0")}` : `${min}m`;
                  return `Dungeon sealed: ${str} left`;
                })()
              : "Interact"}
          </button>

        )}
      </div>

      </>
      )}

      {showRopeBanner && (
        <div className="coconut-overlay result">
          <div className="obtained-banner" style={{ backgroundImage: `url(${scrollBanner})` }}>
            <div className="obtained-text">
              You found a Rope!
            </div>
            <img
              src={itemIcons["Rope"]}
              alt="Rope"
              className="coconut-icon"
            />
            <div className="item-name">Rope</div>
            <button className="ok-button" onClick={() => setShowRopeBanner(false)}>OK</button>
          </div>
        </div>
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

          <div
            className="minigame-arrows"
            style={{
              position: "absolute",
              left: "50%",
              bottom: 60,
              transform: "translateX(-50%)",
              display: "flex",
              gap: 40,
              zIndex: 1200,
              pointerEvents: "auto",
            }}
          >
            <button
              className="minigame-arrow-btn"
              style={{
                width: 60, height: 60, borderRadius: "50%",
                background: "#e2c070", border: "2px solid #aa9841",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onTouchStart={() => setLeftPressed(true)}
              onTouchEnd={() => setLeftPressed(false)}
              onMouseDown={() => setLeftPressed(true)}
              onMouseUp={() => setLeftPressed(false)}
            >
              <img src={arrowLeft} alt="Left" style={{ width: 38, height: 38 }} />
            </button>
            <button
              className="minigame-arrow-btn"
              style={{
                width: 60, height: 60, borderRadius: "50%",
                background: "#e2c070", border: "2px solid #aa9841",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onTouchStart={() => setRightPressed(true)}
              onTouchEnd={() => setRightPressed(false)}
              onMouseDown={() => setRightPressed(true)}
              onMouseUp={() => setRightPressed(false)}
            >
              <img src={arrowRight} alt="Right" style={{ width: 38, height: 38 }} />
            </button>
          </div>

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
              <div className="minigame-hint">Click on the screen quickly to chop the tree!</div>
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
                          const newInv = addItemToInventory(prev, "Wood");
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
                        addActivity("Chop Wood");

                      }

                  }, 800);
                }}>OK</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}

function ForestNPCDialogPanel({ state, setState, setShowDialog, characterSprite, username }) {
  // Dialog branch, dialogScript = [ [dialogAwal], [Secrets], [Challenge], [Nevermind] ]
  const dialogScript = [
    // Awal interaksi (pilihan)
    [
      { npc: "Welcome, child. The forest sees many, but remembers few." },
      { npc: "Ask your questions, if you seek truth." },
      { choice: true }
    ],
    // Secrets?
    [
      { player: "What secrets does the forest hide?" },
      { npc: "You may find ropes scattered across the forest floor." },
      { npc: "Ropes can be used for many things—sometimes, they’re the key to crafting something even more valuable." },
      { player: "So I should collect them?" },
      { npc: "Indeed. Explore with care; what seems ordinary may prove essential." }
    ],

    // Challenge?
    [
      { player: "I want a challenge." },
      { npc: "The forest’s true trial lies in its darkness below—a dungeon hidden from the careless." },
      { player: "How do I enter?" },
      { npc: "You’ll need a torch. Light will guide you in the shadows. Without it, you’ll be lost." },
      { npc: "Find or craft a torch, then search for the entrance beneath the ancient willow." }
    ],
    // Nevermind
    [
      { player: "Nevermind." },
      { npc: "Then walk freely. Curiosity may yet find you again." }
    ]
  ];

  const choices = [
    "Secrets?",
    "Challenge?",
    "Nevermind."
  ];

  const [shownText, setShownText] = React.useState("");
  const textDone = React.useRef(true);

  const d = dialogScript[state.stage][state.textIdx];

  // Animasi mengetik
  React.useEffect(() => {
    setShownText("");
    textDone.current = false;
    if (!d) return;
    let idx = 0;
    function type() {
      setShownText(d.npc?.slice(0, idx) || d.player?.slice(0, idx) || "");
      if (idx < (d.npc?.length || d.player?.length || 0)) {
        idx++;
        setTimeout(type, 16 + Math.random() * 12);
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
    if (state.textIdx < dialogScript[state.stage].length - 1) {
      setState({ ...state, textIdx: state.textIdx + 1 });
    } else {
      // Setelah branch selesai, kembali ke menu pilihan
      if (state.stage === 3) {
        setShowDialog(false);
      } else {
        setState({ stage: 0, textIdx: dialogScript[0].length - 1 });
      }
    }
  }

  // Pilihan menu utama
  if (state.stage === 0 && d?.choice) {
    return (
      <div className="npc-dialog-panel" style={{ display: "flex", width: 740, height: 320, background: "rgba(0,0,0,0.87)", borderRadius: 32, alignItems: "center", boxShadow: "0 3px 60px #000a" }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={forestNPCImg} alt="Forest NPC" style={{ width: 165, height: 165, objectFit: "contain" }} />
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
              backgroundPosition: "0px 0px",
              backgroundSize: "128px 128px",
              imageRendering: "pixelated",
              transform: "scale(5.15)",
              transformOrigin: "center"
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Render dialog (branch)
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
        <img src={forestNPCImg} alt="Forest NPC" style={{ width: 165, height: 165, objectFit: "contain" }} />
        <div style={{ color: "#b1ffd6", fontSize: 15, marginTop: 8, opacity: 0.82 }}>Forest Sage</div>
      </div>
      <div style={{ flex: 2.1, minHeight: 60, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {d.npc ? (
          <div style={{
            background: "rgba(70,110,70,0.18)",
            borderRadius: 14,
            fontSize: 19,
            color: "#e0ffd4",
            padding: "23px 26px",
            margin: "0 6px",
            fontFamily: "inherit",
            textAlign: "left"
          }}>
            <b style={{ color: "#afe7c2", fontSize: 17 }}>Forest Sage</b>
            <br />
            <span style={{ transition: "all 0.12s", display: "block", textAlign: "left" }}>{shownText}</span>
            {!textDone.current && <span className="writing-cursor" style={{ color: "#a1ffc7", fontWeight: "bold", marginLeft: 1 }}>|</span>}
          </div>
        ) : (
          <div style={{
            background: "rgba(70,110,70,0.18)",
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
            {!textDone.current && <span className="writing-cursor" style={{ color: "#b8ffd0", fontWeight: "bold", marginLeft: 1 }}>|</span>}
          </div>
        )}
        <div style={{ fontSize: 12, color: "#e6d9a7", margin: "10px 0 0 8px" }}>Click to continue…</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="player-dialog-sprite" style={{
          width: 32,
          height: 32,
          background: `url(${characterSprite})`,
          backgroundPosition: "0px 0px",
          backgroundSize: "128px 128px",
          imageRendering: "pixelated",
          transform: "scale(5.15)",
          transformOrigin: "center"
        }}></div>
        <div style={{ color: "#a4f1fd", fontSize: 15, marginTop: 8, opacity: 0.81 }}>{username}</div>
      </div>
    </div>
  );
}
