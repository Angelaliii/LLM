import type { ReadabilityMetrics } from "../types/api";

// 中文可讀性評估（基於句長、詞彙複雜度等指標）
export function calculateReadabilityScore(text: string): ReadabilityMetrics {
  // 基本文本分析
  const sentences = text.split(/[。！？；]/).filter((s) => s.trim().length > 0);
  const characters = text.replace(/\s/g, "").length;
  const words = text.match(/[\u4e00-\u9fa5]+/g) || [];

  // 計算基本指標
  const averageSentenceLength = characters / sentences.length;
  const averageWordsPerSentence = words.length / sentences.length;

  // 複雜詞彙檢測（超過4個字的詞語視為複雜）
  const complexWords = words.filter((word) => word.length > 4);
  const complexWordRatio = complexWords.length / words.length;

  // 被動語態檢測（簡化版）
  const passiveIndicators = ["被", "受", "遭", "讓", "使"];
  const passiveCount = passiveIndicators.reduce(
    (count, indicator) =>
      count + (text.match(new RegExp(indicator, "g")) || []).length,
    0
  );
  const passiveVoicePercentage = (passiveCount / sentences.length) * 100;

  // 計算可讀性分數（0-100，分數越高越易讀）
  let score = 100;

  // 句長懲罰
  if (averageSentenceLength > 40) score -= 20;
  else if (averageSentenceLength > 25) score -= 10;

  // 複雜詞彙懲罰
  if (complexWordRatio > 0.3) score -= 25;
  else if (complexWordRatio > 0.2) score -= 15;
  else if (complexWordRatio > 0.1) score -= 5;

  // 被動語態懲罰
  if (passiveVoicePercentage > 30) score -= 15;
  else if (passiveVoicePercentage > 20) score -= 10;

  // 確保分數在合理範圍內
  score = Math.max(0, Math.min(100, score));

  // 估算年級水平
  const gradeLevel = score >= 80 ? 7 : score >= 60 ? 9 : score >= 40 ? 11 : 13;

  // 生成建議
  const recommendations: string[] = [];

  if (averageSentenceLength > 30) {
    recommendations.push("建議縮短句子長度，提高可讀性");
  }

  if (complexWordRatio > 0.2) {
    recommendations.push("可考慮使用更簡單的詞彙替代複雜詞語");
  }

  if (passiveVoicePercentage > 25) {
    recommendations.push("減少被動語態的使用，多用主動表達");
  }

  if (score < 60) {
    recommendations.push("整體文本偏複雜，建議簡化表達方式");
  }

  return {
    score,
    gradeLevel,
    averageSentenceLength,
    averageWordsPerSentence,
    passiveVoicePercentage,
    recommendations,
  };
}

// 文本難度分級
export function getReadabilityLevel(score: number): string {
  if (score >= 90) return "非常容易";
  if (score >= 80) return "容易";
  if (score >= 70) return "較容易";
  if (score >= 60) return "適中";
  if (score >= 50) return "較困難";
  if (score >= 30) return "困難";
  return "非常困難";
}

// 目標年級的理想分數範圍
export const GRADE_LEVEL_TARGETS = {
  middle: { min: 60, max: 80, label: "國中程度" },
  high: { min: 50, max: 70, label: "高中程度" },
  college: { min: 40, max: 60, label: "大學程度" },
};

// 檢查文本是否符合目標年級
export function checkGradeLevelCompatibility(
  score: number,
  targetLevel: "middle" | "high" | "college"
): {
  isCompatible: boolean;
  suggestion: string;
} {
  const target = GRADE_LEVEL_TARGETS[targetLevel];

  if (score >= target.min && score <= target.max) {
    return {
      isCompatible: true,
      suggestion: `文本難度適合${target.label}學生`,
    };
  }

  if (score > target.max) {
    return {
      isCompatible: false,
      suggestion: `文本對${target.label}學生來說過於簡單，可適當增加複雜度`,
    };
  }

  return {
    isCompatible: false,
    suggestion: `文本對${target.label}學生來說過於困難，建議簡化表達`,
  };
}
