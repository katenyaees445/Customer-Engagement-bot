// index.js — Smart Lounge Bot (Upgraded, Open-Source, Keyword-Only AI)
// Requires: npm install whatsapp-web.js qrcode-terminal express node-fetch dotenv

require('dotenv').config();
const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// -------------------------
// CONFIG
// -------------------------
const PORT = 3000;
const CONTEXT_SIZE = 6;
const USER_COOLDOWN_MS = 5000;
const DB_PATH = path.join(__dirname, "db.json");
const KEYWORDS = [
  "order", "menu", "food", "drink",
  "booking", "reserve", "table",
  "price", "cost", "happy hour",
  "event", "party", "location",
  "services", "open", "closing",
  "mpesa", "till", "paybill"
];

// -------------------------
// SIMPLE JSON DB
// -------------------------
function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) return { conversations: {}, reservations: {}, pendingReservation: {} };
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8") || "{}");
  } catch(e) {
    console.error("DB load error:", e);
    return { conversations: {}, reservations: {}, pendingReservation: {} };
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch(e) {
    console.error("DB save error:", e);
  }
}

const db = loadDB();

// -------------------------
// MEMORY & RATE LIMIT
// -------------------------
const lastRequestAt = new Map();

function isRateLimited(userId){
  const last = lastRequestAt.get(userId) || 0;
  if(Date.now() - last < USER_COOLDOWN_MS) return true;
  lastRequestAt.set(userId, Date.now());
  return false;
}

function addToConversation(userId, role, text){
  if(!db.conversations[userId]) db.conversations[userId] = [];
  db.conversations[userId].push({role, text, ts: Date.now()});
  if(db.conversations[userId].length > CONTEXT_SIZE) {
    db.conversations[userId] = db.conversations[userId].slice(-CONTEXT_SIZE);
  }
  saveDB(db);
}

function getConversationContext(userId){
  return db.conversations[userId] || [];
}

function saveReservation(userId, details){
  if(!db.reservations[userId]) db.reservations[userId] = [];
  db.reservations[userId].push({details, ts: Date.now()});
  saveDB(db);
}

// -------------------------
// EXPRESS SERVER
// -------------------------
const app = express();
app.get('/', (req, res) => res.send('🎵 Lounge Smart Bot running!'));
app.get('/db', (req, res) => res.json({
  ok: true,
  users: Object.keys(db.conversations).length
}));
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// -------------------------
// OPENAI HELPER
// -------------------------
async function askOpenAI(messages){
  const apiKey = process.env.OPENAI_API_KEY;
  if(!apiKey) throw new Error("OPENAI_API_KEY missing in .env");

  const payload = {
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.8,
    max_tokens: 400
  };

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch(e) {
    console.error("OpenAI error:", e);
    return null;
  }
}

// -------------------------
// QUICK REPLIES
// -------------------------
function checkQuickReply(lower){
  if(lower.includes('music') || lower.includes('dj') || lower.includes('playlist'))
    return '🎶 Tonight we have Afrobeats + local hits. Wanna reserve a table? 😎';
  if(lower.includes('promo') || lower.includes('offer') || lower.includes('discount'))
    return '🍹 Promo: Buy 1 get 1 cocktails until 11pm. Wanna reserve a spot?';
  if(lower.includes('menu') || lower.includes('drinks'))
    return '🍻 Check menu here: https://example.com/drinks.pdf — want a recommendation?';
  if(lower.includes('reserve') || lower.includes('booking') || lower.includes('table'))
    return '✅ Cool! How many people and what time?';
  return null;
}

// -------------------------
// WHATSAPP CLIENT
// -------------------------
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log("Scan QR to link the bot.");
});

client.on('ready', () => console.log('✅ Lounge Smart Bot ready!'));
client.on('disconnected', reason => console.log("Client disconnected:", reason));

// -------------------------
// BUILD PROMPT
// -------------------------
function buildPrompt(userId, latestMessage){
  const system = `
You are a friendly lounge assistant in Nairobi. Speak in casual Kenyan English/Sheng when appropriate. Use emojis.
Answer the user politely and helpfully.
Do not ask for sensitive info. If user asks for booking, ask for number of people and time.
`;
  const context = getConversationContext(userId);
  const messages = [{role: 'system', content: system}, ...context.map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text
  })), {role: 'user', content: latestMessage}];
  return messages;
}

// -------------------------
// MESSAGE HANDLER (KEYWORD-ONLY)
// -------------------------
client.on('message', async message => {
  try{
    if(message.fromMe) return;
    const userId = message.from;
    const body = (message.body || '').trim();
    if(!body) return;

    const lower = body.toLowerCase();

    // ---- KEYWORD CHECK ----
    const hasKeyword = KEYWORDS.some(k => lower.includes(k));
    if(!hasKeyword){
      console.log("Ignored (no keyword):", body);
      return; // ignore irrelevant messages
    }

    console.log(`[${new Date().toISOString()}] ${userId} -> ${body}`);

    // RATE LIMIT
    if(isRateLimited(userId)){
      console.log('Rate limited:', userId);
      return;
    }

    // SAVE USER MESSAGE
    addToConversation(userId, 'user', body);

    // QUICK REPLY
    const quick = checkQuickReply(lower);
    if(quick){
      if(lower.includes('reserve')){
        db.pendingReservation = db.pendingReservation || {};
        db.pendingReservation[userId] = true;
        saveDB(db);
      } else if(db.pendingReservation && db.pendingReservation[userId]){
        saveReservation(userId, body);
        delete db.pendingReservation[userId];
        saveDB(db);
        await client.sendMessage(userId, `✅ Got it! Reservation details: "${body}". We'll confirm shortly.`);
        addToConversation(userId, 'assistant', `Saved reservation: ${body}`);
        return;
      }

      await client.sendMessage(userId, quick);
      addToConversation(userId, 'assistant', quick);
      return;
    }

    // ---- AI RESPONSE ----
    const messagesForAI = buildPrompt(userId, body);
    let aiReply = await askOpenAI(messagesForAI);

    if(!aiReply){
      aiReply = 'Sorry 😅, I got stuck. Can you try again?';
    }

    await client.sendMessage(userId, aiReply);
    addToConversation(userId, 'assistant', aiReply);

  } catch(err){
    console.error('Message handler error:', err);
    try{
      await client.sendMessage(message.from, 'Sorry 😅 something went wrong. Try again.');
    } catch(e){}
  }
});

// -------------------------
client.initialize();
