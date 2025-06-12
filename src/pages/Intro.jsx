import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

import loadingVideo from "../assets/intro/Loading intro.mp4";
import introLoopVideo from "../assets/intro/Video Intro.mp4";
import introMusic from "../assets/audio/intro-music.mp3";
import googleIcon from "../assets/icons/google.png";
import guestIcon from "../assets/icons/guest.png";
import clickSound from "../assets/audio/click.mp3";
import cardImage from "../assets/images/imageintro.jpg";

import "./Intro.css";

export default function Intro() {
  const [step, setStep] = useState("select-login"); // select-login | fill-form | tap-start | loading
  const [isGuest, setIsGuest] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerPassword, setPlayerPassword] = useState("");

  const loadingRef = useRef(null);
  const audioRef = useRef(null);
  const clickAudioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
    }
  }, []);

  const playClick = () => {
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play();
    }
  };

  const handleSelectGoogle = () => {
    playClick();
    setIsGuest(false);
    setStep("fill-form");
  };

  const handleSelectGuest = () => {
    playClick();
    setIsGuest(true);
    setStep("fill-form");
  };

 const handleFormSubmit = async () => {
  if (playerName.trim() === "") {
    alert("Nama tidak boleh kosong");
    return;
  }

  if (!isGuest) {
    try {
      await signInWithPopup(auth, provider);
      console.log("Login Google berhasil");
    } catch (error) {
      alert("Login gagal: " + error.message);
      return;
    }
  }

  localStorage.setItem("playerName", playerName);

  // ⬇️ Mulai musik setelah berhasil login/nama valid
  if (audioRef.current) {
    audioRef.current.play().catch((err) => {
      console.warn("Audio autoplay blocked:", err.message);
    });
  }

  setStep("tap-start");
};

  const handleTapStart = () => {
    playClick();
    setStep("loading");
    if (loadingRef.current) {
      loadingRef.current.currentTime = 0;
      loadingRef.current.play();
    }
  };

  const handleLoadingEnd = () => {
  navigate("/select-character"); // pindah ke halaman baru
};


  return (
    <div className="intro-container">
      <h1 className="title-text">ARCHIPELAGO SAGA</h1>

      <audio ref={audioRef} loop>
        <source src={introMusic} type="audio/mp3" />
      </audio>
      <audio ref={clickAudioRef} preload="auto">
        <source src={clickSound} type="audio/mp3" />
      </audio>

      <video className="intro-video base" src={introLoopVideo} autoPlay muted loop />
      <video
        ref={loadingRef}
        className={`intro-video overlay ${step === "loading" ? "fade-in-video" : "hidden-video"}`}
        src={loadingVideo}
        muted
        onEnded={handleLoadingEnd}
      />

      {/* STEP 1 - PILIH LOGIN */}
      {step === "select-login" && (
        <div className="auth-options-grid">
          <div className="auth-method" onClick={handleSelectGoogle}>
            <img src={googleIcon} alt="Google" className="auth-icon-box" />
            <p className="auth-label">Google Account</p>
          </div>
          <div className="auth-method" onClick={handleSelectGuest}>
            <img src={guestIcon} alt="Guest" className="auth-icon-box" />
            <p className="auth-label">Guest Account</p>
          </div>
        </div>
      )}

      {/* STEP 2 - FORM */}
  {step === "fill-form" && (
  <div className="login-card">
    <img src={cardImage} alt="Header" className="card-header" />
    <div className="login-title">Enter Information</div>

    <input
      type="text"
      placeholder="Enter name"
      value={playerName}
      onChange={(e) => setPlayerName(e.target.value)}
    />

    {!isGuest && (
      <input
        type="password"
        placeholder="Enter password"
        value={playerPassword}
        onChange={(e) => setPlayerPassword(e.target.value)}
      />
    )}

    <button onClick={handleFormSubmit}>OK</button>
  </div>
)}

      {/* STEP 3 - TAP TO START */}
      {step === "tap-start" && (
        <div className="tap-to-start" onClick={handleTapStart}>
          Tap to Start
        </div>
      )}

    </div>
  );
}
