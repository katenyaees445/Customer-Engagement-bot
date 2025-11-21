// models/reservationModel.js
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

let db = { reservations: {} };

// Load DB if exists
if (fs.existsSync(DB_PATH)) {
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '{}');
  db.reservations = data.reservations || {};
}

// Save helper
function saveDB() {
  const fullDB = fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '{}') : {};
  fullDB.reservations = db.reservations;
  fs.writeFileSync(DB_PATH, JSON.stringify(fullDB, null, 2));
}

// Add a reservation
exports.addReservation = (userId, details) => {
  if (!db.reservations[userId]) db.reservations[userId] = [];
  db.reservations[userId].push({ details, ts: Date.now() });
  saveDB();
};

// Get reservations for a user
exports.getReservations = (userId) => {
  return db.reservations[userId] || [];
};

// Get all reservations (for admin view)
exports.getAllReservations = () => {
  return db.reservations;
};
