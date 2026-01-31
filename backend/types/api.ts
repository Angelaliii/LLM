export interface APIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

export interface StreamChunk {
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface SafetyCheckResult {
  isSafe: boolean;
  issues: Array<{
    type:
      | "inappropriate"
      | "anachronistic"
      | "historical_inaccuracy"
      | "educational_concern";
    severity: "low" | "medium" | "high";
    message: string;
    suggestion?: string;
  }>;
  alternativePrompt?: string;
}

export interface ReadabilityMetrics {
  score: number; // 0-100, higher is easier
  gradeLevel: number;
  averageSentenceLength: number;
  averageWordsPerSentence: number;
  passiveVoicePercentage: number;
  recommendations: string[];
}