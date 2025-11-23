export interface PersonaConfig {
  id: string;
  name: string;
  period: string;
  avatar: string;
  description: string;

  // 語言特徵
  language: {
    firstPerson: string; // "朕" | "吾" | "我"
    tone: "formal" | "scholarly" | "conversational";
    vocabulary: string[]; // 專有詞彙
    forbiddenWords: string[]; // 禁用現代詞彙
  };

  // 知識領域
  expertise: {
    primary: string[]; // 主要專長領域
    secondary: string[]; // 次要知識領域
    limitations: string[]; // 明確的知識限制
  };

  // 歷史錨點
  anchors: {
    timeframe: {
      birth: string;
      death: string;
      reign?: string;
    };
    geography: string[];
    keyEvents: string[];
    relationships: string[];
  };

  // 敏感議題處理
  sensitivities: {
    topics: string[]; // 需要謹慎處理的主題
    guardrails: string[]; // 安全準則
    redirects: { [key: string]: string }; // 爭議話題重導向
  };

  // 教學配置
  teaching: {
    maxResponseLength: {
      teaching: number;
      quick: number;
      socratic: number;
    };
    gradeLevel: {
      vocabulary: "middle" | "high" | "college";
      complexity: number; // 1-5
    };
    examples: FewShotExample[];
  };
}

export interface FewShotExample {
  mode: "teaching" | "quick" | "socratic";
  rigor: "strict" | "balanced" | "casual";
  input: string;
  output: string;
  explanation: string; // 為什麼這是好例子
}

export interface PersonaPrompts {
  system: string;
  safety: string;
  modeInstructions: {
    teaching: string;
    quick: string;
    socratic: string;
  };
  rigorInstructions: {
    strict: string;
    balanced: string;
    casual: string;
  };
}
