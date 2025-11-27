/**
 * 臨時兼容文件 - 為了向後兼容舊的引用
 * 未來應該移除對此文件的引用，改用新的任務系統
 */

export const e2Npcs = [
  {
    id: "police_officer",
    name: "警察 佐藤敬一",
    role: "日本基層警察",
    avatar: "👮",
    description: "負責執行總督府命令的日本警察"
  },
  {
    id: "student",
    name: "學生 小清",
    role: "公學校學生",
    avatar: "👧",
    description: "1905年臺南市區的公學校學生"
  },
  {
    id: "land_surveyor",
    name: "土地測量員 山本勘助",
    role: "土地測量員",
    avatar: "📐",
    description: "負責土地調查的日籍技術官員"
  }
];

export const e2Chunks = [
  {
    missionId: "E2",
    topic: "臺南：六法下的權力與土地",
    period: "日治初期 (1905年)",
    text: "1905年的臺南，日本殖民統治已經進入第十年。作為總督府的基層文官，你親眼目睹了殖民體制如何透過法律、警察和土地制度，牢牢掌控這片土地...",
  }
];

export const e2Quizzes = [
  {
    id: "q1",
    question: "《法律第六十三號》（六三法）賦予了臺灣總督什麼權力？",
    options: [
      "頒布具有法律效力的命令",
      "任命地方官員",
      "徵收田賦",
      "建設鐵路"
    ],
    correctAnswer: 0,
    explanation: "《法律第六十三號》授權臺灣總督可以頒布具有法律效力的命令，使總督集行政、立法、司法及軍事大權於一身。"
  }
];
