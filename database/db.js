const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { conversations: {}, reservations: {}, pending: {} };
    }
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw || "{}");
  } catch (err) {
    console.error("DB Load Error:", err);
    return { conversations: {}, reservations: {}, pending: {} };
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("DB Save Error:", err);
  }
}

module.exports = { loadDB, saveDB };
