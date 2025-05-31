import React, { useState, useEffect } from 'react';
import './Kitchen.css';
import kitchenBackgroundImage from '../assets/ui/KitchenMG.png'; // Background dapur

// Impor itemIcons dari Inventory.jsx untuk menampilkan ikon bahan
// Pastikan path './Inventory' atau './Inventory.jsx' sudah benar relatif terhadap file Kitchen.jsx ini
import { itemIcons } from './Inventory';

// Impor ikon Panci, pastikan path ini benar
import PanciIcon from '../assets/inventory-items/Panci.png';

// Definisi Resep (Cooked Goldfish, Cooked Tuna, Cooked Megalodon)
const initialRecipes = [
  {
    id: 'cooked_goldfish',
    name: 'Cooked Goldfish',
    icon: itemIcons['Cooked Goldfish'],
    ingredients: [
      { name: 'Goldfish', qty: 1 }, { name: 'Garlic', qty: 1 }, { name: 'Onion', qty: 1 },
      { name: 'Shallot', qty: 1 }, { name: 'Oil', qty: 1 }, { name: 'Magic Sauce', qty: 1 },
    ],
    steps: ['Goldfish', 'Garlic', 'Onion', 'Shallot', 'Oil', 'Magic Sauce'],
    stage1TargetScore: 100,
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
    stage1TargetScore: 100,
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
    stage1TargetScore: 100,
    resultItem: 'Cooked Megalodon',
  },
];

// Daftar semua bahan yang mungkin muncul di mini-game stage 1 (untuk diacak)
const allPossibleMinigameIngredients = Object.keys(itemIcons).filter(
  itemName => !itemName.startsWith("Cooked") &&
  !["Boat", "Pickaxe", "Rod", "Archipelago Talisman", "Torch", "Ancient Glass", "Ancient Glass With Water", "Juice Coconut", "Juice Wild Fruit", "Cleanliness Potion", "Happiness Potion", "Meal Potion", "Morning Dew Potion"].includes(itemName) // Filter item non-bahan mentah
);

// Helper: jumlah item di inventory array
function getItemCount(inventoryArray, itemName) {
  return inventoryArray.reduce((count, item) => (item === itemName ? count + 1 : count), 0);
}

// Komponen Kitchen
export default function Kitchen({
  onClose,    // Fungsi untuk menutup modal Kitchen
  inventory,  // Array string nama item (dari props)
  setInventory // Fungsi untuk update inventory (dari props)
}) {
  const [recipes] = useState(initialRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [gameState, setGameState] = useState('menu'); // "menu", "view_recipe", "minigame_stage1", "minigame_stage2", "result"
  const [currentStage1Score, setCurrentStage1Score] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [stage1DisplayItems, setStage1DisplayItems] = useState([]);
  const [stage1CorrectlyTapped, setStage1CorrectlyTapped] = useState([]);

  useEffect(() => {
    if (gameState === 'minigame_stage1' && selectedRecipe) {
      setupStage1Minigame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, selectedRecipe]); // Jalankan saat gameState atau selectedRecipe berubah untuk stage 1

  const setupStage1Minigame = () => {
    if (!selectedRecipe) return;

    const correctIngredientsForRecipe = selectedRecipe.steps;
    const remainingCorrectIngredients = correctIngredientsForRecipe.filter(ing => !stage1CorrectlyTapped.includes(ing));
    
    const numCorrectToDisplay = Math.min(remainingCorrectIngredients.length, 2); // Tampilkan maks 2 bahan benar yang tersisa dan BELUM ditekan
    const numWrongToDisplay = Math.max(0, 5 - numCorrectToDisplay); // Target total 5 item, sisanya pengganggu

    let displayItemsPool = [];
    
    const shuffledRemainingCorrect = [...remainingCorrectIngredients].sort(() => 0.5 - Math.random());
    displayItemsPool.push(...shuffledRemainingCorrect.slice(0, numCorrectToDisplay));

    const wrongItemsPool = allPossibleMinigameIngredients.filter(
      item => !correctIngredientsForRecipe.includes(item) && !displayItemsPool.includes(item)
    );
    const shuffledWrong = [...wrongItemsPool].sort(() => 0.5 - Math.random());
    displayItemsPool.push(...shuffledWrong.slice(0, numWrongToDisplay));
    
    while(displayItemsPool.length < 5 && shuffledWrong.length > (displayItemsPool.length - numCorrectToDisplay) ) {
        const nextWrongItem = shuffledWrong[displayItemsPool.length - numCorrectToDisplay];
        if (nextWrongItem && !displayItemsPool.includes(nextWrongItem)) {
            displayItemsPool.push(nextWrongItem);
        } else {
            break; 
        }
    }
    // Pastikan setidaknya ada 1 item benar jika masih ada yang belum ditekan
    if (numCorrectToDisplay === 0 && remainingCorrectIngredients.length > 0 && displayItemsPool.length < 5) {
        displayItemsPool.push(remainingCorrectIngredients[0]);
    }
    // Jika setelah semua logika, displayItemsPool masih kosong (jarang terjadi), isi dengan beberapa item acak
     if (displayItemsPool.length === 0) {
        displayItemsPool.push(...[...allPossibleMinigameIngredients].sort(() => 0.5 - Math.random()).slice(0, 5));
    }


    setStage1DisplayItems(displayItemsPool.sort(() => 0.5 - Math.random()));
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
      setFeedbackMessage(`Bahan tidak cukup untuk memasak ${recipe.name}!`);
      setGameState('menu');
    }
  };

  const prepareToCook = () => {
    if (!selectedRecipe) return;
    setCurrentStage1Score(0);
    setStage1CorrectlyTapped([]);
    setGameState('minigame_stage1'); // useEffect akan memanggil setupStage1Minigame
    setFeedbackMessage(`Siapkan bahan untuk ${selectedRecipe.name}! Pilih dengan benar.`);
  };

  const handleStage1ItemTap = (itemName) => {
    if (!selectedRecipe || gameState !== 'minigame_stage1') return;

    const isCorrectRequiredIngredient = selectedRecipe.steps.includes(itemName);
    const alreadyTapped = stage1CorrectlyTapped.includes(itemName);
    let newScore = currentStage1Score;
    let newCorrectlyTappedLocal = [...stage1CorrectlyTapped];

    if (isCorrectRequiredIngredient && !alreadyTapped) {
      newScore += 10;
      newCorrectlyTappedLocal.push(itemName);
      setStage1CorrectlyTapped(newCorrectlyTappedLocal);
      setFeedbackMessage(`Benar! ${itemName} ditambahkan. +10 poin.`);
    } else if (isCorrectRequiredIngredient && alreadyTapped) {
      setFeedbackMessage(`${itemName} sudah dipilih sebelumnya. Pilih bahan lain!`);
    } else {
      newScore -= 15;
      setFeedbackMessage(`Salah! Itu bukan ${itemName}. -15 poin.`);
    }
    newScore = Math.max(0, newScore);
    setCurrentStage1Score(newScore);

    const allRequiredIngredientsTapped = selectedRecipe.steps.every(step => newCorrectlyTappedLocal.includes(step));

    if (allRequiredIngredientsTapped && newScore >= selectedRecipe.stage1TargetScore) {
      setFeedbackMessage(`Stage 1 Berhasil! Total Skor: ${newScore}. Lanjut atur panas!`);
      setGameState('minigame_stage2');
    } else if (allRequiredIngredientsTapped && newScore < selectedRecipe.stage1TargetScore) {
      setFeedbackMessage(`Semua bahan benar, tapi skor (${newScore}) tidak mencapai target ${selectedRecipe.stage1TargetScore}. Masakan gagal!`);
      setGameState('result');
    } else if (!allRequiredIngredientsTapped) {
      // Jika belum menang/kalah dan belum semua bahan benar terpilih, siapkan set item berikutnya
      setTimeout(setupStage1Minigame, 800);
    }
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
    } else {
      setFeedbackMessage(`Yah, gagal di tahap akhir saat mengatur panas ${selectedRecipe.name}. Makanan tidak jadi.`);
    }
    setGameState('result');
  };

  const backToMenu = () => {
    setSelectedRecipe(null);
    setGameState('menu');
    setFeedbackMessage('');
    setCurrentStage1Score(0);
    setStage1CorrectlyTapped([]);
  };

  return (
    <div
      className="kitchen-container"
      style={{ backgroundImage: `url(${kitchenBackgroundImage})` }}
    >
      <div className="game-overlay" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="kitchen-close-button" // Gunakan kelas dari Kitchen.css
        >
          ×
        </button>

        <h2 className="kitchen-title">
          🍳 Dapur Memasak 🍳
        </h2>

        {feedbackMessage && (
          <div
            className={`feedback-message ${
              feedbackMessage.includes("Berhasil") || feedbackMessage.includes("Selamat") || feedbackMessage.includes("Benar") ? 'success' : ''
            }`}
          >
            {feedbackMessage}
          </div>
        )}

        {/* --- KONTEN GAME STATE --- */}
        {gameState === 'menu' && (
          <div className="recipe-menu">
            <h3>Pilih Resep:</h3>
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

        {gameState === 'view_recipe' && selectedRecipe && (
          <div className="recipe-details">
            <h3>{selectedRecipe.name}</h3>
            {selectedRecipe.icon && <img src={selectedRecipe.icon} alt={selectedRecipe.name} className="recipe-detail-icon" />}
            <p>Bahan yang dibutuhkan:</p>
            <ul>
              {selectedRecipe.ingredients.map((ing, index) => (
                <li key={index}>
                  {itemIcons[ing.name] && <img src={itemIcons[ing.name]} alt={ing.name} className="ingredient-list-icon" />}
                  {ing.name} ({ing.qty}) - Kamu punya: {getItemCount(inventory, ing.name)}
                </li>
              ))}
            </ul>
            <button onClick={prepareToCook}>Mulai Masak!</button>
            <button onClick={backToMenu}>Kembali ke Menu</button>
          </div>
        )}

        {gameState === 'minigame_stage1' && selectedRecipe && (
          <div className="minigame-container">
            <div className="minigame-play-area">
              <h3>Memasak: {selectedRecipe.name}</h3>
              <p>Pilih bahan yang benar sesuai resep!</p>
              <p>Skor: {currentStage1Score} / {selectedRecipe.stage1TargetScore}</p>
              <div className="minigame-items-display">
                {stage1DisplayItems.map((itemName, index) => (
                  <button
                    key={`${itemName}-${index}-${Date.now()}`} // Key lebih unik untuk re-render
                    onClick={() => handleStage1ItemTap(itemName)}
                    className="minigame-item-button"
                    title={itemName}
                  >
                    {itemIcons[itemName] ? (
                      <img src={itemIcons[itemName]} alt={itemName} />
                    ) : (
                      itemName
                    )}
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
              <h3>Tahap 2: Atur Panas!</h3>
              <p>Resep: {selectedRecipe.name}</p>
              <div className="minigame-stage2-visual">
                <img src={PanciIcon} alt="Panci Masak" className="panci-icon"/>
                <p><em>(Implementasikan mekanisme mini-game "tekan pas" di sini)</em></p>
              </div>
              <button onClick={() => handleStage2Result(true)} className="stage2-success-button">Simulasi: Stage 2 Berhasil</button>
              <button onClick={() => handleStage2Result(false)} className="stage2-fail-button">Simulasi: Stage 2 Gagal</button>
            </div>
            <button onClick={backToMenu} className="minigame-cancel-button">
              Batal
            </button>
          </div>
        )}

        {gameState === 'result' && selectedRecipe && (
          <div className="result-display">
            <h3>Hasil Akhir Memasak</h3>
            {feedbackMessage.includes("Selamat") && selectedRecipe.icon &&
              <img src={selectedRecipe.icon} alt={selectedRecipe.resultItem} className="result-cooked-item-icon" />
            }
            <p className={`result-feedback-text ${feedbackMessage.includes("Selamat") ? 'success' : 'failure'}`}>{feedbackMessage}</p>
            <button onClick={backToMenu}>Kembali ke Menu Resep</button>
          </div>
        )}
      </div>
    </div>
  );
}