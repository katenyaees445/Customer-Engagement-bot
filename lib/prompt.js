// /lib/prompt.js

const { getConversationContext } = require("./conversation");

function buildPrompt(db, userId, latestMessage) {
  const system = `
You are a friendly lounge assistant in Nairobi.
Use casual Kenyan English/Sheng.
Respond politely, use emojis.
If they ask for booking, ask for number of people and time.
Do not request sensitive info.
Keep answers short and helpful.
`;

  const context = getConversationContext(db, userId);

  const messages = [
    { role: "system", content: system },
    ...context.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text
    })),
    { role: "user", content: latestMessage }
  ];

  return messages;
}

module.exports = { buildPrompt };
