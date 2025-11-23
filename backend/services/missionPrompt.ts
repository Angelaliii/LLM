import { e2Chunks, e2Npcs } from "../data/missions/e2-industrial-agri";

export function buildSystemPrompt(params: { missionId?: string; npcId?: string }) {
  const { missionId = "E2", npcId } = params;

  const chunks = e2Chunks.filter((c) => c.missionId === missionId && c.type === "core_fact");
  const coreText = chunks.map((c) => c.text).join("\n\n");

  const npc = npcId ? e2Npcs.find((n) => n.id === npcId) : undefined;

  const roleText = npc
    ? `你現在扮演：${npc.name}（${npc.role}）。\n${npc.persona}\n\n`
    : "";

  return `你是一個歷史教育助教，要用國中生能理解的程度回答，語氣可以有角色特色但內容要以史實為基礎。\n\n${roleText}以下是本任務相關的背景資料（請當作參考材料，用自己的話統整回答，不要直接逐字貼上）：\n\n${coreText}\n\n回答時：\n1. 優先用繁體中文。\n2. 先直接回答學生的問題，再補充必要背景。\n3. 若學生問到超出你時代或專業的內容，要坦承不知道或提醒這超出你的時代。`;
}