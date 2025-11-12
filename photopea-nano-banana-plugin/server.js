import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5500;

app.use(express.static(__dirname));
app.use(express.json({ limit: "50mb" }));

// handle ArrayBuffer from Photopea
app.use(express.raw({ type: "application/octet-stream", limit: "50mb" }));

app.post("/api/nano", async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("Missing GOOGLE_API_KEY in .env");

    // Convert binary image to base64
    const base64Image = req.body.toString("base64");

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/nano-banana:generateImage?key=${apiKey}`;

    const body = {
      prompt: {
        text: "Enhance this image with better lighting and clarity",
      },
      image: {
        mimeType: "image/png",
        data: base64Image,
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (result?.candidates?.[0]?.image?.data) {
      const imageBase64 = result.candidates[0].image.data;
      const imageBuffer = Buffer.from(imageBase64, "base64");
      res.setHeader("Content-Type", "image/png");
      res.send(imageBuffer);
    } else {
      console.error("Nano Banana response:", result);
      res.status(500).send("API error: No image returned");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error calling Nano Banana API: " + err.message);
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Nano Banana Plugin Server running on port ${PORT}`)
);
