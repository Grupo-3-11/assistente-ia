import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rota que o front vai chamar
app.post("/api/chat", async (req, res) => {
  const { message, model } = req.body;

  let url;
  let bodyData;

  try {
    if (model === "openai") {
      url = "https://api.openai.com/v1/chat/completions";
      bodyData = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      };
    } else {
      const geminiModel = model === "gemini-flash" ? "gemini-1.5-flash" : "gemini-pro";
      url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      bodyData = {
        contents: [{ parts: [{ text: message }] }],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(model === "openai" && {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        }),
      },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao chamar a API" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});
