import React, { useState } from 'react';
import './Kitchen.css';
import kitchenBackgroundImage from '../assets/ui/KitchenMG.png';

// List resep, kamu bisa tambah di sini
const initialRecipes = [
  {
    id: 'omelette',
    name: 'Telur Dadar Sederhana',
    ingredients: [{ name: 'Telur', qty: 2 }, { name: 'Garam', qty: 1 }],
    steps: ['Telur', 'Garam'], // Urutan bahan untuk mini-game tap
    minigameTargetScore: 500,
  },
  {
    id: 'fried_rice',
    name: 'Nasi Goreng Spesial',
    ingredients: [{ name: 'Nasi', qty: 1 }, { name: 'Bawang', qty: 1 }, { name: 'Kecap', qty: 1 }, { name: 'Telur', qty: 1 }],
    steps: ['Bawang', 'Telur', 'Nasi', 'Kecap'],
    minigameTargetScore: 1000,
  },
  // Tambahkan resep lain di sini
];

// Helper: jumlah item di inventory array
function getItemCount(inventory, name) {
  return inventory.reduce((count, item) => (item === name ? count + 1 : count), 0);
}

export default function Kitchen({
  onClose,
  status,
  setStatus,
  money,
  setMoney,
  inventory,
  setInventory
}) {
  const [recipes] = useState(initialRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [gameState, setGameState] = useState('menu'); // "menu", "view_recipe", "minigame_tap", "result"
  const [currentMinigameScore, setCurrentMinigameScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Pilih resep
  const handleSelectRecipe = (recipe) => {
    let canCook = true;
    for (const ingredient of recipe.ingredients) {
      if (getItemCount(inventory, ingredient.name) < ingredient.qty) {
        canCook = false;
        break;
      }
    }
    if (canCook) {
      setSelectedRecipe(recipe);
      setGameState('view_recipe');
      setFeedbackMessage('');
    } else {
      setSelectedRecipe(null);
      setFeedbackMessage('Bahan tidak cukup untuk memasak ' + recipe.name);
      setGameState('menu');
    }
  };

  // Mulai masak, kurangi bahan dari inventory
  const startCooking = () => {
    if (!selectedRecipe) return;
    let updatedInventory = [...inventory];
    for (const ingredient of selectedRecipe.ingredients) {
      let qty = ingredient.qty;
      updatedInventory = updatedInventory.filter(item => {
        if (item === ingredient.name && qty > 0) {
          qty--;
          return false;
        }
        return true;
      });
    }
    setInventory(updatedInventory);
    setCurrentMinigameScore(0);
    setGameState('minigame_tap');
    setFeedbackMessage('');
  };

  // Simulasi mini-game tap
  const handleMinigameTap = (success) => {
    if (success) {
      const newScore = currentMinigameScore + 100;
      setCurrentMinigameScore(newScore);
      if (newScore >= selectedRecipe.minigameTargetScore) {
        setFeedbackMessage('Tahap 1 Selesai! Lanjut ke tahap panas.');
        setGameState('result');
      }
    } else {
      setFeedbackMessage('Urutan salah!');
    }
  };

  // Kembali ke menu resep
  const backToMenu = () => {
    setSelectedRecipe(null);
    setGameState('menu');
    setFeedbackMessage('');
    setCurrentMinigameScore(0);
  }

  return (
    <div
      className="kitchen-container"
      style={{
        backgroundImage: `url(${kitchenBackgroundImage})`,
        position: "fixed", // Supaya nutupi House
        left: 0, top: 0, width: "100vw", height: "100vh",
        zIndex: 3000 // Pastikan di atas modal lain
      }}
    >
      <div className="game-overlay" style={{
        background: "rgba(255,255,255,0.93)",
        borderRadius: 18,
        maxWidth: 540,
        margin: "40px auto",
        padding: 30,
        minHeight: 400,
        boxShadow: "0 8px 42px #3e2711a1"
      }}>
        <button onClick={onClose} className="kitchen-back-btn" style={{
          position: "absolute",
          right: 28,
          top: 22,
          fontSize: 20,
          fontWeight: 600,
          border: "none",
          background: "#e4c587",
          color: "#614b16",
          borderRadius: 9,
          padding: "4px 14px",
          boxShadow: "0 1px 9px #987f49b2",
          cursor: "pointer",
          zIndex: 10
        }}>×</button>

        <h2 style={{color: "#795b23", marginTop: 4}}>🍳 Dapur</h2>

        {/* Feedback Message */}
        {feedbackMessage && <div className="feedback-message" style={{
          margin: "12px 0",
          color: "#be2424",
          fontWeight: 600,
          background: "#fff6d2",
          borderRadius: 8,
          padding: "7px 10px"
        }}>{feedbackMessage}</div>}

        {/* Tampilkan status singkat player */}
        <div style={{fontSize:15, marginBottom:18, marginTop:8, color: "#7e663b"}}>
          Status: Meal {status?.meal} | Sleep {status?.sleep} | Happiness {status?.happiness} | Cleanliness {status?.cleanliness} <br />
          Uang: {money}
        </div>

        {/* State: Menu Utama */}
        {gameState === 'menu' && (
          <div className="recipe-menu">
            <h3>Pilih Resep:</h3>
            <ul>
              {recipes.map((recipe) => (
                <li
                  key={recipe.id}
                  onClick={() => handleSelectRecipe(recipe)}
                  style={{
                    padding: "9px 0",
                    fontWeight: "bold",
                    color: "#885417",
                    cursor: "pointer"
                  }}
                >
                  {recipe.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* State: Lihat Resep */}
        {gameState === 'view_recipe' && selectedRecipe && (
          <div className="recipe-details">
            <h3>{selectedRecipe.name}</h3>
            <p>Bahan yang dibutuhkan:</p>
            <ul>
              {selectedRecipe.ingredients.map((ing, index) => (
                <li key={index}>{ing.name} ({ing.qty}) - Kamu punya: {getItemCount(inventory, ing.name)}</li>
              ))}
            </ul>
            <button onClick={startCooking} style={{
              marginTop: 8, fontWeight: 600, padding: "6px 18px",
              borderRadius: 8, background: "#efe8cc", color: "#936e1f", border: "1px solid #e2ca8a"
            }}>Mulai Masak!</button>
            <button onClick={backToMenu} style={{
              marginTop: 8, marginLeft: 14,
              padding: "6px 18px", borderRadius: 8, background: "#ffe", border: "1px solid #ccb877"
            }}>Kembali ke Menu</button>
          </div>
        )}

        {/* State: Mini-game Tap */}
        {gameState === 'minigame_tap' && selectedRecipe && (
          <div className="minigame-container" style={{marginTop: 16}}>
            <div className="minigame-play-area" style={{
              border: "3px solid #ad944f", borderRadius: 13, background: "#fcf4d4",
              padding: "24px 18px", marginBottom: 18
            }}>
              <h3>Memasak: {selectedRecipe.name}</h3>
              <p>Urutan Bahan: {selectedRecipe.steps.join(' ➡️ ')}</p>
              <p>Skor Anda: {currentMinigameScore} / {selectedRecipe.minigameTargetScore}</p>
              <div className="minigame-items-display" style={{marginTop:12}}>
                <p><em>(Item interaktif akan muncul di sini)</em></p>
              </div>
              {/* Tombol simulasi */}
              <div style={{ marginTop: '15px' }}>
                <button onClick={() => handleMinigameTap(true)} style={{
                  marginRight: 8, background: "#81c784", color: "#222", borderRadius: 7, border: "none", fontWeight: 600, padding: "7px 18px"
                }}>Simulasi: Tap Benar</button>
                <button onClick={() => handleMinigameTap(false)} style={{
                  background: "#e57373", color: "#fff", borderRadius: 7, border: "none", fontWeight: 600, padding: "7px 18px"
                }}>Simulasi: Tap Salah</button>
              </div>
            </div>
            <button onClick={backToMenu} style={{
              marginTop: 8, background: "#f8ecbe", borderRadius: 8, border: "1px solid #cebe91"
            }}>Batal & Kembali ke Menu</button>
          </div>
        )}

        {/* State: Hasil */}
        {gameState === 'result' && selectedRecipe && (
          <div className="result-display" style={{marginTop: 20}}>
            <h3>Hasil: {selectedRecipe.name}</h3>
            <p>Skor Akhir Tahap 1: {currentMinigameScore}</p>
            {currentMinigameScore >= selectedRecipe.minigameTargetScore ? (
              <p style={{color:"#268f1b",fontWeight:600}}>Mantap! Kamu berhasil tahap pertama!</p>
            ) : (
              <p style={{color:"#be2424",fontWeight:600}}>Sayang sekali, poin tidak cukup. Coba lagi ya!</p>
            )}
            <button onClick={backToMenu} style={{
              marginTop: 12, padding: "6px 20px", borderRadius: 8, background: "#efe8cc", color: "#936e1f", border: "1px solid #e2ca8a"
            }}>Kembali ke Menu</button>
          </div>
        )}
      </div>
    </div>
  );
}
