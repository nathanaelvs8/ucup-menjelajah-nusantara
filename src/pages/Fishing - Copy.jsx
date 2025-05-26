import React, { useState, useEffect, useRef } from "react";
import alatPancing from "../assets/images/alatpancing.png";
import kailPancing from "../assets/images/kail.png";
import "./Fishing.css";

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
  const [kailTop, setKailTop] = useState("60vh"); // posisi kail
  const kailTopPx = `${(parseFloat(kailTop) / 100) * window.innerHeight}px`;
  const lineHeight = parseFloat(kailTop) - 60;

  const intervalRef = useRef(null);
  const catchIntervalRef = useRef(null);

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



  // Tentukan area dari depth
const getArea = (depthPx) => {
  if (depthPx < 210) return "dekat";     // 10 + 200
  if (depthPx < 400) return "sedang";    // 200 + 200
  return "jauh";                         // 400 ke atas
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

  const handleCastRelease = () => {
    if (stage !== 1) return;
    setCharging(false);
const minTopPx = 10;   // posisi paling atas kail (top zona 'dekat')
const maxTopPx = 600;  // posisi paling bawah kail (top 'jauh' + height)

const depthPx = maxTopPx - ((power / 100) * (maxTopPx - minTopPx));
setKailTop(`${depthPx}px`);
;


    setStage(2);
    setShowExclamation(true);

    const delay = Math.random() * 3000 + 1000;
    setTimeout(() => {
      setShowExclamation(false);
      setStage(3);
      setStartCatchTime(Date.now());
      setCatchProgress(0);
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
      setFishIndicatorPos((pos) => {
        let speed = fishData[fish]?.speed || 3;
        let nextPos = pos + (Math.random() > 0.5 ? 1 : -1) * speed;
        if (nextPos > 100) nextPos = 100;
        if (nextPos < 0) nextPos = 0;
        return nextPos;
      });

      setCatchProgress((prog) => {
        const pos = fishIndicatorPosRef.current;
        const duration = fishData[fish]?.duration || 4000;
        const inc = 100 / (duration / 100);
        if (pos >= 40 && pos <= 60) {
          // indikator di dalam bar → naik
          return Math.min(prog + inc, 100);
        } else {
          // indikator keluar bar → turun lebih cepat
          const dec = inc * 1.5;
          const newProg = prog - dec;
          return newProg < 0 ? 0 : newProg;
        }
      });
    }, 100);
  };

  useEffect(() => {
    if (stage === 3) {
      if (catchProgress >= 100) {
        clearInterval(catchIntervalRef.current);
        alert(`🎉 You caught a ${currentFish}!`);

        setInventory((prev) => {
          const newInv = [...prev, currentFish];
          const saved = JSON.parse(localStorage.getItem("playerData")) || {};
          localStorage.setItem(
            "playerData",
            JSON.stringify({ ...saved, inventory: newInv })
          );
          return newInv;
        });

        setStage(1);
        setPower(0);
        setCaught(true);
      } else if (catchProgress <= 0) {
        clearInterval(catchIntervalRef.current);
        alert("🐟 Fish escaped!");
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
      <div className="fishing-scene">
        <img src={alatPancing} alt="alat pancing" className="alat-pancing-scene" />

     <div
  className="fishing-line"
  style={{
    position: "absolute",
    top: kailTop, // sama dengan posisi kail, misal "450px"
    left: "50%",
    width: "2px",
    height: `calc(60vh - ${kailTop})`, // jarak dari kail ke alat pancing
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
  style={{ top: kailTop }} // langsung pakai kailTop karena sudah "450px" atau "10px"
 />

        </div>
{areaZones.map((zone) => (
  <div
    key={zone.name}
    style={{
      position: "absolute",
      top: zone.top + "px",
      left: 0,
      width: "100%",
      height: zone.height + "px",
      border: `2px dashed ${zone.color.replace(/rgba\((.+),.+\)/, 'rgb($1)')}`,
      backgroundColor: zone.color,
      pointerEvents: "none",
      zIndex: 4,
    }}
  >
    <span
      style={{
        position: "absolute",
        left: 10,
        top: 2,
        color: zone.color.replace(/rgba\((.+),.+\)/, 'rgb($1)'),
        fontWeight: "bold",
        textShadow: "0 0 4px #000",
        userSelect: "none",
        fontSize: "12px",
      }}
    >
      {zone.name.toUpperCase()}
    </span>
  </div>
))}


        

        <div className="land"></div>
      </div>

      <div className="ui-layer">
        <div className="status-money">
          <div className="money">🎣 Fishing Mode</div>
          <button
            className="inventory-btn"
            onClick={() => setInventoryVisible((prev) => !prev)}
          >
            Inventory
          </button>
          {inventoryVisible && (
            <div className="inventory-modal">
              <div className="inventory-grid">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div key={i} className="inventory-slot">
                    {inventory[i] ? (
                      <div className="inventory-item">{inventory[i]}</div>
                    ) : null}
                  </div>
                ))}
              </div>
              <button
                className="close-inventory-btn"
                onClick={() => setInventoryVisible(false)}
              >
                Close
              </button>
            </div>
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

        {stage === 3 && (
          <div className="catch-stage">
            <div className="catch-bar">
              <div
                className="control-bar"
                style={{ left: `${catchProgress}%`, width: "40px" }}
              ></div>
              <div
                className="fish-line"
                style={{ left: `${fishIndicatorPos}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
