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
