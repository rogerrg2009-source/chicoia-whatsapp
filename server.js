const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "chicoia_bar";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Teste do servidor
app.get("/", (req, res) => {
  res.send("ChicoIA WhatsApp está funcionando!");
});

// Verificação do webhook da Meta
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado!");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receber mensagens do WhatsApp
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    console.log("WEBHOOK RECEBIDO:");
    console.log(JSON.stringify(body, null, 2));

    if (body.object === "whatsapp_business_account") {
      const message =
        body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (message) {
        console.log("Mensagem recebida:", message);

        const numeroCliente = message.from;

        await axios.post(
          `https://graph.facebook.com/v26.0/${PHONE_NUMBER_ID}/messages`,
          {
            messaging_product: "whatsapp",
            to: numeroCliente,
            type: "text",
            text: {
              body: "Olá! 👋 Eu sou o ChicoIA, assistente virtual do Bar do Seu Chico. Como posso ajudar?"
            }
          },
          {
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              "Content-Type": "application/json"
            }
          }
        );

        console.log("Resposta enviada para:", numeroCliente);
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.error(
      "ERRO WHATSAPP:",
      JSON.stringify(error.response?.data || error.message, null, 2)
    );

    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`ChicoIA rodando na porta ${PORT}`);
});
