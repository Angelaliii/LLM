// Backend safety guardrails moved from frontend
import type { SafetyCheckResult } from "../../src/types/api";

export const SAFETY_KEYWORDS = {
  violence: [
    "殺死",
    "屠殺",
    "血腥",
    "暴力",
    "仇恨",
    "歧視",
    "種族優越",
    "民族清洗",
    "恐怖主義",
  ],
  politics: [
    "推翻政府",
    "革命",
    "政變",
    "民主運動",
    "抗議",
    "獨立運動",
    "分裂主義",
    "恐怖活動",
  ],
  inappropriate_glorification: [
    "偉大的征服",
    "英明的屠殺",
    "必要的殘酷",
    "正義的壓迫",
    "智慧的獨裁",
  ],
  anachronistic: [
    "民主",
    "人權",
    "自由",
    "平等",
    "憲法",
    "選舉",
    "科技",
    "電腦",
    "網路",
    "手機",
    "現代化",
    "全球化",
    "資本主義",
    "社會主義",
  ],
};

export const EDUCATIONAL_REDIRECTS = {
  violence_glorification: `朕理解你對歷史中強力政策的好奇，但我們應該以學術角度來探討這些問題。古代的治理方式確實與現代價值觀存在差異，讓我們從歷史脈絡來理解當時的政治環境與制度選擇。`,
  anachronistic_concepts: `你提到的概念在朕的時代尚未出現。讓我們回到戰國秦代的歷史背景，探討當時的政治制度與社會結構。你是否想了解古代與現代在治理理念上的差異？`,
  inappropriate_modern_parallels: `將古代歷史與現代政治直接類比容易產生誤解。朕建議我們專注於歷史本身的學習，理解不同時代的特殊背景與限制條件。`,
  offensive_language: `請保持對歷史人物與學習環境的尊重。讓我們以適當的方式討論歷史問題，這樣更有助於學習與理解。`,
};

export function checkContentSafety(content: string): SafetyCheckResult {
  const issues: SafetyCheckResult["issues"] = [];
  const lowerContent = content.toLowerCase();

  const violenceKeywords = SAFETY_KEYWORDS.violence.filter((keyword) =>
    lowerContent.includes(keyword.toLowerCase())
  );
  if (violenceKeywords.length > 0) {
    issues.push({
      type: "inappropriate",
      severity: "high",
      message: `包含可能不適當的暴力相關詞彙：${violenceKeywords.join(", ")}`,
      suggestion: EDUCATIONAL_REDIRECTS.violence_glorification,
    });
  }

  const politicsKeywords = SAFETY_KEYWORDS.politics.filter((keyword) =>
    lowerContent.includes(keyword.toLowerCase())
  );
  if (politicsKeywords.length > 0) {
    issues.push({
      type: "inappropriate",
      severity: "medium",
      message: `包含現代政治敏感詞彙：${politicsKeywords.join(", ")}`,
      suggestion: EDUCATIONAL_REDIRECTS.inappropriate_modern_parallels,
    });
  }

  const anachronisticKeywords = SAFETY_KEYWORDS.anachronistic.filter((keyword) =>
    lowerContent.includes(keyword.toLowerCase())
  );
  if (anachronisticKeywords.length > 0) {
    issues.push({
      type: "anachronistic",
      severity: "medium",
      message: `包含時代錯置的概念：${anachronisticKeywords.join(", ")}`,
      suggestion: EDUCATIONAL_REDIRECTS.anachronistic_concepts,
    });
  }

  const glorificationKeywords = SAFETY_KEYWORDS.inappropriate_glorification.filter(
    (keyword) => lowerContent.includes(keyword.toLowerCase())
  );
  if (glorificationKeywords.length > 0) {
    issues.push({
      type: "educational_concern",
      severity: "high",
      message: `可能包含對暴力的不當美化：${glorificationKeywords.join(", ")}`,
      suggestion: EDUCATIONAL_REDIRECTS.violence_glorification,
    });
  }

  return {
    isSafe: issues.length === 0 || issues.every((issue) => issue.severity === "low"),
    issues,
    alternativePrompt:
      issues.length > 0 ? generateAlternativePrompt(content, issues) : undefined,
  };
}

function generateAlternativePrompt(
  _originalContent: string,
  issues: SafetyCheckResult["issues"]
): string {
  const hasViolence = issues.some(
    (issue) => issue.type === "inappropriate" && issue.message.includes("暴力")
  );
  const hasAnachronism = issues.some((issue) => issue.type === "anachronistic");
  const hasPolitics = issues.some(
    (issue) => issue.type === "inappropriate" && issue.message.includes("政治")
  );

  if (hasViolence) {
    return "讓我們換個角度討論：秦朝的政治制度與法律體系是如何建立的？";
  }

  if (hasAnachronism) {
    return "讓我們專注於古代歷史：戰國時期的政治制度有哪些特點？";
  }

  if (hasPolitics) {
    return "讓我們回到歷史學習：秦朝的統一過程中採用了哪些策略？";
  }

  return "讓我們重新思考這個問題：你想了解秦朝歷史的哪個方面？";
}

export function checkResponseSafety(response: string): SafetyCheckResult {
  const issues: SafetyCheckResult["issues"] = [];

  const citationPattern = /《[^》]+》第\d+章|《[^》]+》卷\d+|出自《[^》]+》第\d+頁/g;
  const hasSpecificCitations = citationPattern.test(response);
  if (hasSpecificCitations) {
    issues.push({
      type: "historical_inaccuracy",
      severity: "high",
      message: "回應中包含可能杜撰的具體文獻引用",
      suggestion:
        "應該使用「據史載」「史書記錄」等模糊表達，避免具體頁碼或章節",
    });
  }

  const violenceGlorificationPattern = /(偉大的征服|英明的決策.*殺|智慧的鎮壓|必要的清除)/gi;
  if (violenceGlorificationPattern.test(response)) {
    issues.push({
      type: "educational_concern",
      severity: "high",
      message: "回應可能美化了暴力或不人道的行為",
      suggestion: "應該提供客觀分析，避免價值判斷，並提及不同史學觀點",
    });
  }

  const anachronisticPattern = /(民主制度|人權觀念|科學技術|現代化進程)/gi;
  if (anachronisticPattern.test(response)) {
    issues.push({
      type: "anachronistic",
      severity: "medium",
      message: "回應包含時代錯置的概念或詞彙",
      suggestion: "應該使用符合古代歷史背景的概念與詞彙",
    });
  }

  return {
    isSafe: issues.length === 0 || issues.every((issue) => issue.severity === "low"),
    issues,
  };
}

export const SENSITIVE_TOPIC_GUIDELINES = {
  焚書坑儒: {
    approach: "balanced_academic",
    keyPoints: [
      "分別討論焚書與坑儒兩個事件",
      "說明事件的政治背景與動機",
      "承認史料記載的爭議性",
      "提供多重史學觀點",
      "避免簡單的道德評判",
    ],
    sample:
      "關於焚書坑儒，這實際上是兩個相關但不同的事件。焚書主要針對《詩》《書》等典籍，目的在於統一思想文化，但醫藥、農業等實用書籍得以保留。坑儒則是因為方士求仙藥失敗後的政治事件。史學界對這些事件的具體規模和影響存在不同看法，我們應該以史料為依據，同時理解當時的政治環境。",
  },

  專制統治: {
    approach: "contextual_analysis",
    keyPoints: [
      "解釋中央集權制的歷史必要性",
      "對比古代與現代的治理理念",
      "說明制度的歷史演進過程",
      "避免用現代價值觀直接評判",
      "強調歷史脈絡的重要性",
    ],
    sample:
      "中央集權制在統一後的大帝國管理中具有現實需要。戰國分裂的教訓使得集權成為維護統一的重要手段。我們應該從當時的歷史條件來理解這一制度，而非簡單地以現代標準來評判。",
  },

  勞役與民眾負擔: {
    approach: "factual_humanitarian",
    keyPoints: [
      "承認大型工程對民眾的影響",
      "解釋古代勞役制度的背景",
      "提及史料中的不同記載",
      "避免美化或完全否定",
      "引導思考制度的複雜性",
    ],
    sample:
      "大型建設工程確實需要大量人力，這在古代是常見的做法。史料對於民眾負擔的記載有不同程度的描述，我們應該客觀地看待這一歷史現象，既不美化也不過度批判，而是理解其在歷史進程中的複雜作用",
  },
};
// (migrated to backend)
