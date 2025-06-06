import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { itemIcons } from "./Inventory.jsx";
import GameoverSound from '../assets/audio/Gameover.mp3';
import VictorySound from '../assets/audio/Victory.mp3';

import "./Ending.css";

function AnimatedPercent({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf;
    let start;
    const target = Math.round(value * 100);
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 900, 1); // durasi 900ms
      setDisplay(Math.round(target * progress));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setDisplay(target);
    }
    raf = requestAnimationFrame(step);
    return () => raf && cancelAnimationFrame(raf);
  }, [value]);
  return (
    <b>{display}%</b>
  );
}

const ACTIVITY_LIST = [
  "Bath", "Look Painting", "Sweep", "Sleep", "Drink", "Cooking",
  "Fishing", "Wild Fruit Minigame", "Chop Wood", "Dungeon Minigame",
  "Coconut Minigame", "Rock Mining", "Sunbathe", "Slot Machine", "Buy Item"
];
const AREA_LIST = [
  "Home", "Lake", "Forest", "Dungeon", "Beach", "Market", "Isle of the Sacred Oath"
];
const NPC_LIST = [
  "HomeNPC", "LakeNPC", "MountainNPC", "BeachNPC", "ForestNPC", "DungeonNPC", "SecretNPC"
];

const REVEAL_ORDER = [
  "stat", "activity", "item", "area", "npc", "score"
];

export default function Ending() {
  const navigate = useNavigate();
  const playerData = JSON.parse(localStorage.getItem("playerData") || "{}");
  const status = playerData.status || {};
  const discoveredItems = JSON.parse(localStorage.getItem("discoveredItems") || "[]");
  const activityFlags = JSON.parse(localStorage.getItem("activityFlags") || "{}");
  const visitedAreas = JSON.parse(localStorage.getItem("visitedAreas") || "[]");
  const interactedNPCs = JSON.parse(localStorage.getItem("interactedNPCs") || "[]");
  const isGameFinished = localStorage.getItem("gameFinished") === "true";

  const statScore = Math.round((["meal", "sleep", "happiness", "cleanliness"].reduce(
    (sum, key) => sum + (status[key] || 0), 0)) / 4);
  const activitiesDone = ACTIVITY_LIST.filter(act => activityFlags[act]);
  const areasDone = AREA_LIST.filter(area => visitedAreas.includes(area));
  const npcsDone = NPC_LIST.filter(npc => interactedNPCs.includes(npc));
  const totalItemCount = Object.keys(itemIcons).length;

  const explorePct = (
    (statScore / 100)
    + (activitiesDone.length / ACTIVITY_LIST.length)
    + (discoveredItems.length / totalItemCount)
    + (areasDone.length / AREA_LIST.length)
    + (npcsDone.length / NPC_LIST.length)
  ) / 5;

let starCount = 0;
if (explorePct >= 0.3 && explorePct < 0.6) {
  starCount = 1;
} else if (explorePct >= 0.6) {
  starCount = 2;
}
if (isGameFinished) starCount += 1;
if (!isGameFinished) starCount = 0;
if (starCount > 3) starCount = 3;

console.log(
  "DEBUG starCount:", starCount,
  "isGameFinished:", isGameFinished,
  "explorePct:", explorePct
);

  // Animasi states
  const [revealed, setRevealed] = useState({
    stat: false, activity: false, item: false, area: false, npc: false, score: false
  });
  const [starsRevealed, setStarsRevealed] = useState(0);
  const [starAnimStarted, setStarAnimStarted] = useState(false);
  const [descRevealed, setDescRevealed] = useState(false);

  // Animasi muncul skor urut, lalu bintang satu per satu
useEffect(() => {
  let order = [...REVEAL_ORDER];
  let delay = 400;
  order.forEach((key, idx) => {
    setTimeout(() => {
      setRevealed(prev => ({ ...prev, [key]: true }));
    }, idx * 900 + delay);
  });

  // Setelah semua info reveal, baru animasi bintang
  setTimeout(() => {
    setStarAnimStarted(true);
    if (starCount === 0) {
      setStarsRevealed(0);
      setTimeout(() => setDescRevealed(true), 600); // Atur delay biar masih smooth
      return;
    }
    let curr = 0;
    const interval = setInterval(() => {
      curr++;
      setStarsRevealed(curr);
      if (curr >= starCount) {
        clearInterval(interval);
        setTimeout(() => setDescRevealed(true), 700);
      }
    }, 670);
  }, (REVEAL_ORDER.length) * 900 + 600);
}, [starCount]);

  useEffect(() => {
    // Cek sudah masuk ending screen
    let audio;
    if (isGameFinished) {
      audio = new Audio(VictorySound);
    } else {
      audio = new Audio(GameoverSound);
    }
    audio.volume = 0.8; // Volume sesuai selera
    audio.play();

    // Optional: Matikan audio ketika keluar dari Ending page
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [isGameFinished]);

  // Angka naik per komponen
  function useAnimateNumber(value, revealed, duration = 750) {
    const [val, setVal] = useState(0);
    const ref = useRef();
    useEffect(() => {
      if (!revealed) return;
      let start = 0;
      let startTime;
      function step(ts) {
        if (!startTime) startTime = ts;
        let progress = Math.min((ts - startTime) / duration, 1);
        setVal(Math.round(start + (value - start) * progress));
        if (progress < 1) ref.current = requestAnimationFrame(step);
        else setVal(value);
      }
      ref.current = requestAnimationFrame(step);
      return () => ref.current && cancelAnimationFrame(ref.current);
    }, [value, revealed]);
    return val;
  }

  const statAnim = useAnimateNumber(statScore, revealed.stat);
  const activityAnim = useAnimateNumber(activitiesDone.length, revealed.activity);
  const itemAnim = useAnimateNumber(discoveredItems.length, revealed.item);
  const areaAnim = useAnimateNumber(areasDone.length, revealed.area);
  const npcAnim = useAnimateNumber(npcsDone.length, revealed.npc);

  // Star, borderOnly tetap, filled + animasi pop jika bintangnya didapat
  const Star = ({ filled, borderOnly, delay, animate }) => (
    <span
      className={`star-anim ${animate ? "star-pop-anim" : ""}`}
      style={{
        color: filled ? "#FFD700" : "transparent",
        WebkitTextStroke: "3px #e3c56a",
        textShadow: filled ? "0 0 40px #FFD70077,0 0 16px #fff22277" : "none",
        fontSize: "3em",
        filter: !filled ? "grayscale(1) blur(0.5px)" : "none",
        transition: "color 0.4s, filter 0.35s",
        animationDelay: animate ? `${delay}s` : undefined
      }}
    >
      ★
    </span>
  );

  const handleBackToIntro = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="ending-bg">
      <div className="ending-screen ending-fancy">
        {/* Bintang borderOnly selalu render dari awal */}
        <div className="star-row-anim" style={{ minHeight: 68 }}>
          {[0, 1, 2].map(i =>
            (starAnimStarted && i < starsRevealed && i < starCount) ? (
              <Star
                key={i}
                filled={true}
                delay={0.18 * i}
                animate={true}
              />
            ) : (
              <Star
                key={i}
                filled={false}
                borderOnly={true}
                animate={false}
              />
            )
          )}
        </div>

        <h1 className="ending-title-glow" style={{ marginTop: 24 }}>
          {isGameFinished
            ? "Congratulations! You reached the ending!"
            : "Game Over"}
        </h1>
        <div className="score-panel">
          <div className={`score-row reveal-anim ${revealed.stat ? "visible" : ""}`}>
            <span className="score-label">Stat Balance</span>
            <span className="score-value">{statAnim}/100</span>
          </div>
          <div className={`score-row reveal-anim ${revealed.activity ? "visible" : ""}`}>
            <span className="score-label">Activities</span>
            <span className="score-value">
              {activityAnim}/{ACTIVITY_LIST.length}
            </span>
          </div>
          <div className={`score-row reveal-anim ${revealed.item ? "visible" : ""}`}>
            <span className="score-label">Items Discovered</span>
            <span className="score-value">
              {itemAnim}/{totalItemCount}
            </span>
          </div>
          <div className={`score-row reveal-anim ${revealed.area ? "visible" : ""}`}>
            <span className="score-label">Areas Visited</span>
            <span className="score-value">
              {areaAnim}/{AREA_LIST.length}
            </span>
          </div>
          <div className={`score-row reveal-anim ${revealed.npc ? "visible" : ""}`}>
            <span className="score-label">NPCs Interacted</span>
            <span className="score-value">
              {npcAnim}/{NPC_LIST.length}
            </span>
          </div>
          <hr style={{ width: "75%", margin: "22px auto" }} />
          {/* Adventure Completion muncul setelah semua score, angka naik dari 0 */}
          <div
            className={`final-score super-glow reveal-anim ${revealed.score ? "visible" : ""}`}
            style={{ fontSize: "2.0em", margin: "3px 0 1px 0", textAlign: "center" }}
          >
            Adventure Completion:
            {revealed.score ? (
              <span style={{ marginLeft: 10 }}>
                <AnimatedPercent value={explorePct} />
              </span>
            ) : null}
          </div>


        </div>
        {/* Deskripsi muncul setelah bintang */}
          <div className="ending-desc ending-desc-final"
            style={{
              marginTop: "auto", // biar selalu dorong ke bawah, pas bintang/score kecil
              minHeight: 36,
              fontSize: "1.32em", // lebih besar, tengah jelas
              textAlign: "center",
              visibility: descRevealed ? "visible" : "hidden",
              opacity: descRevealed ? 1 : 0,
              transition: "opacity 0.8s cubic-bezier(.29,1.1,.42,1)"
            }}
          >

          {starCount === 3 && (
            <span className="ending-perfect">
              Every secret found and every story brought home. The adventure is complete!
            </span>
          )}
          {starCount === 2 && (
            <span className="ending-good">
              Almost all mysteries revealed! Just a little more to uncover before you truly master the past.
            </span>
          )}
          {starCount === 1 && (
            <span className="ending-ok">
              You made it home, but many secrets from the past remain. Try to discover more on your next journey.
            </span>
          )}
          {starCount === 0 && (
            <span className="ending-fail">
              You didn’t make it back to the present. Explore more next time to find your way home!
            </span>
          )}
        </div>

        <button className="ending-btn" onClick={handleBackToIntro}>
          Back to Main Menu
        </button>
      </div>
    </div>
  );
}
