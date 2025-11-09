// 文本處理工具
export function segmentText(text: string): string[] {
  // 按句號、問號、驚嘆號分割
  return text
    .split(/[。！？；]/)
    .filter((segment) => segment.trim().length > 0);
}

// Token 估算（簡化版）
export function estimateTokens(text: string): number {
  // 中文字符大約 1.5 tokens，英文單詞大約 1 token
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  return Math.ceil(chineseChars * 1.5 + englishWords);
}

// 文本清理
export function cleanText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[""'']/g, '"')
    .replace(/[—–]/g, "-");
}

// 提取關鍵詞（簡化版）
export function extractKeywords(text: string): string[] {
  // 常見停用詞
  const stopWords = new Set([
    "的",
    "了",
    "是",
    "在",
    "我",
    "你",
    "他",
    "她",
    "它",
    "們",
    "這",
    "那",
    "和",
    "與",
    "或",
    "但",
    "而",
    "因為",
    "所以",
    "如果",
    "雖然",
    "但是",
    "什麼",
    "怎麼",
    "為什麼",
    "哪裡",
    "誰",
    "何時",
  ]);

  // 提取中文詞語（2-4字）
  const words = text.match(/[\u4e00-\u9fa5]{2,4}/g) || [];

  // 過濾停用詞並統計頻率
  const wordCount = new Map<string, number>();

  words.forEach((word) => {
    if (!stopWords.has(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  });

  // 按頻率排序，返回前10個
  return Array.from(wordCount.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

// 檢查文本複雜度
export function assessComplexity(text: string): {
  level: "simple" | "moderate" | "complex";
  factors: string[];
} {
  const factors: string[] = [];
  let complexityScore = 0;

  // 句子長度
  const sentences = segmentText(text);
  const avgSentenceLength = text.length / sentences.length;

  if (avgSentenceLength > 50) {
    complexityScore += 2;
    factors.push("句子過長");
  } else if (avgSentenceLength > 30) {
    complexityScore += 1;
    factors.push("句子較長");
  }

  // 複雜詞彙
  const complexWords = text.match(/[\u4e00-\u9fa5]{5,}/g) || [];
  const complexWordRatio =
    complexWords.length / (text.match(/[\u4e00-\u9fa5]+/g) || []).length;

  if (complexWordRatio > 0.2) {
    complexityScore += 2;
    factors.push("複雜詞彙過多");
  } else if (complexWordRatio > 0.1) {
    complexityScore += 1;
    factors.push("包含複雜詞彙");
  }

  // 標點複雜度
  const complexPunctuation = (text.match(/[；：「」『』（）]/g) || []).length;
  if (complexPunctuation > text.length * 0.05) {
    complexityScore += 1;
    factors.push("標點符號複雜");
  }

  // 確定等級
  let level: "simple" | "moderate" | "complex";
  if (complexityScore >= 4) {
    level = "complex";
  } else if (complexityScore >= 2) {
    level = "moderate";
  } else {
    level = "simple";
  }

  return { level, factors };
}

// 文本統計
export function getTextStats(text: string): {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
} {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  // 中文詞語統計
  const chineseWords = text.match(/[\u4e00-\u9fa5]+/g) || [];
  const englishWords = text.match(/[a-zA-Z]+/g) || [];
  const words = chineseWords.length + englishWords.length;

  const sentences = segmentText(text).length;
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
  };
}
