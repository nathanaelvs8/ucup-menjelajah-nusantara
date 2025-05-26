import React, { useState, useRef, useEffect } from "react";

// Data detail item, bisa diubah atau ditambah sesuai kebutuhan
const itemDetails = {
  Wood: {
    description: "Basic material for crafting tools and buildings.",
    sellGold: 200,
  },
  "Special Fish Skin": {
    description: "Rare fish skin used for crafting high-quality gear.",
    sellGold: 0,
  },
  "Hunger Potion": {
    description: "Herbal drink that reduces hunger and boosts energy.",
    useEffect: (status) => ({ ...status, meal: Math.min(status.meal + 100, 100) }),
  },
  "Fishing Rod": {
    description: "Tool for catching fish in rivers, lakes, or sea.",
  },
  Pickaxe: {
    description: "Strong tool for mining stones and minerals.",
  },
  Coconut: {
    description: "Tropical fruit, edible or used for crafting.",
    useEffect: (status) => ({ ...status, meal: Math.min(status.meal + 20, 100) }),
  },
  Goldfish: {
    description: "Small golden fish, restores 20 meal when consumed.",
    sellGold: 100,
    useEffect: (status) => ({ ...status, meal: Math.min(status.meal + 20, 100) }),
  },
  Tuna: {
    description: "Large nutritious fish, restores 50 meal when consumed.",
    sellGold: 250,
    useEffect: (status) => ({ ...status, meal: Math.min(status.meal + 50, 100) }),
  },
  Megalodon: {
    description: "Ancient giant shark, fully restores all stats when consumed.",
    sellGold: 1000,
    useEffect: (status) => ({
      meal: 100,
      sleep: 100,
      happiness: 100,
      cleanliness: 100,
    }),
  },
};

export default function Inventory({ inventory, onUseItem, onSellItem }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const containerRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const itemRefs = useRef([]);

  // Update posisi tooltip saat item dipilih
  useEffect(() => {
    if (selectedIndex === null) return;

    const itemElement = itemRefs.current[selectedIndex];
    if (!itemElement) return;

    const itemRect = itemElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Posisi relatif terhadap container inventory
    const relativeTop = itemRect.top - containerRect.top;
    const relativeLeft = itemRect.right - containerRect.left + 10; // 10px gap ke kanan
    
    setTooltipPos({
      top: relativeTop,
      left: relativeLeft,
    });
  }, [selectedIndex]);

  if (!inventory || inventory.length === 0) {
    return <p style={{ color: "white" }}>No items in inventory.</p>;
  }

  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {inventory.map((item, i) => (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            style={{
              padding: "8px 12px",
              border: selectedIndex === i ? "2px solid #4ade80" : "1px solid #666",
              borderRadius: 6,
              cursor: "pointer",
              userSelect: "none",
              minWidth: 100,
              textAlign: "center",
              backgroundColor: selectedIndex === i ? "#22c55e" : "#888",
              color: selectedIndex === i ? "#000" : "#fff",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
            onClick={() => setSelectedIndex(i === selectedIndex ? null : i)}
            onMouseEnter={(e) => {
              if (selectedIndex !== i) {
                e.target.style.backgroundColor = "#999";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedIndex !== i) {
                e.target.style.backgroundColor = "#888";
              }
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <Tooltip
          item={inventory[selectedIndex]}
          position={tooltipPos}
          onUse={() => {
            onUseItem && onUseItem(inventory[selectedIndex]);
            setSelectedIndex(null);
          }}
          onSell={() => {
            onSellItem && onSellItem(inventory[selectedIndex]);
            setSelectedIndex(null);
          }}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  );
}

function Tooltip({ item, position, onUse, onSell, onClose }) {
  const details = itemDetails[item] || {};
  const canUse = typeof details.useEffect === "function";
  const canSell = details.sellGold > 0;

  return (
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        backgroundColor: "#1f2937",
        color: "#f9fafb",
        padding: 12,
        borderRadius: 8,
        boxShadow: "0 0 20px rgba(0,0,0,0.8)",
        border: "1px solid #4b5563",
        zIndex: 1000,
        minWidth: 220,
        maxWidth: 280,
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "8px", color: "#fbbf24" }}>
        {item}
      </div>
      <div style={{ margin: "8px 0", fontSize: "14px", lineHeight: "1.4", color: "#d1d5db" }}>
        {details.description || "No description"}
      </div>

      {canSell && (
        <div style={{ color: "#10b981", fontSize: "14px", fontWeight: "bold" }}>
          💰 Sell: {details.sellGold} gold
        </div>
      )}
      {canUse && (
        <div style={{ color: "#3b82f6", fontSize: "14px", fontWeight: "bold" }}>
          ✨ Can be used
        </div>
      )}

      <div style={{ 
        marginTop: 12, 
        display: "flex", 
        gap: 8, 
        justifyContent: "flex-end",
        flexWrap: "wrap"
      }}>
        {canUse && (
          <button 
            onClick={onUse}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
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
              padding: "6px 12px",
              fontSize: "12px",
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
            padding: "6px 12px",
            fontSize: "12px",
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
    </div>
  );
}