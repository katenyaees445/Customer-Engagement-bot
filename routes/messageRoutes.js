// routes/messageRoutes.js
const messageController = require('../controllers/messageController');

module.exports = (client) => {
  client.on('message', async (message) => {
    await messageController.handleMessage(client, message);
  });
};
