// /lib/quickReplies.js

function checkQuickReply(lower) {
  if (lower.includes("music") || lower.includes("dj") || lower.includes("playlist"))
    return "🎶 Tonight we have Afrobeats + local hits. Want to reserve a table? 😎";

  if (lower.includes("promo") || lower.includes("offer") || lower.includes("discount"))
    return "🍹 Promo: Buy 1 get 1 free cocktails until 11pm! Want to book a spot?";

  if (lower.includes("menu") || lower.includes("drinks"))
    return "🍻 Drinks menu: https://example.com/drinks.pdf — want a recommendation?";

  if (lower.includes("reserve") || lower.includes("booking") || lower.includes("table"))
    return "✅ Cool! How many people and what time?";

  return null;
}

module.exports = { checkQuickReply };
