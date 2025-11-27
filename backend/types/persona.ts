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

// NPC 遊戲角色專用配置 (劇本殺模式)
export interface NPCGameConfig {
  id: string;
  name: string;
  role: string; // 學生、警察、測量員
  period: string; // 1905年
  description: string;
  
  // 語言特徵
  language: {
    tone: "naive" | "authoritative" | "professional" | "casual"; // 天真、威嚴、專業、隨性
    maxResponseLength: number; // 2-3句 (100-200字)
    forbiddenPhrases: string[]; // 禁止的教學口吻
  };

  // 知識範圍 (白名單/黑名單)
  knowledge: {
    canAnswer: string[]; // 能回答的主題
    cannotAnswer: string[]; // 絕對不能答的主題
    knowledgeSource: "daily_life" | "work_observation" | "official_duty"; // 知識來源
  };

  // 角色轉接規則
  redirectRules: {
    [topic: string]: {
      targetNPC: string; // 要引導去找的 NPC ID
      redirectPhrase: string; // 引導話術
    };
  };

  // 對話規則
  conversationRules: {
    noSelfIntroAfterFirst: boolean; // 第一次後不再自我介紹
    mustStayInCharacter: boolean; // 必須維持角色身份
    avoidTeachingTone: boolean; // 避免教學語氣
    responseStyle: "short" | "concise" | "detailed"; // 回答風格
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
