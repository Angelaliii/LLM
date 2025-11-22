import { Router } from "express";
import { chatWithOllama } from "../services/ollamaClient";
import { buildSystemPrompt } from "../services/missionPrompt";

const router = Router();

router.post("/chat", async (req, res) => {
  try {
    const { model, systemPrompt, messages, missionId, npcId } = req.body;

    const finalSystemPrompt =
      systemPrompt ?? buildSystemPrompt({ missionId, npcId });

    const data = await chatWithOllama({
      model,
      systemPrompt: finalSystemPrompt,
      messages,
    });

    const reply =
      data?.message?.content || data?.choices?.[0]?.message?.content || data;

    res.json({ message: { role: "assistant", content: reply }, raw: data });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e?.message || "Ollama backend error" });
  }
});

export default router;
