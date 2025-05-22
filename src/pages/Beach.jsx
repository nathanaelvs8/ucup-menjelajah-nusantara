import React, { useEffect, useState } from "react";
import "./Gameplay.css";
import beachMap from "../assets/map/Beach.jpg";

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

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("playerData"));
    if (savedData) {
      setStatus(savedData.status || {});
      setMoney(savedData.money || 0);
      setInventory(savedData.inventory || []);
    }

    setUsername(localStorage.getItem("playerName") || "Player");

    const savedTime = JSON.parse(localStorage.getItem("playerTime"));
    if (savedTime) {
      setCurrentMinute(savedTime.minute);
      setCurrentHour(savedTime.hour);
      setCurrentDayIndex(savedTime.day);
    }
  }, []);

  useEffect(() => {
    const timeData = JSON.parse(localStorage.getItem("playerTime"));
    if (timeData) {
      const now = Date.now();
      const elapsed = Math.floor((now - timeData.startTimestamp) / 250);

      let totalMinutes = timeData.savedHour * 60 + timeData.savedMinute + elapsed;
      const newDayIndex = (timeData.savedDay + Math.floor(totalMinutes / (24 * 60))) % 7;
      const newHour = Math.floor((totalMinutes % (24 * 60)) / 60);
      const newMinute = totalMinutes % 60;

      setCurrentMinute(newMinute);
      setCurrentHour(newHour);
      setCurrentDayIndex(newDayIndex);
    }

    const interval = setInterval(() => {
      setCurrentMinute(prevMinute => {
        let newMinute = prevMinute + 1;

        setCurrentHour(prevHour => {
          let newHour = prevHour;
          let newDay = currentDayIndex;

          if (newMinute >= 60) {
            newMinute = 0;
            newHour += 1;

            setStatus(prev => {
              const newStatus = { ...prev };
              for (let key in newStatus) {
                newStatus[key] = Math.max(newStatus[key] - 2, 0);
              }
              const allZero = Object.values(newStatus).every(val => val === 0);
              if (allZero) window.location.href = "/ending";
              return newStatus;
            });
          }

          if (newHour >= 24) {
            newHour = 0;
            newDay = (newDay + 1) % 7;
            setCurrentDayIndex(newDay);
          }

          return newHour;
        });

        return newMinute >= 60 ? 0 : newMinute;
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  return (
    <div className="viewport">
      <div className="map" style={{ backgroundImage: `url(${beachMap})` }}></div>

      <div className="time-display">
        <div className="clock-text">{days[currentDayIndex]}, {formatTime(currentHour, currentMinute)}</div>
      </div>

      <div className="status-ui">
        <div className="status-left">
          <div className="greeting-ui">Welcome back, {username}</div>
          <div className="status-bars">
            <div className="status-item">🍗<div className="bar"><div style={{ width: `${status.meal}%` }}></div></div></div>
            <div className="status-item">😴<div className="bar"><div style={{ width: `${status.sleep}%` }}></div></div></div>
            <div className="status-item">😊<div className="bar"><div style={{ width: `${status.happiness}%` }}></div></div></div>
            <div className="status-item">🛁<div className="bar"><div style={{ width: `${status.cleanliness}%` }}></div></div></div>
          </div>
        </div>

        <div className="status-money">
          <div className="money">Rp {money} 💰</div>
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
          zIndex: 99
        }}
        onClick={() => {
          const saved = JSON.parse(localStorage.getItem("playerData")) || {};
          localStorage.setItem("playerData", JSON.stringify({
            ...saved,
            status,
            money,
            inventory
          }));
          localStorage.setItem("playerTime", JSON.stringify({
            startTimestamp: Date.now(),
            savedMinute: currentMinute,
            savedHour: currentHour,
            savedDay: currentDayIndex
          }));
          window.location.href = "/gameplay";
        }}
      >
        🔙 Back to Gameplay
      </button>
    </div>
  );
}
