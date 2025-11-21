// services/aiService.js
const fetch = require('node-fetch');

exports.getAIResponse = async (messages) => {
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, temperature: 0.8, max_tokens: 400 })
    });
    const data = await resp.json();
    return data.choices?.[0]?.message?.content?.trim() || 'Sorry 😅 I got stuck.';
  } catch (err) {
    console.error('AI Service error:', err);
    return 'Sorry 😅 I got stuck.';
  }
};
