// src/services/ollama.ts
import type { Role } from '../types/history';

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface ChatRequest {
  model?: string;        // 預設 LLama 3.2 8B
  systemPrompt?: string; // 任務或角色說明
  messages: ChatMessage[];
}

export async function callOllamaChat(req: ChatRequest) {
  const body = {
    model: req.model ?? 'llama3.2:3b',
    messages: [
      req.systemPrompt
        ? { role: 'system', content: req.systemPrompt }
        : null,
      ...req.messages,
    ].filter(Boolean),
    stream: false,
  };

  const res = await fetch('/api/ollama/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status}`);
  }

  const data = await res.json();
  // Ollama chat 回傳格式大致會有 message.content
  return data;
}
