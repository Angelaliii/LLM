// Frontend wrapper: forward chat requests to backend game API
type StreamHandlers = {
  onChunk?: (chunk: string) => void;
  onComplete?: (response: string) => void;
  onError?: (error: Error) => void;
};

// 儲存每個角色的 sessionId
const sessionCache: Record<string, string> = {};

/**
 * 初始化或獲取遊戲 session
 */
async function getOrCreateGameSession(npcId: string, missionId: string = "e2-industrial-agri"): Promise<string> {
  // 如果已有該角色的 session，直接返回
  if (sessionCache[npcId]) {
    return sessionCache[npcId];
  }

  // 創建新 session
  try {
    const response = await fetch("/api/game/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionId, npcId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start game session: ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.data.sessionId) {
      sessionCache[npcId] = data.data.sessionId;
      console.log(`✅ Created game session for ${npcId}: ${data.data.sessionId}`);
      return data.data.sessionId;
    }
    throw new Error("Invalid session response");
  } catch (error) {
    console.error(`❌ Failed to create session for ${npcId}:`, error);
    throw error;
  }
}

/**
 * 清除指定角色的 session（用於重置對話）
 */
export function clearGameSession(npcId: string): void {
  delete sessionCache[npcId];
}

/**
 * 清除所有 sessions
 */
export function clearAllGameSessions(): void {
  Object.keys(sessionCache).forEach(key => delete sessionCache[key]);
}

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
  let missionId: string = "e2-industrial-agri";
  let npcId: string | undefined = opts.npcId;
  let handlers: StreamHandlers | undefined = opts.handlers;

  if (typeof userInputOrOpts === "string") {
    message = userInputOrOpts;
  } else if (typeof userInputOrOpts === "object") {
    message = (userInputOrOpts.message as string) || "";
    missionId = userInputOrOpts.missionId ?? opts.missionId ?? missionId;
    npcId = userInputOrOpts.personaId ?? npcId;
    handlers = handlers || {
      onChunk: userInputOrOpts.onContent,
      onComplete: userInputOrOpts.onComplete,
      onError: (e) => userInputOrOpts.onError && userInputOrOpts.onError(String(e)),
    };
  }

  if (!npcId) {
    const error = new Error("NPC ID is required");
    if (handlers?.onError) handlers.onError(error);
    throw error;
  }

  try {
    // 獲取或創建 game session
    const sessionId = await getOrCreateGameSession(npcId, missionId);

    if (handlers?.onChunk) {
      handlers.onChunk("");
    }

    // 調用遊戲 API (使用完整的 RAG + NPC persona 邏輯)
    const response = await fetch("/api/game/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        message,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      const errMsg = `遊戲 API 錯誤: ${response.status} ${text}`;
      const err = new Error(errMsg);
      if (handlers?.onError) handlers.onError(err);
      throw err;
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Unknown error");
    }

    // 使用第一個回答 (temperature 0.7 的版本)
    const assistantContent = data.data?.responses?.[0]?.content || "無法獲取回答";

    // 模擬串流效果（逐字顯示）
    const words = assistantContent.split("");
    let accumulated = "";
    
    for (let i = 0; i < words.length; i++) {
      accumulated += words[i];
      if (handlers?.onChunk) {
        handlers.onChunk(accumulated);
      }
      // 小延遲以產生打字效果
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    if (handlers?.onComplete) {
      handlers.onComplete(assistantContent);
    }
  } catch (err) {
    console.error("❌ streamChatViaBackend error:", err);
    if (handlers?.onError) {
      handlers.onError(err as Error);
    }
  }
}
