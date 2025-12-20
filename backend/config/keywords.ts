// Backend keyword config — keep in sync with frontend config
export const KEYWORDS = {
  law: ['六三法', '法律第六十三號'],
  government: [ '警察制度'],
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
