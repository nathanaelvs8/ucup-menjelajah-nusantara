import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Kitchen.css';
import { addActivity } from "./utils";
import kitchenBackgroundImage from '../assets/ui/KitchenMG.png'; // Background dapur
import RecipeBookIcon from '../assets/inventory-items/Recipe Book.png';

// Impor itemIcons dari Inventory.jsx untuk menampilkan ikon bahan
// Pastikan path './Inventory' atau './Inventory.jsx' sudah benar relatif terhadap file Kitchen.jsx ini
import { itemIcons } from './Inventory';

// Impor ikon Panci, pastikan path ini benar
// import PanciIcon from '../assets/inventory-items/Panci.png'; // Tidak digunakan lagi karena panci-icon dihandle oleh CSS

// Helper: jumlah item di inventory array
function getItemCount(inventoryArray, itemName) {
  return inventoryArray.reduce((count, item) => (item === itemName ? count + 1 : count), 0);
}

// Komponen Kitchen
export default function Kitchen({
  onClose,    // Fungsi untuk menutup modal Kitchen
  inventory,  // Array string nama item (dari props)
  setInventory,
  craftingRecipes // Prop ini diterima tapi tidak digunakan dalam kode yang Anda berikan
}) {

  const initialRecipes = useMemo(() => {
    if (!itemIcons) {
        console.error("itemIcons is not available. Check import from Inventory.jsx");
        return [];
    }
    return [
      {
        id: 'cooked_goldfish',
        name: 'Cooked Goldfish',
        icon: itemIcons['Cooked Goldfish'],
        ingredients: [
          { name: 'Goldfish', qty: 1 }, { name: 'Garlic', qty: 1 }, { name: 'Onion', qty: 1 },
          { name: 'Shallot', qty: 1 }, { name: 'Oil', qty: 1 }, { name: 'Magic Sauce', qty: 1 },
        ],
        steps: ['Goldfish', 'Garlic', 'Onion', 'Shallot', 'Oil', 'Magic Sauce'],
        resultItem: 'Cooked Goldfish',
      },
      {
        id: 'cooked_tuna',
        name: 'Cooked Tuna',
        icon: itemIcons['Cooked Tuna'],
        ingredients: [
          { name: 'Tuna', qty: 1 }, { name: 'Salt', qty: 1 }, { name: 'Garlic', qty: 1 },
          { name: 'Magic Powder', qty: 1 }, { name: 'Oil', qty: 1 },
        ],
        steps: ['Tuna', 'Salt', 'Garlic', 'Magic Powder', 'Oil'],
        resultItem: 'Cooked Tuna',
      },
      {
        id: 'cooked_megalodon',
        name: 'Cooked Megalodon',
        icon: itemIcons['Cooked Megalodon'],
        ingredients: [
          { name: 'Megalodon', qty: 1 }, { name: 'Garlic', qty: 1 }, { name: 'Onion', qty: 1 },
          { name: 'Shallot', qty: 1 }, { name: 'Magic Powder', qty: 1 }, { name: 'Magic Sauce', qty: 1 },
        ],
        steps: ['Megalodon', 'Garlic', 'Onion', 'Shallot', 'Magic Powder', 'Magic Sauce'],
        resultItem: 'Cooked Megalodon',
      },
    ];
  }, []); 

  const allPossibleMinigameIngredients = useMemo(() => {
    if (!itemIcons) {
        console.error("itemIcons is not available for allPossibleMinigameIngredients. Check import from Inventory.jsx");
        return [];
    }
    return Object.keys(itemIcons).filter(
      itemName => !itemName.startsWith("Cooked") &&
      !["Boat", "Pickaxe", "Rod", "Archipelago Talisman", "Torch", "Ancient Glass", "Ancient Glass With Water", "Juice Coconut", "Juice Wild Fruit", "Cleanliness Potion", "Happiness Potion", "Meal Potion", "Morning Dew Potion"].includes(itemName)
    );
  }, []); 

  const [recipes] = useState(initialRecipes); 
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [gameState, setGameState] = useState('menu');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showRecipeBook, setShowRecipeBook] = useState(false);
  const [activeItems, setActiveItems] = useState([]);
  const [stage1Score, setStage1Score] = useState(0);
  const nextItemId = useRef(0);

  // State untuk Minigame Stage 2
  const [indicatorPosition, setIndicatorPosition] = useState(0); // 0-100 %
  const [indicatorSpeed] = useState(1.5); // Kecepatan gerak indikator (sesuaikan untuk kesulitan)
  const [indicatorDirection, setIndicatorDirection] = useState('right'); // 'left' or 'right'
  const [isIndicatorAnimating, setIsIndicatorAnimating] = useState(false);
  const [playerHasStoppedIndicator, setPlayerHasStoppedIndicator] = useState(false);
  const targetZone = { start: 40, end: 60 }; // Target area 40% - 60%

  const recipeBookList = [
    {
      name: "Cooked Goldfish",
      ingredients: ["Goldfish", "Garlic", "Onion", "Shallot", "Oil", "Magic Sauce"],
      instructions: "Campur semua bahan, masak sampai matang dan bumbu meresap.",
    },
    {
      name: "Cooked Tuna",
      ingredients: ["Tuna", "Salt", "Garlic", "Magic Powder", "Oil"],
      instructions: "Tumis garlic dan tuna, masukkan bahan lain, masak hingga matang.",
    },
    {
      name: "Cooked Megalodon",
      ingredients: ["Megalodon", "Garlic", "Onion", "Shallot", "Magic Powder", "Magic Sauce"],
      instructions: "Tumis bawang, masukkan Megalodon dan bahan lain, masak sampai harum.",
    }
  ];

  useEffect(() => {
    if (gameState !== 'minigame_stage1' || !selectedRecipe) return;

    setActiveItems([]);
    setStage1Score(0);

    const spawnInterval = setInterval(() => {
      const isCorrect = Math.random() < 0.6;
      let name = '';
      if (isCorrect) {
        const recipeStepIngredients = selectedRecipe.steps;
        name = recipeStepIngredients[Math.floor(Math.random() * recipeStepIngredients.length)];
      } else {
        const wrongIngredients = allPossibleMinigameIngredients.filter(n => !selectedRecipe.steps.includes(n));
        if (wrongIngredients.length > 0) {
          name = wrongIngredients[Math.floor(Math.random() * wrongIngredients.length)];
        } else if (allPossibleMinigameIngredients.length > 0) {
          name = allPossibleMinigameIngredients[Math.floor(Math.random() * allPossibleMinigameIngredients.length)];
        } else {
          console.warn("No ingredients available to spawn for minigame_stage1.");
          return; 
        }
      }
      
      if (name) { 
        setActiveItems(items => [
          ...items,
          { id: nextItemId.current++, name, left: 520 }
        ]);
      }
    }, 400);

    return () => clearInterval(spawnInterval);
  }, [gameState, selectedRecipe, allPossibleMinigameIngredients]);

  useEffect(() => {
    if (gameState !== 'minigame_stage1') return;
    const moveInterval = setInterval(() => {
      setActiveItems(items =>
        items
          .map(item => ({ ...item, left: item.left - 7 }))
          .filter(item => item.left > -80)
      );
    }, 40);

    return () => clearInterval(moveInterval);
  }, [gameState]);

  // Effect untuk minigame stage 2 (indicator movement)
  useEffect(() => {
    let animationInterval;
    if (gameState === 'minigame_stage2' && isIndicatorAnimating) {
      animationInterval = setInterval(() => {
        setIndicatorPosition(prevPos => {
          let newPos = prevPos;
          if (indicatorDirection === 'right') {
            newPos += indicatorSpeed;
            if (newPos >= 100) {
              newPos = 100;
              setIndicatorDirection('left');
            }
          } else { // direction === 'left'
            newPos -= indicatorSpeed;
            if (newPos <= 0) {
              newPos = 0;
              setIndicatorDirection('right');
            }
          }
          return newPos;
        });
      }, 20); // Interval update posisi indikator (sesuaikan untuk kelancaran)
    }
    return () => clearInterval(animationInterval);
  }, [gameState, isIndicatorAnimating, indicatorDirection, indicatorSpeed]);


  const handleClickItem = (item) => {
    if (!selectedRecipe) return; 

    if (selectedRecipe.steps.includes(item.name)) {
      setActiveItems(items => items.filter(i => i.id !== item.id));
      setStage1Score(s => s + 100);
      setFeedbackMessage(`Benar! ${item.name} +100 poin`);
    } else {
      setStage1Score(s => Math.max(0, s - 50)); 
      setFeedbackMessage(`Salah! ${item.name} -50 poin`);
    }
  };

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
      setFeedbackMessage(`Not enough ingredients to cook ${recipe.name}!`);
      setGameState('menu'); 
    }
  };

  const prepareToCook = () => {
    if (!selectedRecipe) return;
    setGameState('minigame_stage1');
    setStage1Score(0); 
    setFeedbackMessage(`Siapkan bahan untuk ${selectedRecipe.name}! Pilih dengan benar.`);
  };

  // Fungsi untuk memulai stage 2 atau transisi dari stage 1
  const startStage2Minigame = () => {
    setFeedbackMessage("Step 2: Adjust the heat properly!");
    setIndicatorPosition(0);
    setIndicatorDirection('right');
    setPlayerHasStoppedIndicator(false);
    setIsIndicatorAnimating(true); // Mulai animasi indikator
    setGameState('minigame_stage2');
  };
  
  // Dipanggil ketika stage 1 selesai
  useEffect(() => {
    if (gameState === 'minigame_stage1' && selectedRecipe) {
      const targetScore = selectedRecipe.steps.length * 100;
      if (targetScore > 0 && stage1Score >= targetScore) { 
        setFeedbackMessage("Stage 1 selesai! Lanjut ke tahap berikutnya!");
        setIsIndicatorAnimating(false); // Pastikan animasi dari stage sebelumnya berhenti jika ada
        setTimeout(() => {
            startStage2Minigame(); // Panggil fungsi untuk memulai stage 2
        }, 700);
      }
    }
  }, [stage1Score, gameState, selectedRecipe]); // Tidak perlu memasukkan startStage2Minigame ke dependency array jika ia didefinisikan di scope yang sama atau di atasnya dan tidak berubah.


  const handleStopIndicator = () => {
    if (!isIndicatorAnimating) return; // Jangan lakukan apa-apa jika sudah dihentikan

    setIsIndicatorAnimating(false);
    setPlayerHasStoppedIndicator(true);

    const success = indicatorPosition >= targetZone.start && indicatorPosition <= targetZone.end;
    if (success) {
      setFeedbackMessage(`Tepat! Panasnya pas!`); // Pesan sementara sebelum hasil akhir
    } else {
      let missType = indicatorPosition < targetZone.start ? "kurang panas" : "terlalu panas";
      setFeedbackMessage(`Oops! Sepertinya ${missType}.`); // Pesan sementara
    }
    
    // Beri sedikit jeda sebelum memanggil hasil akhir agar pemain bisa lihat feedback singkat
    setTimeout(() => {
        handleStage2Result(success);
    }, 1200); 
  };


  const handleStage2Result = (success) => {
    if (!selectedRecipe) return;
    if (success) {
      setFeedbackMessage(`Luar biasa! Kamu berhasil memasak ${selectedRecipe.resultItem}!`);
      let tempInventory = [...inventory];
      for (const ingredient of selectedRecipe.ingredients) {
        for (let i = 0; i < ingredient.qty; i++) {
          const indexToRemove = tempInventory.indexOf(ingredient.name);
          if (indexToRemove > -1) {
            tempInventory.splice(indexToRemove, 1);
          }
        }
      }
      tempInventory.push(selectedRecipe.resultItem);
      setInventory(tempInventory);
      addActivity("Cooking");
    } else {
      setFeedbackMessage(`Yah, gagal di tahap akhir saat mengatur panas ${selectedRecipe.name}. Makanan tidak jadi.`);
    }
    setGameState('result');
  };

  const backToMenu = () => {
    setSelectedRecipe(null);
    setGameState('menu');
    setFeedbackMessage('');
    setActiveItems([]); 
    setStage1Score(0);  
    // Reset state minigame stage 2
    setIsIndicatorAnimating(false);
    setPlayerHasStoppedIndicator(false);
    setIndicatorPosition(0);
  };


  if (!recipes || recipes.length === 0) {
    if (!itemIcons) {
        return (
            <div className="kitchen-container" style={{ backgroundImage: `url(${kitchenBackgroundImage})` }}>
                <div className="game-overlay">
                    <p>Error: Gagal memuat data resep. Periksa konsol untuk detail.</p>
                    <button onClick={onClose} className="kitchen-close-button">×</button>
                </div>
            </div>
        );
    }
  }


  return (
    <div
      className="kitchen-container"
      style={{ backgroundImage: `url(${kitchenBackgroundImage})` }}
    >
      <div className="game-overlay" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="kitchen-close-button"
        >
          ×
        </button>

        <h2 className="kitchen-title">
          🍳 Cooking Kitchen 🍳
        </h2>

        {feedbackMessage && ! (gameState === 'minigame_stage2' && playerHasStoppedIndicator) && ( // Jangan tampilkan feedback umum jika sedang di stage 2 dan baru saja stop
          <div
            className={`feedback-message ${
              feedbackMessage.includes("Luar biasa") || feedbackMessage.includes("Berhasil") ||  feedbackMessage.includes("Selamat") || feedbackMessage.includes("Benar") || feedbackMessage.includes("Tepat!") ? 'success' : 
              (feedbackMessage.includes("Yah, gagal") || feedbackMessage.includes("Salah") || feedbackMessage.includes("tidak cukup") || feedbackMessage.includes("Error") || feedbackMessage.includes("Oops!") ) ? 'failure' : ''
            }`}
          >
            {feedbackMessage}
          </div>
        )}

        {gameState === 'menu' && (
          <div className="recipe-menu" style={{ position: 'relative' }}>
            <button
              className="recipe-book-btn"
              style={{
                position: "absolute",
                left: 0, top: -20,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                outline: "none"
              }}
              title="Lihat Buku Resep"
              onClick={() => setShowRecipeBook(true)}
            >
              <img src={RecipeBookIcon} alt="Recipe Book" style={{ width: 56, height: 56, objectFit: "contain" }} />
            </button>
            <h3 style={{ paddingLeft: 64 }}>Choose Menu:</h3>
            <ul>
              {recipes.map((recipe) => (
                <li key={recipe.id} onClick={() => handleSelectRecipe(recipe)}>
                  {recipe.icon && <img src={recipe.icon} alt={recipe.name} className="recipe-list-icon" />}
                  {recipe.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {showRecipeBook && (
          <div className="recipe-book-modal-overlay" onClick={() => setShowRecipeBook(false)}>
            <div className="recipe-book-modal" onClick={e => e.stopPropagation()}>
              <button className="kitchen-close-button" onClick={() => setShowRecipeBook(false)}>×</button>
              <h2 className="kitchen-title">Recipe Book</h2>
              <div className="recipe-book-list">
                {recipeBookList.map((res, i) => (
                  <div className="recipe-book-entry" key={i}>
                    <h3>{res.name}</h3>
                    <p><b>Ingridients:</b> {res.ingredients.join(', ')}</p>
                    <p><b>How to make:</b> {res.instructions}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'view_recipe' && selectedRecipe && (
          <div className="recipe-details">
            <h3>{selectedRecipe.name}</h3>
            {selectedRecipe.icon && <img src={selectedRecipe.icon} alt={selectedRecipe.name} className="recipe-detail-icon" />}
            <p>Ingridients needed:</p>
            <ul>
              {selectedRecipe.ingredients.map((ing, index) => (
                <li key={index}>
                  {itemIcons && itemIcons[ing.name] ? <img src={itemIcons[ing.name]} alt={ing.name} className="ingredient-list-icon" /> : ing.name}
                  {' '}{ing.name} ({ing.qty}) - You have: {getItemCount(inventory, ing.name)}
                </li>
              ))}
            </ul>
            <button onClick={prepareToCook}>Start to cook!</button>
            <button onClick={backToMenu}>Back to menu</button>
          </div>
        )}

        {gameState === 'minigame_stage1' && selectedRecipe && (
          <div className="minigame-container">
            <div className="minigame-play-area">
              <h3>Cooking: {selectedRecipe.name}</h3>
              <p>Select the correct ingredients according to the recipe!</p>
              <p>Score: {stage1Score} / {selectedRecipe.steps.length * 100}</p>

              <div className="item-scroller">
                {activeItems.map(item => (
                  <button
                    key={item.id}
                    className="moving-item"
                    style={{ left: `${item.left}px` }} 
                    onClick={() => handleClickItem(item)}
                  >
                    {itemIcons && itemIcons[item.name] ? (
                      <img src={itemIcons[item.name]} alt={item.name} />
                    ) : item.name}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={backToMenu} className="minigame-cancel-button">
              Batal
            </button>
          </div>
        )}

        {gameState === 'minigame_stage2' && selectedRecipe && (
          <div className="minigame-container">
            <div className="minigame-play-area">
              <h3>Tahap 2: Control Heat!</h3>
              <p>Recipe: {selectedRecipe.name}</p>
              <div className="minigame-stage2-visual">
                <div className="panci-icon" role="img" aria-label="Panci Masak"></div>
              </div>

              {/* --- Minigame Indikator Suhu --- */}
              <div className="temperature-minigame">
                <p>Press "Stop" when the indicator is in the yellow area!</p>
                <div className="indicator-bar-container">
                  <div className="indicator-track">
                    <div 
                      className="target-zone" 
                      style={{ left: `${targetZone.start}%`, width: `${targetZone.end - targetZone.start}%` }}
                    ></div>
                    <div 
                      className="indicator-handle" 
                      style={{ left: `${indicatorPosition}%` }}
                    ></div>
                  </div>
                </div>
                {/* Menampilkan feedback spesifik untuk stage 2 setelah stop */}
                {playerHasStoppedIndicator && feedbackMessage && (
                    <div className={`feedback-message small-margin ${feedbackMessage.includes("Tepat!") ? 'success' : 'failure'}`}>
                        {feedbackMessage}
                    </div>
                )}
                {!playerHasStoppedIndicator && (
                  <button onClick={handleStopIndicator} className="stage2-stop-button">
                    Stop
                  </button>
                )}
              </div>
              {/* --- Akhir Minigame Indikator Suhu --- */}
              
            </div>
            {/* Tombol Batal tetap ada jika pemain ingin membatalkan progres memasak */}
            <button onClick={backToMenu} className="minigame-cancel-button" style={{marginTop: playerHasStoppedIndicator ? '20px': '0' }}>
              Cancel Cooking
            </button>
          </div>
        )}

        {gameState === 'result' && selectedRecipe && (
          <div className="result-display">
            <h3>Hasil Akhir Memasak</h3>
            {(feedbackMessage.includes("Luar biasa") || feedbackMessage.includes("Berhasil")) && selectedRecipe.icon &&
              <img src={selectedRecipe.icon} alt={selectedRecipe.resultItem} className="result-cooked-item-icon" />
            }
            <p className={`result-feedback-text ${
                (feedbackMessage.includes("Luar biasa") || feedbackMessage.includes("Berhasil")) ? 'success' : 
                (feedbackMessage.includes("Yah, gagal") || feedbackMessage.includes("Error")) ? 'failure' : ''
            }`}>{feedbackMessage}</p>
            <button onClick={backToMenu}>Go back to the Recipe Menu</button>
          </div>
        )}
      </div>
    </div>
  );
}