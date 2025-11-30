export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    readabilityScore?: number;
    factChecks?: FactCheck[];
    sources?: string[];
    mode?: ChatMode;
  };
}

// 對話摘要結構
export interface ConversationSummary {
  id: string;
  startMessageId: string;
  endMessageId: string;
  timestamp: Date;
  playerIntent: string;          // 玩家想了解什麼
  npcResponse: string;            // NPC 提供了什麼信息
  discoveredKeywords: string[];   // 這段對話發現的關鍵字
  emotionalTone: string;          // 對話氣氛
  relationshipChange?: string;    // 關係變化
}

// 關鍵線索結構
export interface KeyPoint {
  id: string;
  title: string;
  description: string;
  category: string;               // 如：法律、財政、社會控制
  discoveredAt: Date;
  sourceNpcId: string;            // 從哪個NPC那裡得知
}

// 完整的對話記憶結構
export interface ConversationMemory {
  messages: Message[];            // 最近 3 條完整對話
  summaries: ConversationSummary[]; // 歷史摘要
  keyPoints: KeyPoint[];          // 已發現的關鍵線索
  relationshipMemo: string;       // 與該 NPC 的關係狀態
  totalMessageCount: number;      // 總對話輪數
}

export interface FactCheck {
  claim: string;
  confidence: number;
  sources: string[];
  period: string;
}

export type ChatMode = "teaching" | "quick" | "socratic";
export type RigorLevel = "strict" | "balanced" | "casual";
export type Language = "zh-TW" | "zh-CN" | "en";

export interface ChatSession {
  id: string;
  personaId: string;
  messages: Message[];
  mode: ChatMode;
  rigorLevel: RigorLevel;
  language: Language;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamingResponse {
  content: string;
  isComplete: boolean;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
  };
}
