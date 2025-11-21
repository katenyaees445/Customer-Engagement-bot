const { KEYWORDS } = require("../config/constants");

function messageHasKeyword(text = "") {
    const lower = text.toLowerCase();
    return KEYWORDS.some(kw => lower.includes(kw));
}

module.exports = { messageHasKeyword };
