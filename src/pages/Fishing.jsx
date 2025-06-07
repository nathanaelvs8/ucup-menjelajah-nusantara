import React, { useState, useEffect, useRef } from "react";
import alatPancing from "../assets/images/alatpancing.png";
import kailPancing from "../assets/images/kail.png";
import "./Fishing.css";
import { getGreeting } from "./utils";
import { addItemToInventory } from "./utils";
import { itemDetails } from "./Inventory.jsx";
import { addActivity } from "./utils";
import inventoryIcon from "../assets/ui/Inventory.png";
import Inventory from './Inventory.jsx'; 
import { useNavigate } from "react-router-dom";
import lakeAudio from "../assets/audio/Lake.mp3";

export default function Fishing() {
  const [stage, setStage] = useState(1); // 1: power, 2: wait, 3: catch
  const [power, setPower] = useState(0);
  const [charging, setCharging] = useState(false);
  const [caught, setCaught] = useState(false);
  const [startCatchTime, setStartCatchTime] = useState(null);
  const [catchProgress, setCatchProgress] = useState(0); // 0-100
  const [fishIndicatorPos, setFishIndicatorPos] = useState(50);
  const fishIndicatorPosRef = useRef(50); // Ref untuk posisi indikator terkini
  const [controlBarPos, setControlBarPos] = useState(50);
  const [currentFish, setCurrentFish] = useState(null);
  const [inventory, setInventory] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("playerData")) || {};
    return saved.inventory || [];
  });
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [showExclamation, setShowExclamation] = useState(false);
  const [kailTop, setKailTop] = useState("10px"); // posisi kail
  const kailTopPx = `${(parseFloat(kailTop) / 100) * window.innerHeight}px`;
  const alatPancingTop = 10; 
  const lineHeight = parseFloat(kailTop) - alatPancingTop;
  const alatPancingBottom = 40; 
  const [kailBottom, setKailBottom] = useState(`${alatPancingBottom}px`);
  const [holding, setHolding] = useState(false);
  const holdInterval = useRef(null);
  const navigate = useNavigate();
  const [notif, setNotif] = useState(""); 
  const intervalRef = useRef(null);
  const catchIntervalRef = useRef(null);
  const [autoMoveDirection, setAutoMoveDirection] = useState(-1); 
  const autoMoveSpeed = 2; 

  function showNotif(msg) {
    setNotif(msg);
    setTimeout(() => setNotif(""), 2200); // otomatis hilang setelah 2.2 detik
  }

  

  // Data ikan dan peluang per area
  const fishData = {
    Goldfish: { duration: 3000, speed: 2 },
    Tuna: { duration: 4000, speed: 4 },
    Megalodon: { duration: 6000, speed: 6 },
  };

  const areaChances = {
    dekat: { Goldfish: 0.75, Tuna: 0.20, Megalodon: 0.05 },
    sedang: { Goldfish: 0.45, Tuna: 0.45, Megalodon: 0.10 },
    jauh: { Goldfish: 0.35, Tuna: 0.40, Megalodon: 0.25 },
  };

  const areaZones = [
  { name: "dekat", top: 10, height: 200, color: "rgba(0, 123, 255, 0.3)" },  // 400px dari atas, tinggi 100px
  { name: "sedang", top: 200, height: 200, color: "rgba(255, 255, 0, 0.3)" }, // 500px dari atas, tinggi 150px
  { name: "jauh", top: 400, height: 200, color: "rgba(255, 0, 0, 0.3)" },     // 650px dari atas, tinggi 100px
];

const handleBackToGameplay = () => {
  navigate("/gameplay"); // Sesuaikan path jika berbeda
};


  // Tentukan area dari depth
  const getArea = (depth) => {
    if (depth < 210) return "dekat";
    if (depth < 400) return "sedang";
    return "jauh";
  };

  // Pilih ikan berdasar peluang area
  const chooseFish = (area) => {
    const chances = areaChances[area];
    const rnd = Math.random();
    let cumulative = 0;
    for (const fish in chances) {
      cumulative += chances[fish];
      if (rnd <= cumulative) return fish;
    }
    return "Goldfish";
  };

  // POWER BAR
  useEffect(() => {
    let interval;
    if (charging) {
      interval = setInterval(() => {
        setPower((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 20);
    }
    return () => clearInterval(interval);
  }, [charging]);

  // Simpan posisi indikator ikan di ref agar update selalu valid
  useEffect(() => {
    fishIndicatorPosRef.current = fishIndicatorPos;
  }, [fishIndicatorPos]);

  const handleCastStart = () => {
    if (stage !== 1) return;
    setCharging(true);
  };

  const handleBarClick = () => {
  // Geser bar hijau 20% ke kanan saat diklik
  setControlBarPos((prev) => Math.min(90, prev + 5));
};

  const handleCastRelease = () => {
    if (stage !== 1) return;
    setCharging(false);

const minTop = 10;     // Posisi awal (atas) area paling dekat (sama kayak areaZones[0].top)
const maxTop = 600;    // Posisi akhir (bawah) area paling jauh (sama kayak areaZones terakhir)
const depth = maxTop - ((power / 100) * (maxTop - minTop));
setKailTop(`${depth}px`);


    setStage(2);
    setShowExclamation(true);

    const delay = Math.random() * 3000 + 1000;
    setTimeout(() => {
      setShowExclamation(false);
      setStage(3);
      setStartCatchTime(Date.now());
      setCatchProgress(50); // Start di 50%
      setFishIndicatorPos(50);
      setControlBarPos(50);
      setCaught(false);

      const area = getArea(depth);
      const fish = chooseFish(area);
      setCurrentFish(fish);

      startCatchMechanic(fish);
    }, delay);
  };

 const startCatchMechanic = (fish) => {
  if (catchIntervalRef.current) clearInterval(catchIntervalRef.current);

  catchIntervalRef.current = setInterval(() => {
    // Update posisi ikan (tetap sama)
    setFishIndicatorPos((pos) => {
      let speed = fishData[fish]?.speed || 3;
      let nextPos = pos + (Math.random() > 0.5 ? 1 : -1) * speed;
      return Math.max(0, Math.min(100, nextPos));
    });

    // Update posisi bar hijau (bergerak otomatis ke kiri)
    setControlBarPos((prev) => {
      let newPos = prev + (autoMoveDirection * autoMoveSpeed);
      // Jika mencapai batas, balik arah
      if (newPos <= 10) {
        newPos = 10;
        setAutoMoveDirection(1); // Balik ke kanan
      } else if (newPos >= 90) {
        newPos = 90;
        setAutoMoveDirection(-1); // Balik ke kiri
      }
      return newPos;
    });

    // Update progress
    setCatchProgress((prog) => {
      const fishPos = fishIndicatorPosRef.current;
      const duration = fishData[fish]?.duration || 4000;
      const inc = 100 / (duration / 100);

      // Area hijau: width = 20%, sesuai style bar (left: controlBarPos - 10%)
      const greenZoneWidth = 20;
      const greenZoneStart = controlBarPos - greenZoneWidth / 2;
      const greenZoneEnd = controlBarPos + greenZoneWidth / 2;
      const inGreenZone = fishPos >= greenZoneStart && fishPos <= greenZoneEnd;

      if (inGreenZone) {
        return Math.min(prog + inc, 100);
      } else {
        const dec = inc * 1.5;
        return Math.max(0, prog - dec);
      }
    });

  }, 100);
};



  useEffect(() => {
    if (stage === 3) {
      if (catchProgress >= 100) {
        clearInterval(catchIntervalRef.current);
        showNotif(`🎉 You caught a ${currentFish}!`);

        setInventory((prev) => {
          const newInv = addItemToInventory(prev, currentFish);
          const saved = JSON.parse(localStorage.getItem("playerData")) || {};
          localStorage.setItem(
            "playerData",
            JSON.stringify({ ...saved, inventory: newInv })
          );
          return newInv;
        });
        addActivity("Fishing");


        setStage(1);
        setPower(0);
        setCaught(true);
      } else if (catchProgress <= 0) {
        clearInterval(catchIntervalRef.current);
        showNotif("🐟 Fish escaped!");
        setStage(1);
        setPower(0);
        setCaught(false);
      }
    }
  }, [catchProgress, currentFish, stage]);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(catchIntervalRef.current);
    };
  }, []);

  return (
    <>
    <audio
  src={lakeAudio}
  autoPlay
  loop
  ref={audio => { if (audio) audio.volume = 0.3; }}
  style={{ display: "none" }}
/>

      <div className="fishing-scene"onClick={handleBarClick}>
        <img src={alatPancing} alt="alat pancing" className="alat-pancing-scene" />

     <div
  className="fishing-line"
  style={{
    position: "absolute",
    top: kailTop,                    // dari kail
    left: "50%",
    width: "2px",
    height: `${600 - parseFloat(kailTop)}px`,   // 600 adalah Y alat pancing (ubah sesuai posisimu!)
    backgroundColor: "white",
    transform: "translateX(-50%)",
    zIndex: 5,
  }}
></div>


        {showExclamation && (
          <div
            style={{
              position: "absolute",
              top: kailTopPx,
              left: "50%",
              transform: "translate(-50%, -100%)",
              fontSize: "48px",
              color: "red",
              zIndex: 10,
            }}
          >
            ❗
          </div>
        )}

        <div className="water">
        <img
  src={kailPancing}
  alt="kail"
  className="kail-pancing-scene"
  style={{ top: kailTop }}
/>

        </div>



        

        <div className="land"></div>
      </div>

      <div className="ui-layer">
        <button
  onClick={handleBackToGameplay}
  style={{
    position: "fixed",
    top: "20px",
    left: "20px",
    padding: "10px 15px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    zIndex: 1000,
  }}
>
  Back
</button>

        <div className="status-money">
          <div className="money">🎣 Fishing Mode - Stage: {stage}</div>
          <button
            className="inventory-btn"
            onClick={() => setInventoryVisible(v => !v)}
          >
            <img src={inventoryIcon} alt="Inventory" />
          </button>
      {inventoryVisible && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setInventoryVisible(false)}
          />
          <div
            className="inventory-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="inventory-scroll-area" style={{ flex: 1, overflowY: 'auto', width: "100%" }}>
              <Inventory
                inventory={inventory}
                onUseItem={itemName => {
                  const idx = inventory.findIndex(it => it === itemName);
                  if (idx !== -1) {
                    const newInventory = [...inventory];
                    newInventory.splice(idx, 1);
                    setInventory(newInventory);
                    // Sync ke localStorage: hanya inventory, JANGAN status!
                    const saved = JSON.parse(localStorage.getItem("playerData")) || {};
                    localStorage.setItem(
                      "playerData",
                      JSON.stringify({ ...saved, inventory: newInventory })
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
                      showNotif("Item cannot be sold!");
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
              style={{
                position: 'absolute',
                top: 16,
                right: 18,
                background: '#e2c070',
                color: '#514116',
                border: 'none',
                fontWeight: 'bold',
                fontSize: 18,
                padding: '7px 16px',
                zIndex: 10
              }}
            >
              ✕
            </button>
          </div>
        </>
      )}

        </div>

        {stage === 1 && (
          <div className="powerbar-stage-vertical">
            <div className="power-bar-vertical">
              <div
                className="power-fill-vertical"
                style={{
                  height: `${power}%`,
                  background: `linear-gradient(to top, ${
                    power < 33 ? "#00ccff" : power < 66 ? "#00ff99" : "#ff4444"
                  }, #00ccff)`,
                }}
              ></div>
            </div>
            <button
              className="cast-button-bottom-right"
              onMouseDown={handleCastStart}
              onMouseUp={handleCastRelease}
              onTouchStart={handleCastStart}
              onTouchEnd={handleCastRelease}
            >
              🎯 Cast
            </button>
          </div>
        )}

        {stage === 2 && (
          <div style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "white",
            fontSize: "20px",
            textAlign: "center"
          }}>
            Waiting for fish... 🎣
          </div>
        )}

        {stage === 3 && (
          <div className="catch-stage">
            {/* Progress Bar */}
            <div style={{
              position: "absolute",
              top: "10vh",
              left: "50%",
              transform: "translateX(-50%)",
              width: "300px",
              height: "20px",
              backgroundColor: "#333",
              borderRadius: "10px",
              border: "2px solid white",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${catchProgress}%`,
                height: "100%",
                backgroundColor: catchProgress > 75 ? "#00ff00" : catchProgress > 50 ? "#ffff00" : "#ff0000",
                transition: "width 0.1s"
              }}></div>
            </div>

            {/* Fish Info */}
            <div style={{
              position: "absolute",
              top: "1vh",
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              fontSize: "15px",
              fontWeight: "bold",
              textAlign: "center",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
            }}>
              Catching {currentFish}! Keep the red line in the green zone!
            </div>




             <div 
      className="catch-bar"
      onClick={handleBarClick}
      style={{
        position: "absolute",
        bottom: "15vh",
        left: "50%",
        transform: "translateX(-50%)",
        width: "300px",
        height: "30px",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: "4px",
        cursor: "pointer",
      }} >

         <div 
        style={{
          position: "absolute",
          left: `${controlBarPos - 10}%`,
          width: "20%",
          height: "100%",
          backgroundColor: "rgba(0, 255, 0, 0.3)",
          borderRadius: "4px",
        }}
      ></div>
              
              {/* Fish Indicator */}
              <div
                className="fish-line"
                style={{ 
                  left: `${fishIndicatorPos}%`,
                  width: "4px",
                  height: "100%",
                  backgroundColor: "#ff0000",
                  position: "absolute",
                  transform: "translateX(-50%)",
                  borderRadius: "2px",
                  boxShadow: "0 0 10px rgba(255,0,0,0.8)"
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
      {notif && (
        <div style={{
          position: "fixed",
          top: "14vh",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#232323",
          color: "#ffe066",
          padding: "18px 28px",
          borderRadius: 18,
          fontSize: 22,
          fontWeight: "bold",
          zIndex: 99999,
          boxShadow: "0 6px 24px #000a",
          textAlign: "center",
          animation: "fadeSlotNotif 2.2s"
        }}>
          {notif}
        </div>
      )}

    </>
  );
}