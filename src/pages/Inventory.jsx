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
import CookedTunaIcon from "../assets/inventory-items/CookedTuna.png";
import CookedMegalodonIcon from "../assets/inventory-items/CookedMegalodon.png";
import CookedGoldfishIcon from "../assets/inventory-items/CookedGoldfish.png";
import GarlicIcon from "../assets/inventory-items/Garlic.png";
import MagicPowderIcon from "../assets/inventory-items/MagicPower.png";
import MagicSauceIcon from "../assets/inventory-items/MagicSauce.png";
import OnionIcon from "../assets/inventory-items/Onion.png";
import SaltIcon from "../assets/inventory-items/Salt.png";
import ShallotIcon from "../assets/inventory-items/Shallot.png";
import CleanlinessPotionIcon from "../assets/inventory-items/CleanlinessPotion.png";
import HappinesPotionIcon from "../assets/inventory-items/HappinesPotion.png";
import MealPotionIcon from "../assets/inventory-items/MealPotion.png";
import MorningDewPotionIcon from "../assets/inventory-items/MorningDewPotion.png";
import OilIcon from "../assets/inventory-items/Oil.png"; 



// === ITEM ICONS MAPPING ===
export const itemIcons = {
  "Ancient Glass": AncientGlassIcon,
  "Ancient Glass With Water": AncientGlassWithWaterIcon,
  "Boat": BoatIcon,
  "Coconut": CoconutIcon,
    "Cooked Tuna": CookedTunaIcon,
  "Cooked Megalodon": CookedMegalodonIcon,
  "Cooked Goldfish": CookedGoldfishIcon,
  "Fish Nail": FishNailIcon,
  "Special Fish Skin": SpecialFishSkinIcon,
  "Gem": GemIcon,
  "Goldfish": GoldfishIcon,
    "Garlic": GarlicIcon,
  "Juice Coconut": CoconutJuiceIcon,
  "Juice Wild Fruit": WildFruitJuiceIcon,
  "Megalodon": MegalodonIcon,
  "Magic Powder": MagicPowderIcon,
  "Magic Sauce": MagicSauceIcon,
  "Archipelago Talisman": ArchipelagoTalismanIcon,
  "Onion": OnionIcon,
  "Oil": OilIcon, 
  "Pearl": PearlIcon,
  "Pickaxe": PickaxeIcon,
  "Rare Herbal Grass": RareHerbalGrassIcon,
  "Ripped Cloth": RippedClothIcon,
  "Rod": RodIcon,
  "Rope": RopeIcon,
  "Rusty Iron": RustMetalIcon,
    "Salt": SaltIcon,
    "Shallot": ShallotIcon,
    "Torch": TorchIcon,
  "Tuna": TunaIcon,
  "Water": WaterIcon,
  "Wild Fruit": WildFruitIcon,
  "Wood": LogIcon,
  "Cleanliness Potion": CleanlinessPotionIcon,
  "Happiness Potion": HappinesPotionIcon,
  "Meal Potion": MealPotionIcon,
  "Morning Dew Potion": MorningDewPotionIcon,
};

// === ITEM DETAILS (DESKRIPSI, EFEK, HARGA JUAL, DST) ===
export const itemDetails = {
  "Ancient Glass": { 
    description: "Antique glass, used for advanced crafting.",
    sellGold: 400,
    source: "Scattered fragments littering the beach shores, remnants of civilizations long past. Your inventory permits only a single specimen."
  },
  "Ancient Glass With Water": { 
    description: "A glass filled with mysterious water.", 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 20, 100) }),
    source: "Meticulously assembled through deliberate crafting processes, combining ancient vessels with purified essence."
  },
  "Boat": { 
    description: "A small boat. Maybe you can use it to cross water.",
    source: "Constructed through meticulous crafting techniques, requiring precise assembly of wooden components and binding materials."
  },
  "Cooked Megalodon": {
  description: "Roasted giant megalodon steak! All stats become 100 for 3 days.",
  sellGold: 80000000,
  useEffect: (stat) => {
    // Simpan buff ke localStorage, buff aktif sampai hari ke-N berikutnya
    const playerData = JSON.parse(localStorage.getItem("playerData") || "{}");
    const nowDay = playerData.time ? playerData.time.day : 0; // sesuaikan dengan cara kamu simpan hari
    playerData.megalodonBuffUntil = ((nowDay ?? 0) + 3) % 7; // 3 hari ke depan, wrap ke minggu
    localStorage.setItem("playerData", JSON.stringify(playerData));
    // Stat langsung 100
    return { meal: 100, sleep: 100, happiness: 100, cleanliness: 100 };
  },
  source: "Cooked megalodon. Full buff for 3 days!"
},

  "Cooked Tuna": {
    description: "Grilled tuna, delicious and filling. Restores 80 meal.",
    sellGold: 350,
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 80, 100) }),
    source: "Cook fresh Tuna on a campfire or grill."
  },
   "Cooked Goldfish": {
    description: "A plate of seasoned, grilled goldfish. Restores 40 meal.",
    sellGold: 180,
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 40, 100) }),
    source: "Goldfish, after a good grilling. Yummy!"
  },
  "Coconut": { 
    description: "Tropical fruit, edible or used for crafting.", 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 20, 100) }),
    source: "Harvested from the towering palm trees that line the coastal regions, requiring careful extraction from elevated branches."
  },
  "Fish Nail": { 
    description: "Rare nail from a fish. Useful for crafting.",
    source: "Exclusively obtained from the solitary merchant residing beside the lake waters, a one-time acquisition opportunity."
  },
  "Special Fish Skin": { 
    description: "Rare fish skin used for crafting high-quality gear.",
    source: "Occasionally retrieved from the underground chambers, though fortune's favor determines success when casting lines into mysterious waters."
  },
  "Gem": { 
    description: "Beautiful gemstone. Can be sold for a high price.", 
    sellGold: 800,
    source: "Concealed within the labyrinthine passages of underground chambers, awaiting discovery by persistent explorers."
  },
  "Goldfish": { 
    description: "Small golden fish, restores 20 meal when consumed.", 
    sellGold: 100, 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 20, 100) }),
    source: "Common aquatic specimens caught through patient angling in various water bodies throughout the region."
  },
  "Garlic": {
  description: "Aromatic garlic, used for advanced recipes.",
  sellGold: 15,
  useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 5, 100) }),
  source: "Available in the equipment shop or foraged in the wild."
},
  "Juice Coconut": { 
    description: "Coconut juice. Refreshing and tasty.", 
    sellGold: 60, 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 30, 100) }),
    source: "Produced through systematic crafting procedures, extracting and processing the liquid essence from tropical fruits."
  },
  "Juice Wild Fruit": { 
    description: "Juice from wild fruit. Somewhat healthy.", 
    sellGold: 60, 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 50, 100) }),
    source: "Created via specialized crafting methods, distilling the nutritional properties of untamed botanical specimens."
  },
  "Megalodon": { 
    description: "Ancient giant shark, fully restores all stats when consumed.", 
    sellGold: 5000, 
    useEffect: (stat) => ({ meal: 100, sleep: 100, happiness: 100, cleanliness: 100 }),
    source: "Extraordinarily rare aquatic behemoth that occasionally surfaces from the lake's deepest recesses, appearing unpredictably."
  },
"Magic Powder": {
  description: "MSG - Magic Powder. Adds umami to any dish!",
  sellGold: 35,
  useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 5, 100) }),
  source: "Secret seasoning found in hidden merchant stalls."
},
"Magic Sauce": {
  description: "A bottle of magic sauce. Elevates every meal.",
  sellGold: 55,
  useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 5, 100) }),
  source: "Occasionally offered by rare wandering vendors."
},
"Onion": {
  description: "Crunchy onion. Basic ingredient for cooking.",
  sellGold: 10,
  useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 5, 100) }),
  source: "Gathered from vegetable patches around the village."
},
 "Oil": { // Tambahkan ini
    description: "Cooking oil for various recipes.", // Contoh deskripsi
    sellGold: 10, // Contoh harga jual
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 2, 100) }), // Contoh efek jika bisa dimakan langsung
    source: "Purchased from the shop or found in kitchens." // Contoh sumber
 },
  "Archipelago Talisman": { 
    description: "Strange talisman from the jungle. It feels powerful.",
    useEffect: (stat) => stat, // dummy, biar tombol Use muncul, event sebenarnya handle di Secret.jsx!
    source: "Fashioned through intricate crafting rituals, incorporating mystical elements gathered from dense tropical vegetation."
  },
  "Pearl": { 
    description: "A shiny pearl. Valuable for trade or crafting.", 
    sellGold: 400,
    source: "Exceptionally uncommon discovery obtained through persistent fishing endeavors, granted by aquatic providence."
  },
  "Pickaxe": { 
    description: "Strong tool for mining stones and minerals.",
    source: "Standard equipment provided to every adventurer upon beginning their journey, fundamental survival apparatus."
  },
  "Rare Herbal Grass": { 
    description: "Very rare herb, used in special recipes.", 
    sellGold: 300,
    source: "Exclusively acquired from the botanical specialist dwelling among the mountain peaks, keeper of highland flora."
  },
  "Ripped Cloth": { 
    description: "Torn cloth, can be reused for crafting.", 
    sellGold: 25,
    source: "Discarded textile fragments dispersed across various terrains, abandoned possessions awaiting reclamation."
  },
  "Rod": { 
    description: "Fishing rod for catching fish.",
    source: "Expertly assembled through deliberate crafting processes, combining materials into efficient angling equipment."
  },
  "Rope": { 
    description: "Strong rope. Useful for various purposes.", 
    sellGold: 40,
    source: "Discovered among the dense forest undergrowth, naturally occurring fibrous materials suitable for binding purposes."
  },
  "Rusty Iron": { 
    description: "Old rusty metal. Maybe can be recycled.", 
    sellGold: 40,
    source: "Extracted from weathered coastal rock formations through systematic demolition of mineral deposits."
  },
"Salt": {
  description: "Salt. Essential for seasoning food.",
  sellGold: 5,
  useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 5, 100) }),
  source: "Harvested from salt lakes or purchased in town."
},
"Shallot": {
  description: "Mild shallot. Perfect for enhancing flavor.",
  sellGold: 18,
  useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 5, 100) }),
  source: "Commonly found in wild fields or local markets."
},

  "Torch": { 
    description: "Simple torch. Lights up dark areas.",
    source: "Manufactured through careful crafting procedures, combining combustible materials with sustainable flame sources."
  },
  "Tuna": { 
    description: "Large nutritious fish, restores 50 meal when consumed.", 
    sellGold: 250, 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 50, 100) }),
    source: "Moderately-sized aquatic creatures inhabiting the deeper sections of lake waters, caught through skilled angling."
  },
  "Water": { 
    description: "Clean water for drinking or crafting.", 
    sellGold: 5, 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 3, 100) }),
    source: "Continuously available from the residential water supply system, fundamental resource for sustenance and production."
  },
  "Wild Fruit": { 
    description: "Wild fruit, edible or used for recipes.", 
    sellGold: 10, 
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 10, 100) }),
    source: "Gathered from naturally occurring fruit-bearing trees scattered throughout untamed wilderness areas."
  },
  "Wood": {
    description: "Basic material for crafting tools and buildings.",
    sellGold: 200,
    source: "Obtained from lifeless tree specimens found in desolate woodland areas, providing essential construction materials."
  },
    "Cleanliness Potion": {
    description: "A potion that instantly restores your cleanliness to full.",
    sellGold: 60,
    useEffect: (stat) => ({ ...stat, cleanliness: 50 }),
    source: "Brewed by a mysterious alchemist from rare herbs."
  },
  "Happiness Potion": {
    description: "This potion brings instant joy and restores happiness to 100.",
    sellGold: 60,
    useEffect: (stat) => ({ ...stat, happiness: 50 }),
    source: "Distilled from rainbow droplets and magical smiles."
  },
  "Meal Potion": {
    description: "A quick-fix potion to fully restore your meal bar.",
    sellGold: 60,
    useEffect: (stat) => ({ ...stat, meal: Math.min(stat.meal + 20, 100) }),
    source: "Commonly found in adventure starter packs."
  },
  "Morning Dew Potion": {
    description: "Keeps you awake and restores your sleep stat to full.",
    sellGold: 60,
    useEffect: (stat) => ({ ...stat, sleep: 50 }),
    source: "Collected from the leaves at dawn in enchanted forests."
  },

};

export default function Inventory({ inventory, onUseItem, onSellItem, canUseTalisman }) {
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
          // ⬇⬇⬇ Tambahkan baris ini! ⬇⬇⬇
          canUseTalisman={canUseTalisman}
        />
      )}

    </div>
  );
}

// === Tooltip Komponen Dengan Portal ===
function Tooltip({ item, position, onUse, onSell, onClose, canUseTalisman }) {
  const details = itemDetails[item] || {};
  const isTalisman = item === "Archipelago Talisman";
  const canUse = (typeof details.useEffect === "function" && !isTalisman) || (isTalisman && canUseTalisman);

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
            backgroundColor: canUse ? "#3b82f6" : "#888",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: canUse ? "pointer" : "not-allowed",
            fontWeight: "bold",
          }}
          disabled={!canUse}
          title={
            isTalisman && !canUseTalisman && (
            <div style={{ color: "#f87171", fontSize: 13, fontWeight: "bold", marginTop: 8 }}>
              You can only use this in the ritual circle!
            </div>
          )}

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
