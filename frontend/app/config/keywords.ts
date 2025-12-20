// 集中管理關鍵字分類與簡單匹配工具
export const KEYWORDS: Record<string, string[]> = {
  law: ['六三法', '法律第六十三號'],
  government: ['警察']
};

// 簡單匹配：回傳匹配到的類別與對應關鍵字
export function matchKeywords(text: string): { categories: string[]; matches: string[] } {
  if (!text) return { categories: [], matches: [] };
  const lowered = text; // 中文不需要 toLowerCase，但留作擴充
  const categories: Set<string> = new Set();
  const matches: Set<string> = new Set();

  for (const [cat, words] of Object.entries(KEYWORDS)) {
    for (const w of words) {
      if (lowered.includes(w)) {
        categories.add(cat);
        matches.add(w);
      }
    }
  }

  return { categories: Array.from(categories), matches: Array.from(matches) };
}

export default KEYWORDS;
