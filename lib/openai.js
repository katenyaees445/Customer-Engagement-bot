const fetch = require("node-fetch");

async function askOpenAI(messages, apiKey) {
  if (!apiKey) throw new Error("OPENAI_API_KEY missing in .env");

  const payload = {
    model: "gpt-3.5-turbo",
    messages,
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
  } catch (e) {
    console.error("OpenAI error:", e);
    return null;
  }
}

module.exports = { askOpenAI };
