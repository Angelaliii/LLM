// S3-EVAL 進度評估服務（System 2）
import type { LearningGoal } from "../types/history";
import { callOllamaChat } from "./ollama";

export type GoalStatus = "not_mentioned" | "wrong" | "partial" | "mastered";

export interface EvalResult {
  goals: { index: number; status: GoalStatus }[];
  overall: {
    masteredCount: number;
    partialCount: number;
    confidence: number; // 0~1
  };
}

export async function evaluateProgress(
  goals: LearningGoal[],
  conversationSummary: string
): Promise<EvalResult> {
  const goalText = goals
    .map((g, i) => `${i + 1}. ${g.description}`)
    .join("\\n");

  const systemPrompt = `
你是一位國中歷史老師，負責評估學生對某個任務的理解程度。
請根據【學習目標】與【對話紀錄】，只回傳 JSON 評分結果。
`.trim();

  const userContent = `
學習目標：
${goalText}

對話紀錄：
${conversationSummary}

請只用以下 JSON 格式回覆，不要多寫解釋：

{
  "goals": [
    { "index": 0, "status": "not_mentioned | wrong | partial | mastered" }
  ],
  "overall": {
    "masteredCount": 數字,
    "partialCount": 數字,
    "confidence": 0 到 1 的小數
  }
}
`.trim();

  const data = await callOllamaChat({
    systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  // 依實際回傳格式解析 data.message.content 為 JSON
  // 這裡假設模型乖乖輸出合法 JSON
  try {
    const json = JSON.parse(data.message.content) as EvalResult;
    return json;
  } catch (error) {
    // 如果解析失敗，回傳預設值
    console.error("Failed to parse eval result:", error);
    return {
      goals: goals.map((_, index) => ({ index, status: "not_mentioned" as GoalStatus })),
      overall: {
        masteredCount: 0,
        partialCount: 0,
        confidence: 0,
      },
    };
  }
}