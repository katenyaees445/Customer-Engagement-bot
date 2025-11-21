// controllers/messageController.js

const keywordService = require("../services/keywordService");
const openAIService = require("../services/openaiService");
const conversationService = require("../services/conversationService");
const quickReplyController = require("./quickReplyController");
const reservationController = require("./reservationController");

module.exports = {
  handleIncoming: async (client, msg) => {
    const userId = msg.from;
    const text = (msg.body || "").trim();
    const lower = text.toLowerCase();

    if (!text) return; // ignore empty messages

    console.log(`USER (${userId}):`, text);

    // Save user message in conversation history
    conversationService.add(userId, "user", text);

    // 1️⃣ Quick replies (fast handling)
    const quickReply = quickReplyController.process(lower, userId);
    if (quickReply) {
      await client.sendMessage(userId, quickReply);
      conversationService.add(userId, "assistant", quickReply);
      return;
    }

    // 2️⃣ Check if user is mid-reservation process
    const reservationHandled = await reservationController.handleStep(client, userId, text);
    if (reservationHandled) return;

    // 3️⃣ Keyword check – ignore messages without relevant keywords
    const shouldAIRespond = keywordService.containsKeyword(lower);
    if (!shouldAIRespond) {
      console.log("Ignored message – no keywords detected.");
      return; // silently ignore
    }

    // 4️⃣ Build conversation context for AI
    const messages = conversationService.buildPrompt(userId, text);

    // 5️⃣ Ask OpenAI for intelligent reply
    let reply;
    try {
      reply = await openAIService.ask(messages);
    } catch (err) {
      console.error("OpenAI error:", err);
      reply = null;
    }

    // 6️⃣ Fallback if AI fails
    const finalReply = reply || "Pole bro 😅, my brain hanged. Try again.";

    // 7️⃣ Send reply to user
    await client.sendMessage(userId, finalReply);

    // 8️⃣ Save assistant reply in conversation history
    conversationService.add(userId, "assistant", finalReply);
  }
};
