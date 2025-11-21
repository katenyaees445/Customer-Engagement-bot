// controllers/reservationController.js

const db = require("../database/db");

module.exports = {
  handleStep: async (client, userId, message) => {
    db.load();

    // If user just said "reserve", bot asks how many people
    if (message.toLowerCase().includes("reserve")) {
      db.data.pending[userId] = { step: 1 };
      db.save();

      await client.sendMessage(
        userId,
        "Great! 😊 How many people are coming?"
      );
      return true;
    }

    // If user is in the middle of reservation
    if (db.data.pending[userId]) {
      const step = db.data.pending[userId].step;

      // Step 1: Number of people
      if (step === 1) {
        db.data.pending[userId].people = message;
        db.data.pending[userId].step = 2;
        db.save();

        await client.sendMessage(userId, "Nice! 🕒 What time?");
        return true;
      }

      // Step 2: Time
      if (step === 2) {
        db.data.pending[userId].time = message;

        // Save reservation
        const details = db.data.pending[userId];
        delete db.data.pending[userId];
        db.data.reservations.push({
          userId,
          ...details,
          created: Date.now()
        });

        db.save();

        await client.sendMessage(
          userId,
          `🎉 Booking saved!\n\nPeople: ${details.people}\nTime: ${details.time}\nWe'll confirm shortly!`
        );

        return true;
      }
    }

    return false; // not a reservation message
  }
};
