import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

app.post("/api/nano-banana", async (req, res) => {
  try {
    const { prompt, image } = req.body;
    if (!prompt && !image) {
      return res.status(400).json({ error: "No prompt or image provided" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/nano-banana:generateContent?key=" + process.env.GOOGLE_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt || "Enhance or modify this image" },
                ...(image
                  ? [{ inline_data: { mime_type: "image/png", data: image } }]
                  : [])
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("Google Response:", data);

    const generated = data.candidates?.[0]?.content?.parts?.find(p => p.inline_data)?.inline_data?.data;
    if (!generated) {
      return res.status(500).json({ error: "No image returned" });
    }

    res.json({ image: generated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => res.send("Nano Banana AI server running 🚀"));

app.listen(5500, () => console.log("✅ Server running on port 5500"));
