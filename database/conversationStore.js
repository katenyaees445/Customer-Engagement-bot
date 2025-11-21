const { loadDB, saveDB } = require("./db");

const CONTEXT_LIMIT = 6;
let db = loadDB();

function addMessage(userId, role, text) {
  if (!db.conversations[userId]) db.conversations[userId] = [];
  db.conversations[userId].push({ role, text, ts: Date.now() });

  if (db.conversations[userId].length > CONTEXT_LIMIT) {
    db.conversations[userId] = db.conversations[userId].slice(-CONTEXT_LIMIT);
  }

  saveDB(db);
}

function getContext(userId) {
  return db.conversations[userId] || [];
}

module.exports = { addMessage, getContext };
