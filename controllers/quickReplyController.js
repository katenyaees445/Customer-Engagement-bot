// controllers/quickReplyController.js

module.exports = {
  process: (lower, userId) => {
    if (lower.includes("menu")) {
      return "🍽 Here is our menu: https://example.com/menu.pdf";
    }

    if (lower.includes("location")) {
      return "📍 We're located at XYZ Lounge, Nairobi.";
    }

    if (lower.includes("offers") || lower.includes("promo")) {
      return "🔥 Tonight's offer: Buy 1 Get 1 cocktails till 11pm!";
    }

    if (lower.includes("music")) {
      return "🎶 Today we have Afrobeats + Amapiano playlist!";
    }

    return null; // no quick reply
  }
};
