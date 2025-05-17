// src/App.jsx
import { useState } from 'react';
import './App.css';

function App() {
  const [monsterHP, setMonsterHP] = useState(100);
  const [log, setLog] = useState([]);

  const attack = () => {
    const damage = Math.floor(Math.random() * 20) + 5; // damage 5–24
    const newHP = Math.max(monsterHP - damage, 0);
    setMonsterHP(newHP);
    setLog([...log, `Menyerang! Monster terkena ${damage} damage.`]);
  };

  const reset = () => {
    setMonsterHP(100);
    setLog([]);
  };

  return (
    <div className="container">
      <h1>🐉 Monster HP: {monsterHP}</h1>
      {monsterHP > 0 ? (
        <button onClick={attack}>Serang</button>
      ) : (
        <button onClick={reset}>Main Lagi</button>
      )}
      <div className="log">
        {log.slice().reverse().map((entry, i) => (
          <p key={i}>{entry}</p>
        ))}
      </div>
    </div>
  );
}

export default App;
