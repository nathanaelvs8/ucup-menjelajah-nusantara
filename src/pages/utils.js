export function getGreeting(currentHour, username = "Player") {
  let greeting;
  if (currentHour >= 5 && currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Evening";
  }
  return `${greeting}, ${username}`;
}

// src/utils.js

// Fungsi: Tambah area ke visitedAreas
export function addVisitedArea(areaName) {
  let visited = JSON.parse(localStorage.getItem("visitedAreas") || "[]");
  if (!visited.includes(areaName)) {
    visited.push(areaName);
    localStorage.setItem("visitedAreas", JSON.stringify(visited));
  }
}

// Fungsi (opsional): Tambah aktivitas ke activityFlags
export function addActivity(activityName) {
  let flags = JSON.parse(localStorage.getItem("activityFlags") || "{}");
  if (!flags[activityName]) {
    flags[activityName] = true;
    localStorage.setItem("activityFlags", JSON.stringify(flags));
  }
}

// Fungsi (opsional): Tambah NPC yang pernah diinteraksi
export function addNPCInteract(npcName) {
  let npcs = JSON.parse(localStorage.getItem("interactedNPCs") || "[]");
  if (!npcs.includes(npcName)) {
    npcs.push(npcName);
    localStorage.setItem("interactedNPCs", JSON.stringify(npcs));
  }
}

// utils.js
export function addItemToInventory(inventory, item) {
  if (inventory.length >= 100) return inventory;
  return [...inventory, item];
}
