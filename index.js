const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

const generateMeta = async (req, res) => {
  try {
    const { title } = req.body;

    const description = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: `jawab dengan singkat dan jelas ${title}` },
      ],
    });

    res.status(200).json({
      description: description.choices[0].message,
    });
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generateImage = async (req, res) => {
  const image = await openai.images.generate({
    model: "dall-e-2",
    prompt: req.body.prompt,
  });

  res.status(200).json({
    image: image.data,
  });
};

app.post("/openai/meta", generateMeta);
app.post("/openai/image", generateImage);

const getDynamicURL = (req) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers.host;
  const path = req.originalUrl;
  return `${protocol}://${host}${path}`;
};

app.get("/getDynamicURL", (req, res) => {
  const dynamicURL = getDynamicURL(req);
  res.status(200).json({ dynamicURL });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
