// Backend safety guardrails moved from frontend
import type { SafetyCheckResult } from "../../types/api";

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
  violence_glorification: `I understand the curiosity about harsh historical policies, but we should discuss them academically. Governance then differed from modern values; let us view it in its historical context.`,
  anachronistic_concepts: `The concept you mentioned did not exist in that era. Let us return to the historical setting and examine the institutions and society of the time.`,
  inappropriate_modern_parallels: `Directly comparing past history with modern politics can be misleading. Let us focus on the history itself and the constraints of that period.`,
  offensive_language: `Please stay respectful toward historical figures and the learning context. Discussing history appropriately helps understanding.`,
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
      message: `Contains potentially inappropriate violence-related terms: ${violenceKeywords.join(", ")}`,
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
      message: `Contains modern political sensitive terms: ${politicsKeywords.join(", ")}`,
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
      message: `Contains anachronistic concepts: ${anachronisticKeywords.join(", ")}`,
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
      message: `May include inappropriate glorification of violence: ${glorificationKeywords.join(", ")}`,
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
    return "Let us shift the angle: how were the political and legal systems established in that era?";
  }

  if (hasAnachronism) {
    return "Let us focus on the historical period itself. What were the key features of governance then?";
  }

  if (hasPolitics) {
    return "Let us return to the historical discussion: what strategies were used for unification at that time?";
  }

  return "Let us reframe the question: which aspect of that historical period would you like to know?";
}

export function checkResponseSafety(response: string): SafetyCheckResult {
  const issues: SafetyCheckResult["issues"] = [];

  const citationPattern = /《[^》]+》第\d+章|《[^》]+》卷\d+|出自《[^》]+》第\d+頁/g;
  const hasSpecificCitations = citationPattern.test(response);
  if (hasSpecificCitations) {
    issues.push({
      type: "historical_inaccuracy",
      severity: "high",
      message: "Response may contain fabricated specific citations",
      suggestion:
        "Use vague attributions like 'historical records note' and avoid specific page or chapter numbers",
    });
  }

  const violenceGlorificationPattern = /(偉大的征服|英明的決策.*殺|智慧的鎮壓|必要的清除)/gi;
  if (violenceGlorificationPattern.test(response)) {
    issues.push({
      type: "educational_concern",
      severity: "high",
      message: "Response may glorify violence or inhumane acts",
      suggestion: "Provide objective analysis, avoid value judgments, and mention differing viewpoints",
    });
  }

  const anachronisticPattern = /(民主制度|人權觀念|科學技術|現代化進程)/gi;
  if (anachronisticPattern.test(response)) {
    issues.push({
      type: "anachronistic",
      severity: "medium",
      message: "Response contains anachronistic concepts or terms",
      suggestion: "Use concepts and wording consistent with the historical context",
    });
  }

  return {
    isSafe: issues.length === 0 || issues.every((issue) => issue.severity === "low"),
    issues,
  };
}

export const SENSITIVE_TOPIC_GUIDELINES = {
  book_burning: {
    approach: "balanced_academic",
    keyPoints: [
      "Discuss book burning and scholar persecution separately",
      "Explain political background and motives",
      "Acknowledge disputes in historical records",
      "Offer multiple historiographical views",
      "Avoid simplistic moral judgments",
    ],
    sample:
      "The incidents of burning books and punishing scholars were related but distinct. Book burning targeted classics to unify thought, while practical texts were spared. The punishment of scholars arose from political fallout. Historians differ on scale and impact; stay anchored to sources and context.",
  },

  autocracy: {
    approach: "contextual_analysis",
    keyPoints: [
      "Explain why centralization was seen as necessary",
      "Contrast governance ideas then vs. now",
      "Describe institutional evolution",
      "Avoid judging solely by modern values",
      "Stress historical context",
    ],
    sample:
      "Centralized power was viewed as practical for governing a unified realm. Lessons from fragmentation made central control appealing. Understand it within that era rather than by modern standards alone.",
  },

  labor_burden: {
    approach: "factual_humanitarian",
    keyPoints: [
      "Acknowledge impacts of large projects on people",
      "Explain background of labor systems",
      "Note differing historical accounts",
      "Avoid glorifying or outright dismissing",
      "Guide reflection on systemic complexity",
    ],
    sample:
      "Major works required vast labor, common in that era. Sources describe burdens to varying degrees. Be objective—neither glorify nor over-condemn—and recognize the complexity in context.",
  },
};
// (migrated to backend)
