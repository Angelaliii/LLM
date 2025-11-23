// 可讀性和內容品質評估工具
export interface ReadabilityMetrics {
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  readabilityScore: number;
  grade: string;
}

export class ReadabilityAnalyzer {
  // 計算字數（中文以字為單位，英文以詞為單位）
  static countWords(text: string): number {
    // 移除多餘空白
    const cleanText = text.trim().replace(/\s+/g, " ");

    // 分離中文字符和英文詞彙
    const chineseChars = cleanText.match(/[\u4e00-\u9fa5]/g) || [];
    const englishWords = cleanText.match(/[a-zA-Z]+/g) || [];

    return chineseChars.length + englishWords.length;
  }

  // 計算句子數
  static countSentences(text: string): number {
    // 中文句號、問號、驚嘆號；英文句號、問號、驚嘆號
    const sentences = text
      .split(/[。！？.!?]+/)
      .filter((s) => s.trim().length > 0);
    return sentences.length;
  }

  // 計算平均句長
  static calculateAverageWordsPerSentence(text: string): number {
    const wordCount = this.countWords(text);
    const sentenceCount = this.countSentences(text);

    return sentenceCount > 0
      ? Math.round((wordCount / sentenceCount) * 10) / 10
      : 0;
  }

  // 計算可讀性分數（適用於中文內容）
  static calculateReadabilityScore(text: string): number {
    const avgWordsPerSentence = this.calculateAverageWordsPerSentence(text);

    // 簡化的中文可讀性評估
    // 基於句長和詞彙難度的評估
    let score = 100;

    // 句長懲罰：句子越長，可讀性越低
    if (avgWordsPerSentence > 20) {
      score -= (avgWordsPerSentence - 20) * 2;
    } else if (avgWordsPerSentence > 15) {
      score -= (avgWordsPerSentence - 15) * 1;
    }

    // 複雜詞彙懲罰
    const complexWords = text.match(/[\u4e00-\u9fa5]{4,}/g) || [];
    const complexWordRatio = complexWords.length / this.countWords(text);
    score -= complexWordRatio * 30;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // 獲取可讀性等級
  static getReadabilityGrade(score: number): string {
    if (score >= 90) return "非常容易";
    if (score >= 80) return "容易";
    if (score >= 70) return "適中";
    if (score >= 60) return "稍難";
    if (score >= 50) return "困難";
    return "非常困難";
  }

  // 完整可讀性分析
  static analyze(text: string): ReadabilityMetrics {
    const wordCount = this.countWords(text);
    const sentenceCount = this.countSentences(text);
    const averageWordsPerSentence = this.calculateAverageWordsPerSentence(text);
    const readabilityScore = this.calculateReadabilityScore(text);
    const grade = this.getReadabilityGrade(readabilityScore);

    return {
      wordCount,
      sentenceCount,
      averageWordsPerSentence,
      readabilityScore,
      grade,
    };
  }

  // 內容品質建議
  static getContentSuggestions(metrics: ReadabilityMetrics): string[] {
    const suggestions: string[] = [];

    if (metrics.averageWordsPerSentence > 20) {
      suggestions.push("建議將長句分解為較短的句子，提高可讀性");
    }

    if (metrics.readabilityScore < 60) {
      suggestions.push("內容過於複雜，建議使用更簡單的詞彙和句式");
    }

    if (metrics.wordCount < 50) {
      suggestions.push("內容過短，建議增加更多詳細說明");
    }

    if (metrics.wordCount > 500) {
      suggestions.push("內容過長，建議精簡或分段呈現");
    }

    if (suggestions.length === 0) {
      suggestions.push("內容品質良好，符合可讀性標準");
    }

    return suggestions;
  }
}

// React Hook for readability analysis
export const useReadability = () => {
  return {
    countWords: ReadabilityAnalyzer.countWords,
    countSentences: ReadabilityAnalyzer.countSentences,
    analyze: ReadabilityAnalyzer.analyze,
    getSuggestions: ReadabilityAnalyzer.getContentSuggestions,
  };
};
