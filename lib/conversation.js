// /lib/conversation.js

const { saveDB } = require("./db");
const { CONTEXT_SIZE, USER_COOLDOWN_MS } = require("../config/constants");

const lastRequestAt = new Map();

function isRateLimited(userId) {
  const last = lastRequestAt.get(userId) || 0;
  if (Date.now() - last < USER_COOLDOWN_MS) return true;
  lastRequestAt.set(userId, Date.now());
  return false;
}

function addToConversation(db, userId, role, text) {
  if (!db.conversations[userId]) db.conversations[userId] = [];
  db.conversations[userId].push({ role, text, ts: Date.now() });

  if (db.conversations[userId].length > CONTEXT_SIZE) {
    db.conversations[userId] = db.conversations[userId].slice(-CONTEXT_SIZE);
  }

  saveDB(db);
}

function getConversationContext(db, userId) {
  return db.conversations[userId] || [];
}

function saveReservation(db, userId, details) {
  if (!db.reservations[userId]) db.reservations[userId] = [];
  db.reservations[userId].push({ details, ts: Date.now() });
  saveDB(db);
}

module.exports = {
  isRateLimited,
  addToConversation,
  getConversationContext,
  saveReservation
};
