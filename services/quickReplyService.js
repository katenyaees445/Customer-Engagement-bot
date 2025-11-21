function checkQuickReply(lower) {
    if (lower.includes('music') || lower.includes('dj'))
        return '🎶 Tonight we have Afrobeats + local hits. Want to reserve a table?';

    if (lower.includes('promo') || lower.includes('offer'))
        return '🍹 Promo: Buy 1 get 1 cocktails until 11pm. Want a spot?';

    if (lower.includes('menu') || lower.includes('drink'))
        return '🍻 Menu: https://example.com/drinks.pdf';

    if (lower.includes('reserve') || lower.includes('booking'))
        return '✅ Cool! How many people and what time?';

    return null;
}

module.exports = { checkQuickReply };
