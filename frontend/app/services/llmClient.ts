// Frontend wrapper: forward chat requests to backend API
type StreamHandlers = {
  onChunk?: (chunk: string) => void;
  onComplete?: (response: string) => void;
  onError?: (error: Error) => void;
};

export async function streamChatViaBackend(
  userInputOrOpts:
    | string
    | ({
        message?: string;
        missionId?: string;
        personaId?: string;
        mode?: string;
        rigorLevel?: string;
        language?: string;
        conversationHistory?: { role: string; content: string }[];
        onStart?: () => void;
        onContent?: (chunk: string) => void;
        onComplete?: (response: string) => void;
        onError?: (err: string) => void;
      }) = "",
  opts: {
    missionId?: string;
    npcId?: string;
    handlers?: StreamHandlers;
  } = {}
): Promise<void> {
  // normalize args: support (string, opts) or (optsObject)
  let message: string = "";
  let missionId: string | undefined = opts.missionId;
  let npcId: string | undefined = opts.npcId;
  let handlers: StreamHandlers | undefined = opts.handlers;
  let conversationHistory: { role: string; content: string }[] | undefined = undefined;

  if (typeof userInputOrOpts === "string") {
    message = userInputOrOpts;
  } else if (typeof userInputOrOpts === "object") {
    message = (userInputOrOpts.message as string) || "";
    missionId = userInputOrOpts.missionId ?? missionId;
    npcId = userInputOrOpts.personaId ?? npcId;
    conversationHistory = userInputOrOpts.conversationHistory;
    handlers = handlers || {
      onChunk: userInputOrOpts.onContent,
      onComplete: userInputOrOpts.onComplete,
      onError: (e) => userInputOrOpts.onError && userInputOrOpts.onError(String(e)),
    };
  }

  try {
    const body: any = {
      model: "llama3.2:3b",
      messages: [],
      stream: false,
    };

    // include conversation history if provided
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      body.messages = conversationHistory.map((m) => ({ role: m.role, content: m.content }));
    }

    // always append current user message
    if (message) {
      body.messages.push({ role: "user", content: message });
    }

    // include meta for backend if present
    if (missionId) body.missionId = missionId;
    if (npcId) body.npcId = npcId;

    const res = await fetch("/api/ollama/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const errMsg = `backend error: ${res.status} ${text}`;
      const err = new Error(errMsg);
      if (handlers?.onError) handlers.onError(err as unknown as Error);
      throw err;
    }

    const data = await res.json();
    const assistant = data?.message?.content ?? data?.content ?? "";

    if (handlers?.onChunk) {
      handlers.onChunk(assistant);
    }
    if (handlers?.onComplete) handlers.onComplete(assistant);
  } catch (err) {
    if (handlers?.onError) handlers.onError(err as Error);
  }
}
