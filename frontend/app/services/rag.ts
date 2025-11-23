// 簡易 RAG（前端版，之後可搬到後端）
import type { Chunk } from "../types/history";

// 極簡版：只用關鍵字與 topic 過濾
export function retrieveChunks(
  allChunks: Chunk[],
  missionId: string,
  query: string,
  limit = 4
): Chunk[] {
  const inMission = allChunks.filter((c) => c.missionId === missionId);

  const scored = inMission.map((c) => {
    const hits =
      c.text.includes(query) || c.topic.includes(query) ? 1 : 0;
    return { c, score: hits }; // 之後可換成向量相似度
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.c);
}