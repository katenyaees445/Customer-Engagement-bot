// index.js — Smart Lounge Bot (Structured & Open-Source)
// Requires: npm install whatsapp-web.js qrcode-terminal express dotenv node-fetch

require('dotenv').config();
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const messageController = require('./controllers/messageController');

// -------------------------
// CONFIG
// -------------------------
const PORT = process.env.PORT || 3000;

// -------------------------
// EXPRESS SERVER (status endpoint)
// -------------------------
const app = express();

app.get('/', (req, res) => res.send('🎵 Lounge Smart Bot running!'));
app.get('/health', (req, res) => res.json({ ok: true, timestamp: Date.now() }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// -------------------------
// WHATSAPP CLIENT
// -------------------------
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false, // show QR for first login
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Display QR code for authentication
client.on('qr', (qr) => {
    console.log('Scan this QR with WhatsApp to link the bot:');
    qrcode.generate(qr, { small: true });
});

// Ready event
client.on('ready', () => console.log('✅ Lounge Smart Bot ready!'));

// Handle client disconnect
client.on('disconnected', (reason) => console.log('Client disconnected:', reason));

// -------------------------
// MESSAGE HANDLER
// -------------------------
client.on('message', async (msg) => {
    try {
        // Delegate message handling to the controller
        await messageController.handleIncoming(client, msg);
    } catch (err) {
        console.error('Error in message handler:', err);
        try {
            await client.sendMessage(msg.from, 'Sorry 😅, something went wrong. Try again.');
        } catch (e) { /* ignore errors */ }
    }
});

// -------------------------
// INITIALIZE BOT
// -------------------------
client.initialize();
