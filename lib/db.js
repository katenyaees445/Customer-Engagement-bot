const fs = require("fs");
const { DB_PATH } = require("../config/constants");

function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) return { conversations: {}, reservations: {}, pendingReservation: {} };
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8") || "{}");
  } catch (e) {
    console.error("DB load error:", e);
    return { conversations: {}, reservations: {}, pendingReservation: {} };
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("DB save error:", e);
  }
}

module.exports = { loadDB, saveDB };
