const { saveDB, loadDB } = require("../lib/db");
let db = loadDB();

function startReservation(userId) {
    db.pendingReservation[userId] = true;
    saveDB(db);
}

function completeReservation(userId, details) {
    if (!db.reservations[userId]) db.reservations[userId] = [];
    db.reservations[userId].push({ details, ts: Date.now() });
    delete db.pendingReservation[userId];
    saveDB(db);
}

function isPending(userId) {
    return db.pendingReservation[userId] === true;
}

module.exports = { startReservation, completeReservation, isPending };
