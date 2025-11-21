const keywordService = require("../services/keywordService");
const quickReplyService = require("../services/quickReplyService");
const contextService = require("../services/contextService");
const rateLimitService = require("../services/rateLimitService");
const openaiService = require("../services/openaiService");
const reservationService = require("../services/reservationService");

module.exports = {
    handleIncomingMessage: async (client, message) => {
        try {
            if (message.fromMe) return;

            const userId = message.from;
            const text = (message.body || "").trim();
            const lower = text.toLowerCase();

            if (!text) return;

            console.log(`[MSG] ${userId} -> ${text}`);

            // 1. RATE LIMIT
            if (rateLimitService.isRateLimited(userId)) {
                console.log("Rate limited:", userId);
                return;
            }

            // 2. SAVE USER MESSAGE IN CONTEXT
            contextService.addMessage(userId, "user", text);

            // 3. CHECK IF A RESERVATION IS IN PROGRESS
            if (reservationService.isPending(userId)) {
                reservationService.saveReservation(userId, text);

                await client.sendMessage(
                    userId,
                    `✅ Got it! Reservation saved: *${text}*. We'll confirm shortly.`
                );

                contextService.addMessage(
                    userId,
                    "assistant",
                    `Saved reservation: ${text}`
                );

                return;
            }

            // 4. CHECK QUICK REPLIES (fast responses)
            const quickReply = quickReplyService.getQuickReply(lower);

            if (quickReply) {
                await client.sendMessage(userId, quickReply);
                contextService.addMessage(userId, "assistant", quickReply);

                if (lower.includes("reserve") || lower.includes("booking")) {
                    reservationService.setPending(userId);
                }

                return;
            }

            // 5. CHECK IF MESSAGE SHOULD TRIGGER AI
            const isKeyword = keywordService.hasKeyword(lower);

            if (!isKeyword) {
                console.log("Ignored (no keyword):", lower);
                return;
            }

            // 6. BUILD AI PROMPT
            const promptMessages = contextService.buildPrompt(userId, text);

            // 7. ASK OPENAI
            let aiReply = await openaiService.ask(promptMessages);

            if (!aiReply) aiReply = "Sorry boss 😅, I got stuck for a moment. Try again.";

            // 8. SEND AI REPLY + SAVE TO CONTEXT
            await client.sendMessage(userId, aiReply);
            contextService.addMessage(userId, "assistant", aiReply);

        } catch (err) {
            console.error("Controller error:", err);

            try {
                await message.reply("😅 Something went wrong on my end. Try again.");
            } catch (e) {}
        }
    }
};
