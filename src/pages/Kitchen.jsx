import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Kitchen.css';
import kitchenBackgroundImage from '../assets/ui/KitchenMG.png'; // Background dapur
import RecipeBookIcon from '../assets/inventory-items/Recipe Book.png';

// Impor itemIcons dari Inventory.jsx untuk menampilkan ikon bahan
// Pastikan path './Inventory' atau './Inventory.jsx' sudah benar relatif terhadap file Kitchen.jsx ini
import { itemIcons } from './Inventory';

// Impor ikon Panci, pastikan path ini benar
import PanciIcon from '../assets/inventory-items/Panci.png';

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

  // Pindahkan definisi initialRecipes ke dalam komponen dan gunakan useMemo
  const initialRecipes = useMemo(() => {
    // Pastikan itemIcons ada sebelum mencoba mengakses propertinya
    if (!itemIcons) {
        console.error("itemIcons is not available. Check import from Inventory.jsx");
        return []; // Kembalikan array kosong atau handle error sesuai kebutuhan
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
        // stage1TargetScore: 100, // Sebaiknya dihitung dinamis: steps.length * 100
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
        // stage1TargetScore: 100, // Sebaiknya dihitung dinamis: steps.length * 100
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
        // stage1TargetScore: 100, // Sebaiknya dihitung dinamis: steps.length * 100
        resultItem: 'Cooked Megalodon',
      },
    ];
  }, []); // Dependensi kosong karena itemIcons diasumsikan tidak berubah setelah import

  // Pindahkan definisi allPossibleMinigameIngredients ke dalam komponen dan gunakan useMemo
  const allPossibleMinigameIngredients = useMemo(() => {
    if (!itemIcons) {
        console.error("itemIcons is not available for allPossibleMinigameIngredients. Check import from Inventory.jsx");
        return [];
    }
    return Object.keys(itemIcons).filter(
      itemName => !itemName.startsWith("Cooked") &&
      !["Boat", "Pickaxe", "Rod", "Archipelago Talisman", "Torch", "Ancient Glass", "Ancient Glass With Water", "Juice Coconut", "Juice Wild Fruit", "Cleanliness Potion", "Happiness Potion", "Meal Potion", "Morning Dew Potion"].includes(itemName)
    );
  }, []); // Dependensi kosong karena itemIcons diasumsikan tidak berubah setelah import

  const [recipes] = useState(initialRecipes); // initialRecipes sekarang sudah benar
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [gameState, setGameState] = useState('menu');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showRecipeBook, setShowRecipeBook] = useState(false);
  const [activeItems, setActiveItems] = useState([]);
  const [stage1Score, setStage1Score] = useState(0);
  const nextItemId = useRef(0);

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
          // Jika semua possible ingredients ada di resep, pilih dari possible sebagai wrong (meski akan dianggap benar)
          // Atau, jika tidak ada wrongIngredients sama sekali, ini bisa jadi kasus khusus
          name = allPossibleMinigameIngredients[Math.floor(Math.random() * allPossibleMinigameIngredients.length)];
        } else {
          // Fallback jika tidak ada bahan sama sekali (sangat jarang, tapi untuk menghindari error)
          console.warn("No ingredients available to spawn for minigame_stage1.");
          return; // Jangan spawn apa-apa jika tidak ada nama
        }
      }
      
      if (name) { // Pastikan nama ada sebelum menambahkan item
        setActiveItems(items => [
          ...items,
          { id: nextItemId.current++, name, left: 520 }
        ]);
      }
    }, 400);

    return () => clearInterval(spawnInterval);
  }, [gameState, selectedRecipe, allPossibleMinigameIngredients]); // tambahkan allPossibleMinigameIngredients

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

  const handleClickItem = (item) => {
    if (!selectedRecipe) return; // Guard clause

    if (selectedRecipe.steps.includes(item.name)) {
      setActiveItems(items => items.filter(i => i.id !== item.id));
      setStage1Score(s => s + 100);
      setFeedbackMessage(`Benar! ${item.name} +100 poin`);
    } else {
      setStage1Score(s => Math.max(0, s - 50)); // Skor tidak boleh negatif
      setFeedbackMessage(`Salah! ${item.name} -50 poin`);
      // Pertimbangkan untuk menghilangkan item yang salah juga agar tidak menumpuk, atau beri penalti lain
      // setActiveItems(items => items.filter(i => i.id !== item.id)); 
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
      setFeedbackMessage(`Bahan tidak cukup untuk memasak ${recipe.name}!`);
      setGameState('menu'); // Tetap di menu jika bahan tidak cukup
    }
  };

  const prepareToCook = () => {
    if (!selectedRecipe) return;
    setGameState('minigame_stage1');
    setStage1Score(0); // Reset skor saat mulai masak
    setFeedbackMessage(`Siapkan bahan untuk ${selectedRecipe.name}! Pilih dengan benar.`);
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
    setActiveItems([]); // Kosongkan active items
    setStage1Score(0);  // Reset skor
  };

  useEffect(() => {
    if (gameState === 'minigame_stage1' && selectedRecipe) {
      const targetScore = selectedRecipe.steps.length * 100;
      // Pastikan targetScore > 0 untuk resep yang memang punya step
      if (targetScore > 0 && stage1Score >= targetScore) { 
        setFeedbackMessage("Stage 1 selesai! Lanjut ke tahap berikutnya!");
        setTimeout(() => setGameState('minigame_stage2'), 700);
      }
    }
  }, [stage1Score, gameState, selectedRecipe]);

  // Periksa apakah recipes sudah terinisialisasi sebelum di-map
  if (!recipes || recipes.length === 0) {
    // Ini bisa terjadi jika itemIcons gagal dimuat dan initialRecipes jadi array kosong
    // Tampilkan pesan loading atau error, atau kembalikan null
    // Ini juga bisa membantu mendeteksi jika initialRecipes tidak terisi karena itemIcons bermasalah
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
    // Jika recipes kosong tapi itemIcons ada, mungkin tidak ada resep yang valid
    // Atau, jika Anda mau, tampilkan pesan "Tidak ada resep"
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
          🍳 Dapur Memasak 🍳
        </h2>

        {feedbackMessage && (
          <div
            className={`feedback-message ${
              feedbackMessage.includes("Luar biasa") || feedbackMessage.includes("Berhasil") ||  feedbackMessage.includes("Selamat") || feedbackMessage.includes("Benar") ? 'success' : 
              (feedbackMessage.includes("Yah, gagal") || feedbackMessage.includes("Salah") || feedbackMessage.includes("tidak cukup") || feedbackMessage.includes("Error")) ? 'failure' : ''
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
            <h3 style={{ paddingLeft: 64 }}>Pilih Resep:</h3>
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
              <h2 className="kitchen-title">Buku Resep</h2>
              <div className="recipe-book-list">
                {recipeBookList.map((res, i) => (
                  <div className="recipe-book-entry" key={i}>
                    <h3>{res.name}</h3>
                    <p><b>Bahan:</b> {res.ingredients.join(', ')}</p>
                    <p><b>Cara Membuat:</b> {res.instructions}</p>
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
            <p>Bahan yang dibutuhkan:</p>
            <ul>
              {selectedRecipe.ingredients.map((ing, index) => (
                <li key={index}>
                  {itemIcons && itemIcons[ing.name] ? <img src={itemIcons[ing.name]} alt={ing.name} className="ingredient-list-icon" /> : ing.name}
                  {' '}{ing.name} ({ing.qty}) - Kamu punya: {getItemCount(inventory, ing.name)}
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
              <p>Skor: {stage1Score} / {selectedRecipe.steps.length * 100}</p>

              <div className="item-scroller">
                {activeItems.map(item => (
                  <button
                    key={item.id}
                    className="moving-item"
                    style={{ left: `${item.left}px` }} // Pastikan left adalah string dengan unit px
                    onClick={() => handleClickItem(item)}
                  >
                    {itemIcons && itemIcons[item.name] ? (
                      <img src={itemIcons[item.name]} alt={item.name} />
                    ) : item.name}
                  </button>
                ))}
              </div>
              {/* Skor sudah ditampilkan di atas, jadi baris di bawah ini bisa jadi duplikat
              <div style={{ marginTop: 8 }}>
                Skor: {stage1Score}
              </div> 
              */}
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
            {(feedbackMessage.includes("Luar biasa") || feedbackMessage.includes("Berhasil")) && selectedRecipe.icon &&
              <img src={selectedRecipe.icon} alt={selectedRecipe.resultItem} className="result-cooked-item-icon" />
            }
            <p className={`result-feedback-text ${
                (feedbackMessage.includes("Luar biasa") || feedbackMessage.includes("Berhasil")) ? 'success' : 
                (feedbackMessage.includes("Yah, gagal") || feedbackMessage.includes("Error")) ? 'failure' : ''
            }`}>{feedbackMessage}</p>
            <button onClick={backToMenu}>Kembali ke Menu Resep</button>
          </div>
        )}
      </div>
    </div>
  );
}