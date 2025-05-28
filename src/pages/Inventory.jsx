import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import inventoryIcon from "../assets/ui/Inventory.png";
// ICON IMPORTS (pastikan semua path benar!)
import AncientGlassIcon from "../assets/inventory-items/AncientGlass.png";
import AncientGlassWithWaterIcon from "../assets/inventory-items/AncientGlassWithWater.png";
import BoatIcon from "../assets/inventory-items/Boat.png";
import CoconutIcon from "../assets/inventory-items/Coconut.png";
import FishNailIcon from "../assets/inventory-items/FishNail.png";
import SpecialFishSkinIcon from "../assets/inventory-items/FishSkin.png";
import GemIcon from "../assets/inventory-items/Gem.png";
import GoldfishIcon from "../assets/inventory-items/Goldfish.png";
import CoconutJuiceIcon from "../assets/inventory-items/JuiceCoconut.png";
import WildFruitJuiceIcon from "../assets/inventory-items/JuiceWildFruit.png";
import LogIcon from "../assets/inventory-items/Log.png";
import MegalodonIcon from "../assets/inventory-items/Megalodon.png";
import ArchipelagoTalismanIcon from "../assets/inventory-items/MysteryJungle.png";
import PearlIcon from "../assets/inventory-items/Pearl.png";
import PickaxeIcon from "../assets/inventory-items/Pickaxe.png";
import RareHerbalGrassIcon from "../assets/inventory-items/RareHerbalGrass.png";
import RippedClothIcon from "../assets/inventory-items/RippedCloth.png";
import RodIcon from "../assets/inventory-items/Rod.png";
import RopeIcon from "../assets/inventory-items/Rope.png";
import RustMetalIcon from "../assets/inventory-items/RustMetal.png";
import TorchIcon from "../assets/inventory-items/Torch.png";
import TunaIcon from "../assets/inventory-items/Tuna.png";
import WaterIcon from "../assets/inventory-items/Water.png";
import WildFruitIcon from "../assets/inventory-items/WildFruit.png";

// === ITEM ICONS MAPPING ===
export const itemIcons = {
  "Ancient Glass": AncientGlassIcon,
  "Ancient Glass With Water": AncientGlassWithWaterIcon,
  "Boat": BoatIcon,
  "Coconut": CoconutIcon,
  "Fish Nail": FishNailIcon,
  "Special Fish Skin": SpecialFishSkinIcon,
  "Gem": GemIcon,
  "Goldfish": GoldfishIcon,
  "Juice Coconut": CoconutJuiceIcon,
  "Juice Wild Fruit": WildFruitJuiceIcon,
  "Megalodon": MegalodonIcon,
  "Archipelago Talisman": ArchipelagoTalismanIcon,
  "Pearl": PearlIcon,
  "Pickaxe": PickaxeIcon,
  "Rare Herbal Grass": RareHerbalGrassIcon,
  "Ripped Cloth": RippedClothIcon,
  "Rod": RodIcon,
  "Rope": RopeIcon,
  "Rusty Iron": RustMetalIcon,
  "Torch": TorchIcon,
  "Tuna": TunaIcon,
  "Water": WaterIcon,
  "Wild Fruit": WildFruitIcon,
  "Wood": LogIcon,
};

// === ITEM DETAILS (DESKRIPSI, EFEK, HARGA JUAL, DST) ===
export const itemDetails = {
  "Ancient Glass": { 
    description: "Antique glass, used for advanced crafting." 
  },
  "Ancient Glass With Water": { 
    description: "A glass filled with mysterious water." 
  },
  "Boat": { 
    description: "A small boat. Maybe you can use it to cross water." 
  },
  "Coconut": { 
    description: "Tropical fruit, edible or used for crafting.", 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 20, 100) }) 
  },
  "Fish Nail": { 
    description: "Rare nail from a fish. Useful for crafting."
  },
  "Special Fish Skin": { 
    description: "Rare fish skin used for crafting high-quality gear." 
  },
  "Gem": { 
    description: "Beautiful gemstone. Can be sold for a high price.", 
    sellGold: 800 
  },
  "Goldfish": { 
    description: "Small golden fish, restores 20 meal when consumed.", 
    sellGold: 100, 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 20, 100) }) 
  },
  "Juice Coconut": { 
    description: "Coconut juice. Refreshing and tasty.", sellGold: 60, 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 15, 100) }) 
  },
  "Juice Wild Fruit": { 
    description: "Juice from wild fruit. Somewhat healthy.", sellGold: 60, 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 12, 100) }) 
  },
  "Megalodon": { 
    description: "Ancient giant shark, fully restores all stats when consumed.", sellGold: 1000, useEffect: (stat) => ({ meal: 100, sleep: 100, happiness: 100, cleanliness: 100 }) 
  },
  "Archipelago Talisman": { 
    description: "Strange talisman from the jungle. It feels powerful.", 
    sellGold: 200 
  },
  "Pearl": { 
    description: "A shiny pearl. Valuable for trade or crafting.", 
    sellGold: 400 
  },
  "Pickaxe": { 
    description: "Strong tool for mining stones and minerals."
  },
  "Rare Herbal Grass": { 
    description: "Very rare herb, used in special recipes.", 
    ellGold: 300 
  },
  "Ripped Cloth": { 
    description: "Torn cloth, can be reused for crafting.", 
    sellGold: 25 
  },
  "Rod": { 
    description: "Fishing rod for catching fish." 
  },
  "Rope": { 
    description: "Strong rope. Useful for various purposes.", 
    sellGold: 40 
  },
  "Rusty Iron": { 
    description: "Old rusty metal. Maybe can be recycled.", 
    sellGold: 40 
  },
  "Torch": { 
    description: "Simple torch. Lights up dark areas." 
  },
  "Tuna": { 
    description: "Large nutritious fish, restores 50 meal when consumed.", 
    sellGold: 250, 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 50, 100) }) 
  },
  "Water": { 
    description: "Clean water for drinking or crafting.", 
    sellGold: 5, 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 3, 100) }) 
  },
  "Wild Fruit": { 
    description: "Wild fruit, edible or used for recipes.", 
    sellGold: 10, 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 10, 100) }) 
  },
    "Wood": {
    description: "Basic material for crafting tools and buildings.",
    sellGold: 200,
  },
};

export default function Inventory({ inventory, onUseItem, onSellItem }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const containerRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const itemRefs = useRef([]);

  // Padding inventory supaya 100 slot (10x10 grid)
  const paddedInventory = [
    ...inventory.slice(0, 100),
    ...Array(100 - inventory.length).fill(null),
  ];

  useEffect(() => {
    if (selectedIndex === null) return;
    const itemElement = itemRefs.current[selectedIndex];
    if (!itemElement) return;

    // Tooltip di posisi global, bukan relatif ke modal
    const rect = itemElement.getBoundingClientRect();
    setTooltipPos({
      top: rect.top + rect.height / 2,
      left: rect.right + 8, // Jarak ke kanan dari slot
    });
  }, [selectedIndex]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }} ref={containerRef}>
      <div
        className="inventory-grid"
        style={{
          gridTemplateColumns: "repeat(10, 1fr)",
          gridTemplateRows: "repeat(10, 1fr)",
          gap: "6px",
          width: "100%",
          height: "400px",
        }}
      >
        {paddedInventory.map((item, i) => (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className="inventory-slot"
            onClick={() => item && setSelectedIndex(i === selectedIndex ? null : i)}
            style={{
              border: selectedIndex === i && item ? "2px solid #4ade80" : "1px solid #555",
              background: item ? "#222" : "#1a1a1a",
              cursor: item ? "pointer" : "default",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {item && itemIcons[item] &&
              <img src={itemIcons[item]} alt={item} style={{
                width: "32px", height: "32px", display: "block"
              }} />
            }
          </div>
        ))}
      </div>
      {selectedIndex !== null && paddedInventory[selectedIndex] && (
        <Tooltip
          item={paddedInventory[selectedIndex]}
          position={tooltipPos}
          onUse={() => {
            onUseItem && onUseItem(paddedInventory[selectedIndex]);
            setSelectedIndex(null);
          }}
          onSell={() => {
            onSellItem && onSellItem(paddedInventory[selectedIndex]);
            setSelectedIndex(null);
          }}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  );
}

// === Tooltip Komponen Dengan Portal ===
function Tooltip({ item, position, onUse, onSell, onClose }) {
  const details = itemDetails[item] || {};
  const canUse = typeof details.useEffect === "function";
  const canSell = details.sellGold > 0;

  // Tooltip keluar di body (portal), tidak pernah kepotong modal
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        backgroundColor: "#1f2937",
        color: "#f9fafb",
        padding: 16,
        borderRadius: 10,
        boxShadow: "0 6px 40px 6px rgba(0,0,0,0.5)",
        border: "1.5px solid #4b5563",
        zIndex: 2100,
        minWidth: 220,
        maxWidth: 340,
        fontSize: 15,
        pointerEvents: "auto",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "17px", marginBottom: "10px", color: "#fbbf24" }}>
        {item}
      </div>
      <div style={{ margin: "10px 0", fontSize: "15px", lineHeight: "1.45", color: "#d1d5db" }}>
        {details.description || "No description"}
      </div>

      {canSell && (
        <div style={{ color: "#10b981", fontSize: "14px", fontWeight: "bold", marginBottom: 5 }}>
          💰 Sell: {details.sellGold} gold
        </div>
      )}
      {canUse && (
        <div style={{ color: "#3b82f6", fontSize: "14px", fontWeight: "bold", marginBottom: 5 }}>
          ✨ Can be used
        </div>
      )}

      <div style={{
        marginTop: 15,
        display: "flex",
        gap: 8,
        justifyContent: "flex-end",
        flexWrap: "wrap"
      }}>
        {canUse && (
          <button
            onClick={onUse}
            style={{
              padding: "6px 13px",
              fontSize: "13px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Use
          </button>
        )}
        {canSell && (
          <button
            onClick={onSell}
            style={{
              padding: "6px 13px",
              fontSize: "13px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Sell
          </button>
        )}
        <button
          onClick={onClose}
          style={{
            padding: "6px 13px",
            fontSize: "13px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}
