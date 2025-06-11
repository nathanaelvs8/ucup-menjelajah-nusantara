import React, { useRef, useState, useEffect } from "react";
import "./Secret.css";
import craftingRecipes from "./CraftingRecipes.js";
import { getGreeting } from "./utils";
import { addItemToInventory } from "./utils";
import { addNPCInteract } from "./utils"; // Import di paling atas (jika belum)
import Inventory from './Inventory.jsx';
import { itemIcons, itemDetails } from "./Inventory.jsx";
import inventoryIcon from "../assets/ui/Inventory.png";
import CraftIcon from "../assets/ui/Craft.png";
import EncyclopediaIcon from "../assets/ui/Encyclopedia.png";
import arrowUp from "../assets/ui/ArrowUP.png";
import arrowDown from "../assets/ui/ArrowDOWN.png";
import arrowLeft from "../assets/ui/ArrowLEFT.png";
import arrowRight from "../assets/ui/ArrowRIGHT.png";
import SecretMapImg from "../assets/map/Secret.jpg";
import hungryIcon from "../assets/ui/Hunger.png";
import sleepIcon from "../assets/ui/Sleep.png";
import happyIcon from "../assets/ui/Happiness.png";
import cleanIcon from "../assets/ui/Cleanliness.png";
import AngelNPCImg from "../assets/NPC/AngelNPC.jpg";
import secret1 from "../assets/audio/secret1.mp3";
import secret2 from "../assets/audio/secret2.mp3";


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

function RitualCircleAnim({ centerX, centerY, onFinish }) {
  const [radius, setRadius] = React.useState(0);

  useEffect(() => {
    const maxRadius = 400;    // JAUH LEBIH BESAR! (boleh ubah sampai 600 kalau ingin super gede)
    const animDuration = 5000; // 5 detik = 5000ms
    const start = Date.now();

    function animate() {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / animDuration);
      setRadius(progress * maxRadius);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(onFinish, 800); // tunggu sebentar, lalu trigger finish
      }
    }
    animate();
  }, [onFinish]);

  return (
    <div
      style={{
        position: "absolute",
        left: centerX - radius,
        top: centerY - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        border: "8px solid orange",
        boxShadow: `0 0 120px 60px #ff670055, 0 0 280px 20px #ffae1f33`,
        background: "radial-gradient(circle, #f7ad43cc 55%, #b0270a99 97%, transparent 100%)",
        zIndex: 999,
        pointerEvents: "none"
      }}
    />
  );
}

function CharDialogSprite({ character }) {
  if (!character || !character.sprite) return null;
  return (
    <div
      className="player-dialog-sprite"
      style={{
        width: 32,
        height: 32,
        background: `url(${character.sprite})`,
        backgroundPosition: "0px 0px",
        backgroundSize: "128px 128px",  // ganti sesuai ukuran sheet
        imageRendering: "pixelated",
        transform: "scale(5.15)",      // bikin frame 32x32 tampil ~165x165px
        transformOrigin: "center"
      }}
    ></div>
  );
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

  const secretBoxArea = { x: 450, y: 1600, w: 100, h: 180 }; // Ganti sesuai kebutuhan
  const [nearSecretBox, setNearSecretBox] = useState(false);

  const angelNPCPos = { x: 2330, y: 1640 }; // Ganti sesuai kebutuhan

  // Setelah deklarasi angelNPCPos
  const [angelFloatY, setAngelFloatY] = useState(0);
  const [angelFrame, setAngelFrame] = useState(0);

  const [showAngelDialog, setShowAngelDialog] = useState(false);
  const [angelDialogState, setAngelDialogState] = useState({ stage: 0, textIdx: 0 });

  const [showRitualAnim, setShowRitualAnim] = useState(false);
  const [ritualCirclePermanent, setRitualCirclePermanent] = useState(false);

  const hasTalisman = inventory.includes("Archipelago Talisman");

  const [angelDone, setAngelDone] = useState(false);

  const [, forceUpdate] = useState(0);

  const [finalRitualAnim, setFinalRitualAnim] = useState(false);
  const [finalAnimPhase, setFinalAnimPhase] = useState(0); // 0: idle, 1: angel jalan ke char, 2: naik bareng
  const [angelFinalPos, setAngelFinalPos] = useState({ ...angelNPCPos });
  const [charFinalPos, setCharFinalPos] = useState({ ...position });


  const openInventory = () => {
    forceUpdate(v => v + 1);   // trigger re-render
    setInventoryVisible(true);
  };


  // Nilai sesuai posisi dan oval ritual kamu (tengah angel)
  const ritualCircleRadius = 520; // set ke setengah diameter lingkaran permanenmu (misal 1040 / 2)
  const ritualCircleCenterX = angelNPCPos.x + 40;
  const ritualCircleCenterY = angelNPCPos.y + 32;

  // Apakah player di dalam lingkaran ritual?
  const charCenterX = position.x + SPRITE_SIZE / 2;
  const charCenterY = position.y + SPRITE_SIZE / 2;
  const inRitualCircle = (
    Math.sqrt(
      Math.pow(charCenterX - ritualCircleCenterX, 2) +
      Math.pow(charCenterY - ritualCircleCenterY, 2)
    ) <= ritualCircleRadius
  );

  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (ritualCirclePermanent) {
      audioRef.current.pause();
      audioRef.current.src = secret2;
      audioRef.current.currentTime = 0;
      audioRef.current.load();
      setTimeout(() => {
        audioRef.current.play().catch(() => {});
      }, 1);
    } else {
      audioRef.current.pause();
      audioRef.current.src = secret1;
      audioRef.current.currentTime = 0;
      audioRef.current.load();
      setTimeout(() => {
        audioRef.current.play().catch(() => {});
      }, 1);
    }
  }, [ritualCirclePermanent]);


  useEffect(() => {
    let frame = 0;
    let up = true;
    let floatY = 0;
    const animate = () => {
      // Animasi frame setiap 500ms
      setAngelFrame((f) => (f + 1) % 4);
      // Animasi naik turun (wave sinus)
      floatY = Math.round(Math.sin(Date.now() / 500) * 10); // naik-turun max 10px
      setAngelFloatY(floatY);
      setTimeout(animate, 160); // 160ms untuk animasi frame, cukup smooth
    };
    animate();
    return () => {}; // Tidak perlu clearTimeout karena state update
  }, []);

  const angelInteractArea = {
    x: angelNPCPos.x - 40,
    y: angelNPCPos.y - 32,
    w: 140,
    h: 120
  };
  const [nearAngel, setNearAngel] = useState(false);

  useEffect(() => {
    const charCenterX = position.x + SPRITE_SIZE / 2;
    const charCenterY = position.y + SPRITE_SIZE / 2;
    const near =
      charCenterX >= angelInteractArea.x &&
      charCenterX <= angelInteractArea.x + angelInteractArea.w &&
      charCenterY >= angelInteractArea.y &&
      charCenterY <= angelInteractArea.y + angelInteractArea.h;
    setNearAngel(near);
  }, [position]);



  const handleUseItem = (itemName) => {
    const itemIndex = inventory.findIndex(item => item === itemName);
    if (itemIndex === -1) return;
    
    if (itemName === "Archipelago Talisman") {
      setInventoryVisible(false); // Tutup inventory/modal dulu
      setShowCraftModal(false);
      setShowEncyclopedia(false);

      // Setelah modal tertutup, tunggu 2 detik, baru mulai animasi final
      setTimeout(() => {
        setFinalRitualAnim(true);
        setFinalAnimPhase(1); // mulai animasi angel jalan ke char
        setAngelFinalPos({ ...angelNPCPos });
        setCharFinalPos({ ...position });
      }, 2000);

      return;
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

  useEffect(() => {
    // Deteksi karakter dekat area kotak
    const charCenterX = position.x + SPRITE_SIZE / 2;
    const charCenterY = position.y + SPRITE_SIZE / 2;
    const near =
      charCenterX >= secretBoxArea.x &&
      charCenterX <= secretBoxArea.x + secretBoxArea.w &&
      charCenterY >= secretBoxArea.y &&
      charCenterY <= secretBoxArea.y + secretBoxArea.h;
    setNearSecretBox(near);
  }, [position]);

  useEffect(() => {
    if (!finalRitualAnim) return;
    if (finalAnimPhase === 1) {
      // Angel bergerak ke posisi karakter
      const speed = 7.5;
      const interval = setInterval(() => {
        setAngelFinalPos(angel => {
          const dx = charFinalPos.x - angel.x;
          const dy = charFinalPos.y - angel.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < speed) {
            setFinalAnimPhase(2); // next: naik bareng
            return { ...angel, x: charFinalPos.x, y: charFinalPos.y };
          }
          return {
            x: angel.x + (dx / dist) * speed,
            y: angel.y + (dy / dist) * speed
          };
        });
      }, 16);
      return () => clearInterval(interval);
    }
    if (finalAnimPhase === 2) {
      // Angel dan char naik ke langit
      let step = 0;
      function goUp() {
        setAngelFinalPos(angel => ({ ...angel, y: angel.y - 7 }));
        setCharFinalPos(char => ({ ...char, y: char.y - 7 }));
        step += 1;
        if (step > 100) {
          setTimeout(() => {
            localStorage.setItem("gameFinished", "true");
            window.location.href = "/ending";
          }, 1100);
        } else {
          requestAnimationFrame(goUp);
        }
      }
      goUp();
    }
  }, [finalRitualAnim, finalAnimPhase]);


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
    const savedData = JSON.parse(localStorage.getItem("playerData")) || {};

    if (lastPos) {
      // Buat object baru, copy semua data player lama tapi posisi diganti!
      const newData = {
        ...savedData,
        position: lastPos,
        status,
        money,
        inventory,
        character,
        currentMinute,
        currentHour,
        currentDayIndex
      };
      localStorage.setItem("playerData", JSON.stringify(newData));
    }

      window.location.href = "/gameplay";
    }


  // Format waktu
  const formatTime = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  return (
    <div className="viewport">
      <div className="ritual-overlay-animate" />

    <audio ref={audioRef} autoPlay loop />

    {!hasTalisman && !inventoryVisible && !showCraftModal && !showEncyclopedia && (
      <div className="talisman-warning">
        You can’t do anything here without the <span className="talisman-highlight">Archipelago Talisman</span>.
      </div>
    )}


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

      {(hasTalisman || finalRitualAnim) && (
        <div
          className="angel-npc"
          style={{
            position: "absolute",
            left: finalRitualAnim ? angelFinalPos.x : angelNPCPos.x,
            top: finalRitualAnim ? angelFinalPos.y : (angelNPCPos.y + angelFloatY),
            width: 80,
            height: 64,
            backgroundImage: `url(${AngelNPCImg})`,
            backgroundPosition: `-${angelFrame * 80}px 0px`,
            imageRendering: "pixelated",
            zIndex: 40,
            pointerEvents: "none"
          }}
        />
      )}


            {/* Lingkaran ritual (animasi & permanen) — DILETAKKAN DI ATAS, SEBELUM PLAYER DAN ANGEL */}
        {(showRitualAnim || ritualCirclePermanent) && (
          <div
            className="ritual-fire-circle"
            style={{
              left: angelNPCPos.x + 40 - 520,
              top: angelNPCPos.y + 32 - 520,
            }}
          >
          <div className="ritual-fire-border"></div> 
            <div className="ritual-fire-outer"></div>
            <div className="ritual-fire-inner"></div>
          </div>
        )}



      {character && (
        <div
          className="character"
          style={{
            left: finalRitualAnim ? charFinalPos.x : position.x,
            top: finalRitualAnim ? charFinalPos.y : position.y,
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
  {!finalRitualAnim && (
  <>
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
    </>
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
              onUseItem={handleUseItem}
              onSellItem={handleSellItem}
              canUseTalisman={angelDone && inRitualCircle && hasTalisman}
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
                    let newInv = [...inventory];
                    Object.entries(materialCounts).forEach(([mat, qty]) => {
                      for (let i = 0; i < qty; i++) {
                        const idx = newInv.indexOf(mat);
                        if (idx !== -1) newInv.splice(idx, 1);
                      }
                    });
                    let newMoney = money;
                    if (recipe.gold) newMoney -= recipe.gold;
                    // Tambah hasil crafting PAKAI HELPER!
                    newInv = addItemToInventory(newInv, recipe.result);
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
      <p className="event-text">
        {angelDone && hasTalisman && inRitualCircle
          ? "✨ Stand in the ritual circle and use the Archipelago Talisman from your inventory to perform the final ritual!"
          : hasTalisman && nearAngel && !angelDone
          ? "👼 Press Interact to talk to the Seraphille"
          : nearSecretBox
          ? "⛵ Press Interact to return to the first island"
          : "📍 Explore the Isle of the Sacred Oath."}
      </p>

      <button
        className="event-button"
        onClick={() => {
          if (angelDone) return;
          if (hasTalisman && nearAngel && !angelDone) {
            addNPCInteract("SecretNPC");
            // Jika ritualCirclePermanent sudah true, dialog ke-2!
            if (ritualCirclePermanent) {
              setShowAngelDialog(true);
              setAngelDialogState({ stage: 99, textIdx: 0 }); // stage 99 khusus suruh pakai talisman
            } else {
              setShowAngelDialog(true);
              setAngelDialogState({ stage: 0, textIdx: 0 }); // dialog tree utama
            }
          } else if (nearSecretBox) {
            handleInteract();
          }
        }}
        disabled={angelDone}
      >
        Interact
      </button>

      </div>

      {showAngelDialog && (
        <div className="coconut-overlay" style={{ background: "rgba(0,0,0,0.87)", zIndex: 350 }}>
        <AngelNPCDialogPanel
          state={angelDialogState}
          setState={setAngelDialogState}
          setShowDialog={setShowAngelDialog}
          username={username}
          character={character}
          onRitual={() => {
            setShowRitualAnim(true);
            setAngelDone(true); // <--- Kunci interaksi BEGITU ritual dimulai!
          }}
        />

        </div>
      )}

      {showRitualAnim && (
        <RitualCircleAnim
          centerX={angelNPCPos.x + 40}
          centerY={angelNPCPos.y + 32}
          onFinish={() => {
            setShowRitualAnim(false);
            setRitualCirclePermanent(true);
          }}
        />

      )}

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
// AngelNPCDialogPanel.jsx (bisa juga inline di Secret.jsx)
function AngelNPCDialogPanel({ state, setState, setShowDialog, username, onRitual, character }) {
  // Dialog script struktur tree, bisa modif sesuai keperluan
  const dialogScript = [
    // 0. Introduction
    [
      { npc: "Ah, you’ve made it to the end of your journey. This island is unlike any other, isn’t it?" },
      { choice: true }
    ],
    // 1. "What do I do now?" branch
    [
      { player: "What do I do now?" },
      { npc: "You hold the Archipelago Talisman, the key to returning home. But to activate its power, you must perform the final ritual." },
      { npc: "I have prepared a sacred circle here. When you are ready, stand within the circle and use the talisman." },
      { choice: true }
    ],
    // 2. Begin the ritual
    [
      { player: "Begin the ritual." },
      { npc: "Very well. Focus your heart on where you truly wish to go. The talisman will respond to your resolve." },
      { npc: "Once the ritual is complete, your journey here will end. Are you ready?" },
      { ritual: true }
    ],
    // 3. Nevermind from any menu
    [
      { player: "Nevermind." },
      { npc: "Of course. Take your time. I will be here if you change your mind." },
      { end: true }
    ],
    
  ];

  const choicesArr = [
    ["What do I do now?", "Nevermind."], // after intro
    ["Begin the ritual.", "Nevermind."], // after info
  ];

  // Penanda branching
  let choices = [];
  if (state.stage === 0) choices = choicesArr[0];
  if (state.stage === 1) choices = choicesArr[1];

  const d = dialogScript[state.stage][state.textIdx];
  const [shownText, setShownText] = React.useState("");
  const textDone = React.useRef(true);

  // TYPING EFFECT
  React.useEffect(() => {
    setShownText("");
    textDone.current = false;
    if (!d) return;
    let idx = 0;
    function type() {
      setShownText(d.npc?.slice(0, idx) || d.player?.slice(0, idx) || "");
      if (idx < (d.npc?.length || d.player?.length || 0)) {
        idx++;
        setTimeout(type, 16 + Math.random() * 15);
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
    // Dialog End
    if (d?.end) {
      setShowDialog(false);
      return;
    }
    // Ritual trigger (implement di parent component)
    if (d?.ritual) {
      setShowDialog(false);
      if (typeof onRitual === "function") onRitual();
      return;
    }
    // Kalau ada pilihan (choice)
    if (d?.choice) return;

    if (state.textIdx < dialogScript[state.stage].length - 1) {
      setState({ ...state, textIdx: state.textIdx + 1 });
    }
  }

  // Render panel pilihan
  if (d?.choice) {
    return (
      <div className="npc-dialog-panel" style={{ display: "flex", width: 740, height: 320, background: "rgba(0,0,0,0.87)", borderRadius: 32, alignItems: "center", boxShadow: "0 3px 60px #000a" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <div className="angel-npc-dialog-img" />
          <div style={{ color: "#ffeecb0", fontSize: 15, marginTop: 8, opacity: 0.82 }}>Seraphelle</div>
        </div>
        <div style={{ flex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 22, color: "#ffe69c", margin: "12px 0 16px" }}>
            What do you want to do?
          </div>
          {choices.map((ch, i) => (
            <button
              key={i}
              className="event-button"
              style={{ fontSize: 17, marginBottom: 7, width: 320 }}
              onClick={() => {
                if (state.stage === 0) {
                  setState({ stage: i === 0 ? 1 : 3, textIdx: 0 });
                } else if (state.stage === 1) {
                  setState({ stage: i === 0 ? 2 : 3, textIdx: 0 });
                }
              }}
            >
              {ch}
            </button>
          ))}
        </div>
        {/* Tambah username di bawah char kanan */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ height: 128, width: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CharDialogSprite character={character} />
          </div>
          <div style={{ color: "#ffeecb0", fontSize: 15, marginTop: 8, opacity: 0.82 }}>{username}</div>
        </div>
      </div>
    );
  }


  // Render dialog bubble
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
        cursor: "pointer"
      }}
      onClick={handleDialogClick}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="angel-npc-dialog-img" />
        <div style={{ color: "#ffeecb0", fontSize: 15, marginTop: 8, opacity: 0.82 }}>Seraphelle</div>
      </div>
      <div style={{ flex: 2.1, minHeight: 60, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{
          background: "rgba(70,50,10,0.18)",
          borderRadius: 14,
          fontSize: 19,
          color: d.npc ? "#ffeec9" : "#aaf4fd",
          padding: "23px 26px",
          margin: "0 6px",
          fontFamily: "inherit",
          textAlign: d.npc ? "left" : "right"
        }}>
          <b style={{ color: "#ffe69c", fontSize: 17 }}>{d.npc ? "Seraphelle" : username}</b>
          <br />
          <span style={{ transition: "all 0.12s", display: "block" }}>{shownText}</span>
          {!textDone.current && <span className="writing-cursor" style={{ color: "#ffd868", fontWeight: "bold", marginLeft: 1 }}>|</span>}
        </div>
        <div style={{ fontSize: 12, color: "#e6d9a7", margin: "10px 0 0 8px" }}>Click to continue…</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ height: 128, width: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CharDialogSprite character={character} />
        </div>
        <div style={{ color: "#ffeecb0", fontSize: 15, marginTop: 8, opacity: 0.82 }}>{username}</div>
      </div>

    </div>
  );
}
