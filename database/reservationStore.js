const { loadDB, saveDB } = require("./db");

let db = loadDB();

function startPending(userId) {
  db.pending[userId] = true;
  saveDB(db);
}

function clearPending(userId) {
  delete db.pending[userId];
  saveDB(db);
}

function isPending(userId) {
  return !!db.pending[userId];
}

function saveReservation(userId, details) {
  if (!db.reservations[userId]) db.reservations[userId] = [];
  db.reservations[userId].push({ details, ts: Date.now() });
  saveDB(db);
}

module.exports = {
  startPending,
  clearPending,
  isPending,
  saveReservation
};
