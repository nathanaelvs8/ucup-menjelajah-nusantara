import React, { useEffect, useState, useCallback, useRef } from "react";
import "./Shop.css";
import Inventory from "./Inventory.jsx"; // path harus benar, sesuaikan dengan struktur folder kamu
import inventoryIcon from "../assets/ui/Inventory.png";
import HappinesPotionIcon from "../assets/inventory-items/HappinesPotion.png";
import LogIcon from "../assets/inventory-items/Log.png";
import MagicPowerIcon from "../assets/inventory-items/MagicPower.png";
import MagicSauceIcon from "../assets/inventory-items/MagicSauce.png";
import MealPotionIcon from "../assets/inventory-items/MealPotion.png";
import MorningDewPotionIcon from "../assets/inventory-items/MorningDewPotion.png";
import PearlIcon from "../assets/inventory-items/Pearl.png";
import RippedClothIcon from "../assets/inventory-items/RippedCloth.png";
import RopeIcon from "../assets/inventory-items/Rope.png";
import CoconutIcon from "../assets/inventory-items/Coconut.png";
import GemIcon from "../assets/inventory-items/Gem.png";
import CleanlinessPotionIcon from "../assets/inventory-items/CleanlinessPotion.png";
import GarlicIcon from "../assets/inventory-items/Garlic.png";
import GoldfishIcon from "../assets/inventory-items/Goldfish.png";
import OnionIcon from "../assets/inventory-items/Onion.png";
import SaltIcon from "../assets/inventory-items/Salt.png";
import ShallotIcon from "../assets/inventory-items/Shallot.png";
import TunaIcon from "../assets/inventory-items/Tuna.png";
import WaterIcon from "../assets/inventory-items/Water.png";
import MegalodonIcon from "../assets/inventory-items/Megalodon.png"; // Impor ikon Megalodon
import OilIcon from "../assets/inventory-items/Oil.png"; 
import CookedMegalodonIcon from "../assets/inventory-items/CookedMegalodon.png";
const defaultItemList = [
  {
    id: "happiness_potion",
    name: "Happiness Potion",
    icon: HappinesPotionIcon,
    price: 2000,
    maxStock: 5,
  },
  {
    id: "log",
    name: "Log",
    icon: LogIcon,
    price: 400,
    maxStock: 20,
  },
  {
    id: "meal_potion",
    name: "Meal Potion",
    icon: MealPotionIcon,
    price: 2000,
    maxStock: 5,
  },
  {
    id: "morning_dew_potion",
    name: "Morning Dew Potion",
    icon: MorningDewPotionIcon,
    price: 2000,
    maxStock: 5,
  },
  {
    id: "pearl",
    name: "Pearl",
    icon: PearlIcon,
    price: 120000,
    maxStock: 5,
  },
  {
    id: "ripped_cloth",
    name: "Ripped Cloth",
    icon: RippedClothIcon,
    price: 7000,
    maxStock: 5,
  },
  {
    id: "rope",
    name: "Rope",
    icon: RopeIcon,
    price: 5000,
    maxStock: 20,
  },
   {
    id: "coconut",
    name: "Coconut",
    icon: CoconutIcon,
    price: 6000,
    maxStock: 5,
  },
  {
    id: "gem",
    name: "Gem",
    icon: GemIcon,
    price: 200000,
    maxStock: 5,
  },
  {
    id: "cleanliness_potion",
    name: "Cleanliness Potion",
    icon: CleanlinessPotionIcon,
    price: 2000,
    maxStock: 5,
  },
];

const cookingItemList = [
  {
    id: "garlic",
    name: "Garlic",
    icon: GarlicIcon,
    price: 150,
    maxStock: 50,
  },
  {
    id: "goldfish",
    name: "Goldfish",
    icon: GoldfishIcon,
    price: 300,
    maxStock: 30,
  },
  {
    id: "onion",
    name: "Onion",
    icon: OnionIcon,
    price: 120,
    maxStock: 50,
  },
  {
    id: "salt",
    name: "Salt",
    icon: SaltIcon,
    price: 50,
    maxStock: 100,
  },
  {
    id: "shallot",
    name: "Shallot",
    icon: ShallotIcon,
    price: 180,
    maxStock: 50,
  },
  {
    id: "tuna",
    name: "Tuna",
    icon: TunaIcon,
    price: 500,
    maxStock: 25,
  },
  {
    id: "water",
    name: "Water",
    icon: WaterIcon,
    price: 30,
    maxStock: 100,
  },
  {
    id: "magic_power",
    name: "Magic Power",
    icon: MagicPowerIcon,
    price: 500,
    maxStock: 20,
  },
  {
    id: "magic_sauce",
    name: "Magic Sauce",
    icon: MagicSauceIcon,
    price: 750,
    maxStock: 15,
  },
   {
    id: "oil", // ID unik untuk minyak
    name: "Oil",  // Nama item
    icon: OilIcon, // Ikon yang sudah diimpor
    price: 80,    // Contoh harga, sesuaikan jika perlu
    maxStock: 40, // Contoh stok maksimal, sesuaikan jika perlu
  },
];

// Daftar item eksklusif
const exclusiveItemList = [
  {
    id: "megalodon_tooth", // ID unik untuk item
    name: "Megalodon", // Nama item
    icon: MegalodonIcon, // Icon yang sudah diimpor
    price: 1000000, // Contoh harga, item eksklusif biasanya mahal
    maxStock: 1, // Contoh stok, item eksklusif biasanya sangat terbatas
  },
  {
    id : "cooked_megalodon",
    name : "Cooked Megalodon",
    icon : CookedMegalodonIcon,
    price : 2,
    maxStock : 100,
  }
  // Tambahkan item eksklusif lainnya di sini jika ada
];

const SHOP_REFRESH_INTERVAL = 5 * 60 * 1000; // Diubah menjadi 5 menit
const RESTOCK_INTERVAL = 4 * 60 * 60 * 1000;

const getRandomItems = (array, n) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

// Gabungkan SEMUA item yang mungkin ada di toko
const allShopPossibleItems = [...defaultItemList, ...cookingItemList, ...exclusiveItemList];

function Shop({ onClose, playerMoney, setPlayerMoney, playerInventory, setPlayerInventory }) {
  const [activeTab, setActiveTab] = useState("Item");
  const [itemStock, setItemStock] = useState({});
  const [shopItems, setShopItems] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(0);
const itemGridRef = useRef(null);

useEffect(() => {
  const grid = itemGridRef.current;
  if (!grid) return;

  let isDown = false;
  let startX, scrollLeft;

  // Mouse events
  const mouseDown = (e) => {
    isDown = true;
    grid.classList.add('dragging');
    startX = e.pageX - grid.offsetLeft;
    scrollLeft = grid.scrollLeft;
  };
  const mouseLeave = () => {
    isDown = false;
    grid.classList.remove('dragging');
  };
  const mouseUp = () => {
    isDown = false;
    grid.classList.remove('dragging');
  };
  const mouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - grid.offsetLeft;
    const walk = (x - startX) * 1.3;
    grid.scrollLeft = scrollLeft - walk;
  };

  // Touch events
  const touchStart = (e) => {
    isDown = true;
    startX = e.touches[0].pageX - grid.offsetLeft;
    scrollLeft = grid.scrollLeft;
  };
  const touchEnd = () => {
    isDown = false;
  };
  const touchMove = (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - grid.offsetLeft;
    const walk = (x - startX) * 1.4;
    grid.scrollLeft = scrollLeft - walk;
  };

  // Add listeners
  grid.addEventListener('mousedown', mouseDown);
  grid.addEventListener('mouseleave', mouseLeave);
  grid.addEventListener('mouseup', mouseUp);
  grid.addEventListener('mousemove', mouseMove);
  grid.addEventListener('touchstart', touchStart);
  grid.addEventListener('touchend', touchEnd);
  grid.addEventListener('touchmove', touchMove);

  // Clean up
  return () => {
    grid.removeEventListener('mousedown', mouseDown);
    grid.removeEventListener('mouseleave', mouseLeave);
    grid.removeEventListener('mouseup', mouseUp);
    grid.removeEventListener('mousemove', mouseMove);
    grid.removeEventListener('touchstart', touchStart);
    grid.removeEventListener('touchend', touchEnd);
    grid.removeEventListener('touchmove', touchMove);
    return () => {
  // ...event lain yang sudah ada (drag, touch, dst)...
  grid.removeEventListener("wheel", wheelHandler);
};

  };

    const wheelHandler = (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      grid.scrollLeft += e.deltaY;
    }
  };
  grid.addEventListener("wheel", wheelHandler, { passive: false });
}, []);

  
  useEffect(() => {
    const savedShopItems = JSON.parse(localStorage.getItem("shopItems") || "null");
    const savedLastRefresh = parseInt(localStorage.getItem("shopLastRefresh") || "0", 10);
    let savedShopStock = JSON.parse(localStorage.getItem("shopStock") || "{}");

    const now = Date.now();

    if (!savedShopItems || now - savedLastRefresh > SHOP_REFRESH_INTERVAL) {
      console.log("Refreshing shop items (default tab)...");
      const currentDefaultShopItems = getRandomItems(defaultItemList, 8);
      setShopItems(currentDefaultShopItems); // Ini hanya untuk tab "Item"
      setLastRefresh(now);
      localStorage.setItem("shopItems", JSON.stringify(currentDefaultShopItems));
      localStorage.setItem("shopLastRefresh", now.toString());

      // Saat refresh tab "Item", reset stok HANYA untuk item-item yang ada di defaultItemList
      // yang ditampilkan di tab "Item". Item dari kategori lain (cooking, exclusive)
      // tidak direset di sini, stok mereka diinisialisasi di bawah jika belum ada.
      const newStockForDefaultItemsDisplayed = { ...savedShopStock };
      currentDefaultShopItems.forEach(item => {
        newStockForDefaultItemsDisplayed[item.id] = { stock: item.maxStock, lastBought: 0 };
      });
      savedShopStock = newStockForDefaultItemsDisplayed;
    } else {
      setShopItems(savedShopItems);
      setLastRefresh(savedLastRefresh);
    }

    // Inisialisasi stok untuk SEMUA item (default, cooking, exclusive)
    // jika belum ada di savedShopStock.
    const initialStock = { ...savedShopStock };
    allShopPossibleItems.forEach(item => {
      if (!initialStock[item.id]) {
        console.log(`Initializing stock for ${item.id}`);
        initialStock[item.id] = { stock: item.maxStock, lastBought: 0 };
      }
    });

    setItemStock(initialStock);
    localStorage.setItem("shopStock", JSON.stringify(initialStock));

  }, []); // Hanya berjalan sekali saat mount

  

  useEffect(() => {
    const interval = setInterval(() => {
      setItemStock(prevStock => {
        const updatedStock = { ...prevStock };
        let changed = false;
        const now = Date.now();

        for (const itemId in updatedStock) {
          const stockInfo = updatedStock[itemId];
          // Cari itemDetails dari allShopPossibleItems untuk mendapatkan maxStock yang benar
          const itemDetails = allShopPossibleItems.find(x => x.id === itemId);

          if (itemDetails && stockInfo.stock < itemDetails.maxStock && stockInfo.stock === 0 && stockInfo.lastBought !== 0 && now - stockInfo.lastBought >= RESTOCK_INTERVAL) {
            console.log(`Restocking ${itemId}. Old stock: ${stockInfo.stock}, Max stock: ${itemDetails.maxStock}`);
            updatedStock[itemId] = { ...stockInfo, stock: itemDetails.maxStock, lastBought: 0 };
            changed = true;
          }
        }

        if (changed) {
          localStorage.setItem("shopStock", JSON.stringify(updatedStock));
          return updatedStock;
        }
        return prevStock;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [RESTOCK_INTERVAL]); // RESTOCK_INTERVAL sebagai dependency


  const getShopRefreshCountdown = () => {
    if (lastRefresh === 0) return "Loading...";
    const timeLeft = Math.max(0, SHOP_REFRESH_INTERVAL - (Date.now() - lastRefresh));
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const mins = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    const secs = Math.floor((timeLeft % (60 * 1000)) / 1000);
    return `${hours}h ${mins}m ${secs}s`;
  };

  const handleBuy = useCallback((item) => {
    // Pastikan item ada di itemStock dan memiliki info stok
    if (!itemStock[item.id] || itemStock[item.id].stock === 0) {
      alert("Item habis!");
      return;
    }
    if (playerMoney < item.price) {
      alert("Gold tidak cukup!");
      return;
    }

    setPlayerMoney(prev => prev - item.price);
    setPlayerInventory(prev => {
        return [...prev, item.name];
    });

    setItemStock(prev => {
      const updatedStock = { ...prev };
      const currentItemStock = updatedStock[item.id];
      const newStockAmount = currentItemStock.stock - 1;

      updatedStock[item.id] = {
        ...currentItemStock,
        stock: newStockAmount,
        lastBought: newStockAmount === 0 ? Date.now() : currentItemStock.lastBought,
      };
      localStorage.setItem("shopStock", JSON.stringify(updatedStock));
      return updatedStock;
    });
  }, [playerMoney, itemStock, setPlayerMoney, setPlayerInventory]);

  const getRestockCountdownText = (itemId) => {
    const stockInfo = itemStock[itemId];
    const itemDetails = allShopPossibleItems.find(i => i.id === itemId);

    if (!stockInfo || !itemDetails) return "Loading..."; // Jika info belum ada
    if (stockInfo.stock > 0) return "Buy";
    // Jika stok awal sudah 0 dan belum pernah dibeli (jarang terjadi jika inisialisasi benar)
    // Atau jika lastBought adalah 0 yang berarti baru direstock atau diinisialisasi habis
    if (stockInfo.stock === 0 && stockInfo.lastBought === 0) {
        return `Restock in ~${Math.floor(RESTOCK_INTERVAL / (60 * 60 * 1000))}h`;
    }
    if (stockInfo.stock === 0 && stockInfo.lastBought !== 0) {
        const timeLeft = Math.max(0, RESTOCK_INTERVAL - (Date.now() - stockInfo.lastBought));
        if (timeLeft === 0) {
            // Coba panggil restock manual jika interval terlewat, atau biarkan interval utama menanganinya
            return "Restocking...";
        }
        const hours = Math.floor(timeLeft / (60 * 60 * 1000));
        const mins = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        return `Restock in ${hours}h ${mins}m`;
    }
    return "Buy";
  };

  return (
    <div className="shop-modal">
      <div className="shop-header">
        <div className="shop-title">SHOP</div>
        <button className="shop-close" onClick={onClose}>✕</button>
      </div>
      <div className="shop-tabs">
        <button className={activeTab === "Exclusive" ? "active" : ""} onClick={() => setActiveTab("Exclusive")}>Exclusive Item</button>
        <button className={activeTab === "Item" ? "active" : ""} onClick={() => setActiveTab("Item")}>Item</button>
        <button className={activeTab === "Cooking" ? "active" : ""} onClick={() => setActiveTab("Cooking")}>Cooking Item</button>
      </div>
      <div className="shop-category-container">
        {activeTab === "Item" && (
   <div className="shop-item-grid scroll-x" ref={itemGridRef}>

            {shopItems.map(item => ( // shopItems adalah item acak dari defaultItemList
              <div className="shop-item-card" key={item.id}>
                <img src={item.icon} alt={item.name} />
                <div className="shop-item-name">{item.name}</div>
                <div className="shop-item-price">💰 {item.price}</div>
                <div className="shop-item-stock">
                  Stock: {itemStock[item.id]?.stock ?? "N/A"} / {item.maxStock}
                </div>
                <button
                  className="shop-buy-btn"
                  disabled={!itemStock[item.id] || itemStock[item.id]?.stock === 0}
                  onClick={() => handleBuy(item)}
                >
                  {getRestockCountdownText(item.id)}
                </button>
              </div>
            ))}
          </div>
        )}
        {activeTab === "Cooking" && (
          <div className="shop-item-grid scroll-x">
            {cookingItemList.map(item => (
              <div className="shop-item-card" key={item.id}>
                <img src={item.icon} alt={item.name} />
                <div className="shop-item-name">{item.name}</div>
                <div className="shop-item-price">💰 {item.price}</div>
                <div className="shop-item-stock">
                  Stock: {itemStock[item.id]?.stock ?? "N/A"} / {item.maxStock}
                </div>
                <button
                  className="shop-buy-btn"
                  disabled={!itemStock[item.id] || itemStock[item.id]?.stock === 0}
                  onClick={() => handleBuy(item)}
                >
                  {getRestockCountdownText(item.id)}
                </button>
              </div>
            ))}
          </div>
        )}
        {activeTab === "Exclusive" && (
          <div className="shop-item-grid scroll-x">
            {exclusiveItemList.map(item => ( // Menggunakan exclusiveItemList
              <div className="shop-item-card" key={item.id}>
                <img src={item.icon} alt={item.name} />
                <div className="shop-item-name">{item.name}</div>
                <div className="shop-item-price">💰 {item.price}</div>
                <div className="shop-item-stock">
                  Stock: {itemStock[item.id]?.stock ?? "N/A"} / {item.maxStock}
                </div>
                <button
                  className="shop-buy-btn"
                  disabled={!itemStock[item.id] || itemStock[item.id]?.stock === 0}
                  onClick={() => handleBuy(item)}
                >
                  {getRestockCountdownText(item.id)}
                </button>
              </div>
            ))}
            {exclusiveItemList.length === 0 && (
                 <div style={{ color: "#999", margin: "auto", textAlign: "center", width: "100%" }}>Belum ada item di kategori ini.</div>
            )}
          </div>
        )}
      </div>
      <div className="shop-footer">
        <div className="shop-timer">
          Shop refresh: {getShopRefreshCountdown()} {/* Timer ini spesifik untuk tab "Item" default */}
        </div>
      </div>
    </div>
  );
}

export default Shop;