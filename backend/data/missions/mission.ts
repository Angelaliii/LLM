/**
 * 任務資料 - E2: 日本統治下的權利與土地：歷史修復任務
 * 臨時兼容文件
 */

export const e2Npcs = [
  {
    id: "police_officer",
    name: "警察 佐藤敬一",
    role: "日本基層警察",
    persona: "直接、具有權威感，堅信日本統治的進步性",
    knowledgeScope: ["六三法", "總督專制", "警察政治", "保甲制度"],
  },
  {
    id: "student",
    name: "學生 小清",
    role: "公學校學生",
    persona: "天真、好奇，對權威有敬畏",
    knowledgeScope: ["公學校教育", "警察干預", "陋習取締", "保甲制度"],
  },
  {
    id: "land_surveyor",
    name: "土地測量員 山本勘助",
    role: "土地測量員",
    persona: "務實、專業，專注於技術和數字",
    knowledgeScope: ["土地調查", "林野調查", "專賣制度", "田賦收入"],
  },
];

export const e2Chunks = [
  {
    id: "chunk_1",
    missionId: "E2",
    topic: "日本統治下的權利與土地：歷史修復任務",
    period: "日治初期 (1905年)",
    text: "1905年的臺南，日本殖民統治已經進入第十年。作為總督府的基層文官，你親眼目睹了殖民體制如何透過法律、警察和土地制度，牢牢掌控這片土地。",
    keywords: ["六三法", "警察政治", "土地調查", "專賣制度"],
    relatedKnowledgeIds: ["JP002", "JP004", "JP008", "JP009"],
  },
];

export const e2Quizzes = [
  {
    id: "q1",
    question: "《法律第六十三號》（六三法）賦予了臺灣總督什麼權力？",
    options: [
      "頒布具有法律效力的命令",
      "任命地方官員",
      "徵收田賦",
      "建設鐵路",
    ],
    correctAnswer: 0,
    explanation:
      "《法律第六十三號》授權臺灣總督可以頒布具有法律效力的命令，使總督集行政、立法、司法及軍事大權於一身。",
    relatedKnowledgeId: "JP002",
  },
  {
    id: "q2",
    question: "日治初期，總督府如何控制臺灣基層社會？",
    options: [
      "透過警察政治和保甲制度",
      "設立地方議會",
      "推動民主選舉",
      "成立自治組織",
    ],
    correctAnswer: 0,
    explanation:
      "總督府建立嚴密的警察制度，並利用保甲制度（十戶一甲、十甲一保）來輔佐警察執行公共事務，形成「警察政治」。",
    relatedKnowledgeId: "JP004",
  },
  {
    id: "q3",
    question: "總督府進行土地調查的主要目的是什麼？",
    options: [
      "增加田賦稅收，穩定財政",
      "保護原住民土地權益",
      "推動土地平均分配",
      "發展觀光產業",
    ],
    correctAnswer: 0,
    explanation:
      "總督府透過土地調查確定土地所有權，使得田賦稅收大幅增加，這是建立殖民地財政基礎的重要環節。",
    relatedKnowledgeId: "JP008",
  },
];

export interface MissionNPC {
  id: string;
  name: string;
  role: string;
  persona: string;
  knowledgeScope: string[];
}

export interface MissionChunk {
  id: string;
  missionId: string;
  topic: string;
  period: string;
  text: string;
  keywords: string[];
  relatedKnowledgeIds: string[];
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  relatedKnowledgeId: string;
}
