import React from "react";
import { findAnswerById } from "../../data/predefinedQA";
import { useChatStore } from "../../store/useChatStore";
import type { Message } from "../../types/chat";
import QuestionSelector from "./QuestionSelector";

const InputArea: React.FC = () => {
  const { isLoading, actions } = useChatStore();

  const handleQuestionSelect = async (
    questionId: string,
    questionText: string
  ) => {
    if (isLoading) return;

    // 發送用戶選擇的問題
    await actions.sendMessage(questionText);

    // 立即發送預定義的回答
    const predefinedAnswer = findAnswerById(questionId);
    if (predefinedAnswer) {
      // 模擬短暫延遲，讓對話更自然
      setTimeout(() => {
        // 手動添加秦始皇的回答
        const assistantMessage: Message = {
          id: `answer_${questionId}_${Date.now()}`,
          content: predefinedAnswer,
          role: "assistant",
          timestamp: new Date(),
          metadata: {
            mode: "teaching",
            readabilityScore: 75,
          },
        };
        actions.completeStreaming(assistantMessage);
      }, 500);
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 max-h-80 overflow-y-auto">
      <QuestionSelector
        onQuestionSelect={handleQuestionSelect}
        disabled={isLoading}
      />

      {/* 載入指示器 */}
      {isLoading && (
        <div className="mt-3 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">秦始皇正在思考...</span>
        </div>
      )}

      {/* 說明文字 */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        選擇上方問題與秦始皇對話 • 所有問題都經過歷史考證
      </div>
    </div>
  );
};

export default InputArea;
