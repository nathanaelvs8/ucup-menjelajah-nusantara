import React, { useEffect, useState, useCallback, useRef } from "react";
import "./Shop.css";
import { addItemToInventory, addActivity } from "./utils"; // Pastikan addActivity diimpor
import Inventory from "./Inventory.jsx";
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
import MegalodonIcon from "../assets/inventory-items/Megalodon.png";
import OilIcon from "../assets/inventory-items/Oil.png"; 
import CookedMegalodonIcon from "../assets/inventory-items/CookedMegalodon.png";

const defaultItemList = [
  { id: "happiness_potion", name: "Happiness Potion", icon: HappinesPotionIcon, price: 2000, maxStock: 5 },
  { id: "Wood", name: "Wood", icon: LogIcon, price: 400, maxStock: 20 },
  { id: "meal_potion", name: "Meal Potion", icon: MealPotionIcon, price: 2000, maxStock: 5 },
  { id: "morning_dew_potion", name: "Morning Dew Potion", icon: MorningDewPotionIcon, price: 2000, maxStock: 5 },
  { id: "pearl", name: "Pearl", icon: PearlIcon, price: 120000, maxStock: 5 },
  { id: "ripped_cloth", name: "Ripped Cloth", icon: RippedClothIcon, price: 7000, maxStock: 5 },
  { id: "rope", name: "Rope", icon: RopeIcon, price: 5000, maxStock: 20 },
  { id: "coconut", name: "Coconut", icon: CoconutIcon, price: 6000, maxStock: 5 },
  { id: "gem", name: "Gem", icon: GemIcon, price: 200000, maxStock: 5 },
  { id: "cleanliness_potion", name: "Cleanliness Potion", icon: CleanlinessPotionIcon, price: 2000, maxStock: 5 },
];

const cookingItemList = [
  { id: "garlic", name: "Garlic", icon: GarlicIcon, price: 150, maxStock: 50 },
  { id: "goldfish", name: "Goldfish", icon: GoldfishIcon, price: 300, maxStock: 30 },
  { id: "onion", name: "Onion", icon: OnionIcon, price: 120, maxStock: 50 },
  { id: "salt", name: "Salt", icon: SaltIcon, price: 50, maxStock: 100 },
  { id: "shallot", name: "Shallot", icon: ShallotIcon, price: 180, maxStock: 50 },
  { id: "tuna", name: "Tuna", icon: TunaIcon, price: 500, maxStock: 25 },
  { id: "water", name: "Water", icon: WaterIcon, price: 30, maxStock: 100 },
  { id: "magic_powder", name: "Magic Powder", icon: MagicPowerIcon, price: 500, maxStock: 20 },
  { id: "magic_sauce", name: "Magic Sauce", icon: MagicSauceIcon, price: 750, maxStock: 15 },
  { id: "oil", name: "Oil", icon: OilIcon, price: 80, maxStock: 40 },
];

const exclusiveItemList = [
  { id: "megalodon_tooth", name: "Megalodon", icon: MegalodonIcon, price: 1000000, maxStock: 1 },
  { id: "cooked_megalodon", name: "Cooked Megalodon", icon: CookedMegalodonIcon, price: 2, maxStock: 100 },
];

const SHOP_REFRESH_INTERVAL = 5 * 60 * 1000;
const RESTOCK_INTERVAL = 4 * 60 * 60 * 1000;

const getRandomItems = (array, n) => [...array].sort(() => 0.5 - Math.random()).slice(0, n);

const allShopPossibleItems = [...defaultItemList, ...cookingItemList, ...exclusiveItemList];

function Shop({ onClose, playerMoney, setPlayerMoney, playerInventory, setPlayerInventory }) {
  const [activeTab, setActiveTab] = useState("Item");
  const [itemStock, setItemStock] = useState({});
  const [shopItems, setShopItems] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(0);
  const itemGridRef = useRef(null);

  // Inisialisasi dan refresh toko
  useEffect(() => {
    const savedShopItems = JSON.parse(localStorage.getItem("shopItems") || "null");
    const savedLastRefresh = parseInt(localStorage.getItem("shopLastRefresh") || "0", 10);
    let savedShopStock = JSON.parse(localStorage.getItem("shopStock") || "{}");
    const now = Date.now();

    if (!savedShopItems || now - savedLastRefresh > SHOP_REFRESH_INTERVAL) {
      const currentDefaultShopItems = getRandomItems(defaultItemList, 8);
      setShopItems(currentDefaultShopItems);
      setLastRefresh(now);
      localStorage.setItem("shopItems", JSON.stringify(currentDefaultShopItems));
      localStorage.setItem("shopLastRefresh", now.toString());
      const newStockForDefaultItemsDisplayed = { ...savedShopStock };
      currentDefaultShopItems.forEach(item => {
        newStockForDefaultItemsDisplayed[item.id] = { stock: item.maxStock, lastBought: 0 };
      });
      savedShopStock = newStockForDefaultItemsDisplayed;
    } else {
      setShopItems(savedShopItems);
      setLastRefresh(savedLastRefresh);
    }

    const initialStock = { ...savedShopStock };
    allShopPossibleItems.forEach(item => {
      if (!initialStock[item.id]) {
        initialStock[item.id] = { stock: item.maxStock, lastBought: 0 };
      }
    });
    setItemStock(initialStock);
    localStorage.setItem("shopStock", JSON.stringify(initialStock));
  }, []);

  // Restock otomatis
  useEffect(() => {
    const interval = setInterval(() => {
      setItemStock(prevStock => {
        const updatedStock = { ...prevStock };
        let changed = false;
        const now = Date.now();
        for (const itemId in updatedStock) {
          const stockInfo = updatedStock[itemId];
          const itemDetails = allShopPossibleItems.find(x => x.id === itemId);
          if (itemDetails && stockInfo.stock < itemDetails.maxStock && stockInfo.stock === 0 && stockInfo.lastBought !== 0 && now - stockInfo.lastBought >= RESTOCK_INTERVAL) {
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
  }, []);

  // KODINGAN LENGKAP: handleBuy yang sudah diperbaiki
  const handleBuy = (item) => {
    if (!itemStock[item.id] || itemStock[item.id].stock <= 0) {
      console.error("Stok habis!");
      return;
    }
    if (playerMoney < item.price) {
      alert("Uang tidak cukup!");
      return;
    }

    setPlayerMoney(prev => prev - item.price);
    setPlayerInventory(prev => addItemToInventory(prev, item.name));
    addActivity("Buy Item");

    setItemStock(prevStock => {
      const newStockState = {
        ...prevStock,
        [item.id]: {
          ...prevStock[item.id],
          stock: prevStock[item.id].stock - 1,
          lastBought: (prevStock[item.id].stock - 1 === 0) ? Date.now() : prevStock[item.id].lastBought,
        }
      };
      localStorage.setItem("shopStock", JSON.stringify(newStockState));
      return newStockState;
    });
  };

  // KODINGAN LENGKAP: getShopRefreshCountdown
  const getShopRefreshCountdown = () => {
    if (lastRefresh === 0) return "Loading...";
    const timeLeft = Math.max(0, SHOP_REFRESH_INTERVAL - (Date.now() - lastRefresh));
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const mins = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    const secs = Math.floor((timeLeft % (60 * 1000)) / 1000);
    return `${hours}h ${mins}m ${secs}s`;
  };

  // KODINGAN LENGKAP: getRestockCountdownText
  const getRestockCountdownText = (itemId) => {
    const stockInfo = itemStock[itemId];
    const itemDetails = allShopPossibleItems.find(i => i.id === itemId);

    if (!stockInfo || !itemDetails) return "Loading...";
    if (stockInfo.stock > 0) return "Buy";
    if (stockInfo.stock === 0 && stockInfo.lastBought === 0) {
        return `Restock in ~${Math.floor(RESTOCK_INTERVAL / (60 * 60 * 1000))}h`;
    }
    if (stockInfo.stock === 0 && stockInfo.lastBought !== 0) {
        const timeLeft = Math.max(0, RESTOCK_INTERVAL - (Date.now() - stockInfo.lastBought));
        if (timeLeft === 0) {
            return "Restocking...";
        }
        const hours = Math.floor(timeLeft / (60 * 60 * 1000));
        const mins = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        return `Restock in ${hours}h ${mins}m`;
    }
    return "Buy";
  };

  const renderItems = (items) => (
    <div className="shop-item-grid scroll-x" ref={itemGridRef}>
      {items.map(item => (
        <div className="shop-item-card" key={item.id}>
          <img src={item.icon} alt={item.name} />
          <div className="shop-item-name">{item.name}</div>
          <div className="shop-item-price">💰 {item.price}</div>
          <div className="shop-item-stock">
            Stock: {itemStock[item.id]?.stock ?? "N/A"} / {item.maxStock}
          </div>
          <button
            className="shop-buy-btn"
            disabled={!itemStock[item.id] || itemStock[item.id]?.stock <= 0}
            onClick={() => handleBuy(item)}
          >
            {getRestockCountdownText(item.id)}
          </button>
        </div>
      ))}
      {items.length === 0 && (
           <div style={{ color: "#999", margin: "auto", textAlign: "center", width: "100%" }}>Belum ada item di kategori ini.</div>
      )}
    </div>
  );

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
        {activeTab === "Item" && renderItems(shopItems)}
        {activeTab === "Cooking" && renderItems(cookingItemList)}
        {activeTab === "Exclusive" && renderItems(exclusiveItemList)}
      </div>
      <div className="shop-footer">
        <div className="shop-timer">
          Shop refresh: {getShopRefreshCountdown()}
        </div>
      </div>
    </div>
  );
}

export default Shop;