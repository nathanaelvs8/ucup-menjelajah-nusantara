

import React, { useEffect, useRef, useState } from "react";
import "./Gameplay.css";
import mapImage from "../assets/map/Main.jpg";

const MAP_WIDTH = 3000;
const MAP_HEIGHT = 2000;
const SPRITE_SIZE = 64;

export default function Gameplay() {
  const [character, setCharacter] = useState(null);
  const [position, setPosition] = useState({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const [direction, setDirection] = useState("down");
  const [isMoving, setIsMoving] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("selectedCharacter"));
    if (saved) setCharacter(saved);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      setIsMoving(true);
      setPosition((prev) => {
        const newPos = { ...prev };
        if (key === "w" || key === "arrowup") {
          newPos.y -= 8;
          setDirection("up");
        }
        if (key === "s" || key === "arrowdown") {
          newPos.y += 8;
          setDirection("down");
        }
        if (key === "a" || key === "arrowleft") {
          newPos.x -= 8;
          setDirection("left");
        }
        if (key === "d" || key === "arrowright") {
          newPos.x += 8;
          setDirection("right");
        }
        return newPos;
      });
    };

    const handleKeyUp = () => setIsMoving(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.scrollTo({
        left: position.x - window.innerWidth / 2,
        top: position.y - window.innerHeight / 2,
        behavior: "smooth",
      });
    }
  }, [position]);

  const getSpriteOffset = () => {
    const directionMap = { down: 0, left: 1, right: 2, up: 3 };
    const row = directionMap[direction];
    const col = isMoving ? Math.floor(Date.now() / 150) % 4 : 1;
    return `-${col * SPRITE_SIZE}px -${row * SPRITE_SIZE}px`;
  };

  return (
    <div className="map-wrapper" ref={mapRef}>
      <div
        className="map"
        style={{
          backgroundImage: `url(${mapImage})`,
        }}
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
      </div>
    </div>
  );
}
