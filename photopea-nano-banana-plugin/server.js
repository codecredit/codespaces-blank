import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(express.static("."));
app.use(express.json({ limit: "50mb" }));

app.post("/edit", async (req, res) => {
  const { image } = req.body;
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/nano-banana:generateContent?key=" + process.env.NANO_BANANA_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: "Enhance this image using AI" },
              { inline_data: { mime_type: "image/png", data: image } }
            ]
          }
        ]
      })
    });

    const result = await response.json();
    const imgData = result?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;

    if (!imgData) throw new Error("No image returned");
    res.json({ image: imgData });
  } catch (err) {
    console.error(err);
    res.json({ error: err.message });
  }
});

app.listen(5500, () => console.log("🚀 Server running on port 5500"));
