import { chatWithOllama } from './ollamaClient';

export type GoalStatus = 'not_mentioned' | 'wrong' | 'partial' | 'mastered';

export interface EvalResult {
  goals: { index: number; status: GoalStatus }[];
  overall: {
    masteredCount: number;
    partialCount: number;
    confidence: number;
  };
}

export async function evaluateProgress(params: {
  missionId?: string;
  learningGoalsText: string; // flattened goals text
  conversationSummary: string;
}) {
  const { learningGoalsText, conversationSummary } = params;

  const systemPrompt = `你是一位國中歷史老師，負責評估學生對某個任務的理解程度。請根據【學習目標】與【對話紀錄】，只回傳 JSON 評分結果，格式請遵守要求。`;

  const userContent = `學習目標：\n${learningGoalsText}\n\n對話紀錄：\n${conversationSummary}\n\n請只用以下 JSON 格式回覆，不要多寫解釋：\n{ "goals": [ { "index": 0, "status": "not_mentioned | wrong | partial | mastered" } ], "overall": { "masteredCount": 數字, "partialCount": 數字, "confidence": 0 到 1 的小數 } }`;

  const data = await chatWithOllama({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    stream: false,
  } as any);

  const raw = data?.message?.content ?? data?.choices?.[0]?.message?.content ?? String(data);

  try {
    const json = JSON.parse(raw) as EvalResult;
    return json;
  } catch (e) {
    // If parsing fails, return a conservative default
    return {
      goals: [],
      overall: { masteredCount: 0, partialCount: 0, confidence: 0 },
    } as EvalResult;
  }
}
