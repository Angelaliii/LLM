// Frontend wrapper: forward chat requests to backend game API
type StreamHandlers = {
  onChunk?: (chunk: string) => void;
  onComplete?: (response: string) => void;
  onSuggestions?: (suggestions: Array<{ text: string; type: 'fact' | 'conflict' | 'empathy' }>) => void;
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
    console.log(`📄 Using cached session for ${npcId}: ${sessionCache[npcId]}`);
    return sessionCache[npcId];
  }

  // 創建新 session
  try {
    console.log(`🔄 Creating new game session for NPC: ${npcId}, Mission: ${missionId}`);
    const response = await fetch("/api/game/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionId, npcId }),
    });

    console.log(`📡 Session creation response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Session creation failed: ${response.status} - ${errorText}`);
      throw new Error(`Failed to start game session: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`📦 Session creation response data:`, data);
    
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
        summaries?: any[];
        keyPoints?: any[];
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
  let summaries: any[] = [];
  let keyPoints: any[] = [];

  if (typeof userInputOrOpts === "string") {
    message = userInputOrOpts;
  } else if (typeof userInputOrOpts === "object") {
    message = (userInputOrOpts.message as string) || "";
    missionId = userInputOrOpts.missionId ?? opts.missionId ?? missionId;
    npcId = userInputOrOpts.personaId ?? npcId;
    summaries = userInputOrOpts.summaries || [];
    keyPoints = userInputOrOpts.keyPoints || [];
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
    console.log(`🔄 Getting session for NPC: ${npcId}, Mission: ${missionId}`);
    const sessionId = await getOrCreateGameSession(npcId, missionId);
    console.log(`📋 Using session: ${sessionId} for message: "${message}"`);

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

    console.log(`📡 Chat API response status: ${response.status}`);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`❌ Chat API error: ${response.status} - ${text}`);
      const errMsg = `遊戲 API 錯誤: ${response.status} ${text}`;
      const err = new Error(errMsg);
      if (handlers?.onError) handlers.onError(err);
      throw err;
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Unknown error");
    }

    // 檢查是否達成關鍵點
    if (data.data?.keyPointAchieved) {
      const keyPoint = data.data.keyPointAchieved;
      console.log(`🌟 Key point achieved:`, keyPoint);
      
      // 調用 ChatWindow 的處理函數
      if (typeof (window as any).handleKeyPointAchieved === 'function') {
        (window as any).handleKeyPointAchieved(keyPoint);
      }
    }

    // 提取 suggestions (LLM 搭便車生成)
    const suggestions = data.data?.suggestions || [];
    console.log(`🎯 Received ${suggestions.length} suggestions from LLM for NPC: ${npcId}`);

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

    // 先完成回覆顯示
    if (handlers?.onComplete) {
      handlers.onComplete(assistantContent);
    }

    // 🎯 等回覆完全顯示後，再顯示追問建議
    // 添加短暫延遲，讓用戶先閱讀回覆
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (handlers?.onSuggestions) {
      handlers.onSuggestions(suggestions);
    }
  } catch (err) {
    console.error("❌ streamChatViaBackend error:", err);
    if (handlers?.onError) {
      handlers.onError(err as Error);
    }
  }
}
