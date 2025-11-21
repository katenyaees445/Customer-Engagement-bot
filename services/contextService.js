// services/contextService.js
const fs = require("fs");
const path = require("path");

// -------------------------
// PATH TO DATABASE FILE
// -------------------------
const DB_PATH = path.join(__dirname, "../db/db.json");

// -------------------------
// LOAD DATABASE SAFELY
// -------------------------
function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { conversations: {}, reservations: {}, pendingReservation: {} };
    }
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8")) || { conversations: {}, reservations: {}, pendingReservation: {} };
  } catch (e) {
    console.error("DB load error:", e);
    return { conversations: {}, reservations: {}, pendingReservation: {} };
  }
}

// -------------------------
function saveDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("DB save error:", e);
  }
}

// Load database once
let db = loadDB();

// -------------------------
// CONVERSATION CONTEXT SERVICE
// -------------------------
const CONTEXT_SIZE = 6;

/**
 * Add a message to user conversation history
 */
function addToConversation(userId, role, text) {
  if (!db.conversations[userId]) db.conversations[userId] = [];
  db.conversations[userId].push({ role, text, ts: Date.now() });

  // Keep only last CONTEXT_SIZE messages
  if (db.conversations[userId].length > CONTEXT_SIZE) {
    db.conversations[userId] = db.conversations[userId].slice(-CONTEXT_SIZE);
  }

  saveDB(db);
}

/**
 * Get recent conversation context
 */
function getConversationContext(userId) {
  return db.conversations[userId] || [];
}

/**
 * Save a reservation for a user
 */
function saveReservation(userId, details) {
  if (!db.reservations[userId]) db.reservations[userId] = [];
  db.reservations[userId].push({ details, ts: Date.now() });
  saveDB(db);
}

/**
 * Mark that a user is in the middle of a reservation
 */
function setPendingReservation(userId) {
  if (!db.pendingReservation) db.pendingReservation = {};
  db.pendingReservation[userId] = true;
  saveDB(db);
}

/**
 * Clear a user's pending reservation
 */
function clearPendingReservation(userId) {
  if (db.pendingReservation && db.pendingReservation[userId]) {
    delete db.pendingReservation[userId];
    saveDB(db);
  }
}

/**
 * Check if user has a pending reservation
 */
function isPendingReservation(userId) {
  return !!(db.pendingReservation && db.pendingReservation[userId]);
}

module.exports = {
  addToConversation,
  getConversationContext,
  saveReservation,
  setPendingReservation,
  clearPendingReservation,
  isPendingReservation
};
