import fetch from "node-fetch";

interface OllamaChatRequest {
  model?: string;
  systemPrompt?: string;
  messages: { role: string; content: string }[];
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

export async function chatWithOllama(req: OllamaChatRequest) {
  const body = {
    model: req.model || DEFAULT_MODEL,
    messages: [
      req.systemPrompt ? { role: "system", content: req.systemPrompt } : null,
      ...req.messages,
    ].filter(Boolean),
    stream: false,
  };

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Ollama error: ${res.status} ${txt}`);
  }

  return await res.json();
}