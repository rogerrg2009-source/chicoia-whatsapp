const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "chicoia_bar";

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
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`ChicoIA rodando na porta ${PORT}`);
});
