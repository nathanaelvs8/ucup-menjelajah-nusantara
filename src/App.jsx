import { useState } from 'react'
import { auth } from './firebase';
import './App.css'

function App() {
  console.log("Firebase Auth:", auth);
  return <h1>Halo dari Game Ucup!</h1>;
}

export default App
