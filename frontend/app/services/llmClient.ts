// Frontend wrapper: forward chat requests to backend API
type StreamHandlers = {
  onChunk?: (chunk: string) => void;
  onComplete?: (response: string) => void;
  onError?: (error: Error) => void;
};

export async function streamChatViaBackend(
  userInput: string,
  opts: {
    missionId?: string;
    npcId?: string;
    handlers?: StreamHandlers;
  } = {}
): Promise<void> {
  try {
    const res = await fetch("/api/ollama/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: userInput }],
        missionId: opts.missionId,
        npcId: opts.npcId,
      }),
    });

    if (!res.ok) throw new Error(`backend error: ${res.status}`);

    const data = await res.json();
    const assistant = data?.message?.content ?? data?.content ?? "";
    if (opts.handlers?.onChunk) {
      // deliver as a single chunk for now
      opts.handlers.onChunk(assistant);
    }
    if (opts.handlers?.onComplete) opts.handlers.onComplete(assistant);
  } catch (err) {
    if (opts.handlers?.onError) opts.handlers.onError(err as Error);
  }
}
