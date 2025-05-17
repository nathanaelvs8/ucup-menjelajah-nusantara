import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("gameUser", JSON.stringify({
        uid: userCred.user.uid,
        email: userCred.user.email,
        isGuest: false
      }));
      alert("Login berhasil!");
      navigate("/select-character"); // bisa diganti ke halaman game nanti
    } catch (err) {
      alert("Login gagal: " + err.message);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
