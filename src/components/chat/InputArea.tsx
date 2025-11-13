import React, { useState } from "react";
import { findAnswerById, predefinedQuestions } from "../../data/predefinedQA";
import { useChatStore } from "../../store/useChatStore";
import type { Message } from "../../types/chat";

const InputArea: React.FC = () => {
  const { isLoading, actions } = useChatStore();
  const [input, setInput] = useState("");

  const handleQuestionSelect = async (
    questionId: string,
    questionText: string
  ) => {
    if (isLoading) return;

    // 發送用戶選擇的問題
    await actions.sendMessage(questionText);

    // 若有預設答案，模擬回覆以提升互動感
    const predefinedAnswer = findAnswerById(questionId);
    if (predefinedAnswer) {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: `answer_${questionId}_${Date.now()}`,
          content: predefinedAnswer,
          role: "assistant",
          timestamp: new Date(),
          metadata: { mode: "teaching", readabilityScore: 75 },
        };
        actions.completeStreaming(assistantMessage);
      }, 500);
    }
  };

  const handleSendInput = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await actions.sendMessage(text);
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      {/* 建議的三個問題（固定前三個） */}
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 text-center md:text-left">
          建議問題
        </h3>
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {predefinedQuestions.slice(0, 3).map((q) => (
            <button
              key={q.id}
              onClick={() => handleQuestionSelect(q.id, q.text)}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full hover:bg-primary-50 dark:hover:bg-primary-600 disabled:opacity-50"
            >
              <span className="text-xs text-gray-900 dark:text-white block truncate max-w-xs">
                {q.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 輸入框 */}
      <div className="mt-2 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleSendInput();
            }
          }}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="請輸入你的問題，或選擇上方建議問題..."
          disabled={isLoading}
        />
        <button
          onClick={() => void handleSendInput()}
          disabled={isLoading}
          className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          送出
        </button>
      </div>

      {/* 載入指示器 */}
      {isLoading && (
        <div className="mt-3 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">秦始皇正在思考...</span>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        可直接輸入或選擇建議問題 • 所有建議問題均經過歷史考證
      </div>
    </div>
  );
};

export default InputArea;
