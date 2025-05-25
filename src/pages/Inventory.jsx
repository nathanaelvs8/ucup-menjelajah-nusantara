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
};

export default function Inventory({ inventory, onUseItem, onSellItem }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const containerRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  // Update posisi tooltip saat item dipilih
  useEffect(() => {
    if (selectedIndex === null) return;

    const container = containerRef.current;
    if (!container) return;

    const itemDiv = container.children[selectedIndex];
    if (!itemDiv) return;

    const rect = itemDiv.getBoundingClientRect();
    setTooltipPos({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    });
  }, [selectedIndex]);

  if (!inventory || inventory.length === 0) {
    return <p>No items in inventory.</p>;
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={containerRef}
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {inventory.map((item, i) => (
          <div
            key={i}
            style={{
              padding: "8px 12px",
              border: selectedIndex === i ? "2px solid green" : "1px solid #ccc",
              borderRadius: 6,
              cursor: "pointer",
              userSelect: "none",
              minWidth: 100,
              textAlign: "center",
              backgroundColor: selectedIndex === i ? "#d7f0d7" : "white",
            }}
            onClick={() => setSelectedIndex(i === selectedIndex ? null : i)}
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
        backgroundColor: "#222",
        color: "white",
        padding: 12,
        borderRadius: 8,
        boxShadow: "0 0 8px rgba(0,0,0,0.8)",
        zIndex: 1000,
        minWidth: 220,
      }}
    >
      <div><strong>{item}</strong></div>
      <div style={{ margin: "8px 0" }}>{details.description || "No description"}</div>

      {canSell && <div>Sell: get {details.sellGold} gold</div>}
      {canUse && <div>Use: available</div>}

      <div style={{ marginTop: 10, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        {canUse && <button onClick={onUse}>Use Item</button>}
        {canSell && <button onClick={onSell}>Sell Item</button>}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
