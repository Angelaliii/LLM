export type Role = 'system' | 'user' | 'assistant';

export interface Chunk {
  id: string;            // e2-001
  missionId: string;     // E2
  topic: string;         // 工業日本農業臺灣政策
  type: 'core_fact' | 'context' | 'exam_source';
  text: string;          // 150–200 字內容
}

export interface Npc {
  id: string;            // npc-yamada
  name: string;          // 山田清一
  role: string;          // 日本技師
  missionId: string;     // E2
  persona: string;       // 角色卡描述
  canTalkAbout: string[]; // tags
  avoid: string[];         // 不談什麼
}

export interface QuizOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuizQuestion {
  id: string;
  missionId: string;   // E2
  stem: string;        // 題幹
  options: QuizOption[];
  answer: QuizOption['key'];
  explanation: string; // 給老師 / 分析用
}
