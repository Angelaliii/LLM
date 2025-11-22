// src/data/missions/e2-industrial-agri.ts
import type { Chunk, Npc, QuizQuestion } from "../../types/history";

export const e2Chunks: Chunk[] = [
  {
    id: "e2-001",
    missionId: "E2",
    topic: "工業日本農業臺灣政策",
    type: "core_fact",
    text: "日治初期，日本總督府推動「工業日本、農業臺灣」殖民經濟政策……(150–200字)",
  },
  {
    id: "e2-002",
    missionId: "E2",
    topic: "蓬萊米改良與推廣",
    type: "core_fact",
    text: "蓬萊米由磯永吉等人改良，適合臺灣氣候……",
  },
  // ...其餘 chunk
];

export const e2Npcs: Npc[] = [
  {
    id: "npc-yamada",
    missionId: "E2",
    name: "山田清一",
    role: "日本技師",
    persona: "你是日治時期派駐嘉南平原的日本農業技師……(角色卡全文)",
    canTalkAbout: ["蓬萊米", "新式耕作", "水利工程"],
    avoid: ["批判日本政府", "談政治壓迫"],
  },
  {
    id: "npc-afu",
    missionId: "E2",
    name: "阿福",
    role: "臺灣佃農",
    persona: "你是嘉南平原的小農，常抱怨肥料貴、會社磅重不公……",
    canTalkAbout: ["農民生活", "契作制度", "第一惡種甘蔗予會社磅"],
    avoid: ["精確技術數據", "殖民政策大局"],
  },
  // npc-sato 會社幹部...
];

export const e2Quizzes: QuizQuestion[] = [
  {
    id: "e2-q1",
    missionId: "E2",
    stem: "日治時期推行「工業日本、農業臺灣」的主要目的為何？",
    options: [
      { key: "A", text: "讓臺灣成為工業中心" },
      { key: "B", text: "提高臺灣農民所得" },
      { key: "C", text: "滿足日本對糧食與原料需求" },
      { key: "D", text: "促進臺灣與歐美貿易" },
    ],
    answer: "C",
    explanation: "政策重點是臺灣供應農產與原料，日本本土發展工業。",
  },
  // ...其他題目
];
