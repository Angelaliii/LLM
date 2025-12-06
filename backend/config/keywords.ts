// Backend keyword config — keep in sync with frontend config
export const KEYWORDS = {
  law: ['法', '違法', '合法', '條文', '規定', '六三法', '治安警察法', '法律第六十三號'],
  petition: ['請願', '請願書', '抗議', '運動', '示威', '集會'],
  government: ['政府', '官方', '當局', '總督', '警察', '政權'],
  public: ['民眾', '百姓', '人民'],
  emotion: ['害怕', '擔心', '恐懼', '希望', '未來', '失望'],
  economy: ['土地', '田賦', '土地調查', '專賣', '稅', '財政', '鴉片', '樟腦']
};

export function matchKeywords(text: string) {
  if (!text) return { categories: [], matches: [] };
  const categories = [] as string[];
  const matches = new Set<string>();

  for (const [cat, words] of Object.entries(KEYWORDS)) {
    for (const w of words) {
      if (text.includes(w)) {
        if (!categories.includes(cat)) categories.push(cat);
        matches.add(w);
      }
    }
  }

  return { categories, matches: Array.from(matches) };
}

export default KEYWORDS;
