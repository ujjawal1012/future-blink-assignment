import express from "express";
import Conversation from "../models/Conversation.js";

const router = express.Router();

// POST /api/ask-ai — Streaming response from OpenRouter
router.post("/ask-ai", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Content-Type-Options", "nosniff"); // Prevent buffering

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-super-120b-a12b:free",
          messages: [{ role: "user", content: prompt }],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).write(`data: ${JSON.stringify({ error: "AI service error", details: errorData })}\n\n`);
    }

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value); // Write the Uint8Array chunk directly for speed
    }

    res.end();
  } catch (error) {
    console.error("Error in /ask-ai streaming:", error.message);
    res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
    res.end();
  }
});

// POST /api/save — Save prompt + response to MongoDB
router.post("/save", async (req, res) => {
  try {
    const { prompt, response } = req.body;

    if (!prompt || !response) {
      return res
        .status(400)
        .json({ error: "Both prompt and response are required" });
    }

    const conversation = await Conversation.create({ prompt, response });

    res.status(201).json({
      message: "Saved successfully",
      data: conversation,
    });
  } catch (error) {
    console.error("Error in /save:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
