import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

import loadingVideo from "../assets/intro/Loading intro.mp4";
import introLoopVideo from "../assets/intro/Video Intro.mp4";
import introMusic from "../assets/audio/intro-music.mp3";
import googleIcon from "../assets/icons/google.png";
import "./Intro.css";

export default function Intro() {
  const [hasChosenLogin, setHasChosenLogin] = useState(false);
  const [showTap, setShowTap] = useState(false);
  const [playLoading, setPlayLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const loadingRef = useRef(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Login berhasil:", user);

      setIsGuest(false);
      setHasChosenLogin(true);
      setTimeout(() => setShowTap(true), 500);

      if (audioRef.current) {
        audioRef.current.play().catch(err => console.warn("Audio autoplay blocked:", err.message));
      }

    } catch (error) {
      console.error("Login gagal:", error.message);
      alert("Login gagal: " + error.message);
    }
  };

  const handleGuest = () => {
    setIsGuest(true);
    setHasChosenLogin(true);
    setTimeout(() => setShowTap(true), 500);

    if (audioRef.current) {
      audioRef.current.play().catch(err => console.warn("Audio autoplay blocked:", err.message));
    }
  };

  const handleTapStart = () => {
    setPlayLoading(true);
    if (loadingRef.current) {
      loadingRef.current.currentTime = 0;
      loadingRef.current.play();
    }
  };

  const handleLoadingEnd = () => {
    if (isGuest) navigate("/guest");
    else navigate("/select-character");
  };

  return (
    <div className="intro-container tappable">
      {/* Musik latar */}
      <audio ref={audioRef} loop>
        <source src={introMusic} type="audio/mp3" />
      </audio>

      {/* Video looping intro */}
      <video className="intro-video base" src={introLoopVideo} autoPlay muted loop />

      {/* Video loading (muncul setelah tap) */}
      <video
        ref={loadingRef}
        className={`intro-video overlay ${playLoading ? "fade-in-video" : "hidden-video"}`}
        src={loadingVideo}
        muted
        onEnded={handleLoadingEnd}
      />

      {/* Login dan tap */}
      {!playLoading && (
        <>
          <div className={`auth-options-row ${hasChosenLogin ? "fade-out" : "fade-in"}`}>
            {!hasChosenLogin && (
              <>
                <button className="auth-button google" onClick={handleGoogleLogin}>
                  <img src={googleIcon} alt="Google" className="auth-icon" />
                </button>
                <button className="auth-button guest" onClick={handleGuest}>
                  Play as Guest
                </button>
              </>
            )}
          </div>

          <div className={`tap-to-start ${showTap ? "fade-in" : "fade-out"}`} onClick={handleTapStart}>
            Tap to Start
          </div>
        </>
      )}
    </div>
  );
}
