const { USER_COOLDOWN_MS } = require("../config/constants");

const lastRequestAt = new Map();

function isRateLimited(userId) {
    const last = lastRequestAt.get(userId) || 0;

    if (Date.now() - last < USER_COOLDOWN_MS) {
        return true;
    }

    lastRequestAt.set(userId, Date.now());
    return false;
}

module.exports = { isRateLimited };
