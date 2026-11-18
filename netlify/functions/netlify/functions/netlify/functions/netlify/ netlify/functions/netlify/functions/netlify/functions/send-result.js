export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const data = await request.json();

    const token = Netlify.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Netlify.env.get("TELEGRAM_CHAT_ID");

    if (!token || !chatId) {
      throw new Error("Telegram settings are missing");
    }

    const message = [
      "🎓 Новый результат теста Apex!",
      "",
      `Имя: ${data.name || "Не указано"}`,
      `Instagram: ${data.instagram || "Не указан"}`,
      `Уровень: ${data.level || "Не определён"}`,
      `Баллы: ${data.score ?? 0} из ${data.total ?? 30}`
    ].join("\n");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    if (!telegramResponse.ok) {
      throw new Error("Telegram delivery failed");
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
};
