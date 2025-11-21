const { saveDB, loadDB } = require("../lib/db");
const { CONTEXT_SIZE } = require("../config/constants");

let db = loadDB();

function addToConversation(userId, role, text) {
    if (!db.conversations[userId]) db.conversations[userId] = [];
    db.conversations[userId].push({ role, text, ts: Date.now() });

    if (db.conversations[userId].length > CONTEXT_SIZE) {
        db.conversations[userId] =
            db.conversations[userId].slice(-CONTEXT_SIZE);
    }

    saveDB(db);
}

function getConversation(userId) {
    db = loadDB();
    return db.conversations[userId] || [];
}

module.exports = { addToConversation, getConversation };
