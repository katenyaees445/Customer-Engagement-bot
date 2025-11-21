# 🎵 Smart Lounge Bot (Open-Source)

A WhatsApp bot designed for lounges in Nairobi to provide intelligent, human-like responses to customers. It can answer queries about music, menu, reservations, events, promos, and more. The bot uses **OpenAI GPT** for conversational intelligence and supports casual Kenyan English and Sheng.

---

## Features

- **Keyword-based quick replies** for common lounge questions.
- **AI-powered conversations** for natural, human-like interaction.
- **Reservation capture** (number of people & time) stored locally in JSON.
- **Rate limiting** to avoid spam.
- **Open-source & free** (zero-cost storage locally).
- **Emoji and casual tone** to match a friendly lounge vibe.
- **Express server** to confirm bot is running.

---

## Requirements

- Node.js v18+  
- npm  

### Packages

```bash
npm install whatsapp-web.js qrcode-terminal express node-fetch dotenv
Setup

Clone the repo:

git clone https://github.com/YOUR_USERNAME/whatsapp-lounge-bot.git
cd whatsapp-lounge-bot


Install dependencies:

npm install


Create a .env file in the project root:

OPENAI_API_KEY=your_openai_api_key_here


Run the bot:

node index.js


Scan the QR code using WhatsApp to link the bot.

Usage

Music / DJ / Playlist → Bot replies with tonight’s music and table reservation option.

Promo / Offer / Discount → Bot shows active promotions.

Menu / Drinks → Bot provides menu link and recommendations.

Reserve / Booking / Table → Bot captures reservation details and stores them locally.

Other messages with keywords → Bot uses AI to respond intelligently.

Messages that do not match any keywords are ignored to reduce spam and unnecessary responses.

File Structure
├─ index.js            # Main bot code
├─ package.json        # Node.js project config
├─ package-lock.json
├─ db.json             # Local storage for conversations & reservations
├─ .env                # API keys (not committed)

Contributing

Open-source and free! Feel free to fork, suggest improvements, or add new features like:

Custom greetings

More intelligent conversation flows

Integration with other social platforms
