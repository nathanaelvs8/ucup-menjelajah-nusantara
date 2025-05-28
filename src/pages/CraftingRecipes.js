// craftingRecipes.js
import { itemIcons } from "./Inventory.jsx";

const craftingRecipes = [
  {
    result: "Torch",
    materials: ["Wood", "Ripped Cloth", "Rope"]
  },
  {
    result: "Ancient Glass With Water",
    materials: ["Ancient Glass", "Water"]
  },
  {
    result: "Juice Coconut",
    materials: ["Coconut", "Ancient Glass With Water"]
  },
  {
    result: "Juice Wild Fruit",
    materials: ["Wild Fruit", "Ancient Glass With Water"]
  },
  {
    result: "Rod",
    materials: ["Rope", "Wood", "Fish Nail"]
  },
  {
    result: "Boat",
    materials: ["Wood", "Wood", "Wood", "Rope", "Special Fish Skin"]
  },
  {
    result: "Archipelago Talisman",
    materials: [
      "Rare Herbal Grass", "Special Fish Skin", "Special Fish Skin",
      "Wood", "Wood", "Wood",
      "Rusty Iron", "Rusty Iron"
    ],
    gold: 10000
  }
];

export default craftingRecipes;
