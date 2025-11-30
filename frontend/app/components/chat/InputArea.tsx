import React, { useState } from "react";
import { predefinedQuestions } from "../../data/predefinedQA";
import { useMultiChatStore } from "../../store/useMultiChatStore";

interface InputAreaProps {
  personaName?: string;
  currentStage?: number;
  totalStages?: number;
}

const InputArea: React.FC<InputAreaProps> = ({ 
  personaName = "對話角色",
  currentStage = 1,
  totalStages = 5
}) => {
  const { isLoading, currentPersonaId, actions } = useMultiChatStore();
  const [input, setInput] = useState("");
  
  // 檢查是否已選擇角色
  const hasSelectedPersona = currentPersonaId && currentPersonaId.trim() !== "";

  const handleQuestionSelect = async (
    _questionId: string,
    questionText: string
  ) => {
    if (isLoading || !hasSelectedPersona) return;

    // 發送用戶選擇的問題
    await actions.sendMessage(questionText);

    // 不在此處直接插入預設答案；sendMessage() 會透過 store 檢查並在串流時使用預設答案
  };

  const handleSendInput = async () => {
    const text = input.trim();
    if (!text || isLoading || !hasSelectedPersona) return;
    setInput("");
    await actions.sendMessage(text);
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
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
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={hasSelectedPersona ? "請輸入你的問題..." : "請先選擇對話角色"}
          disabled={isLoading || !hasSelectedPersona}
        />
        <button
          onClick={() => void handleSendInput()}
          disabled={isLoading || !hasSelectedPersona}
          className="px-3 py-2 bg-primary-600 text-white rounded disabled:opacity-50">
          送出
        </button>
      </div>

      {/* 載入指示器 */}
      {isLoading && (
        <div className="mt-3 flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">{personaName}正在思考...</span>
        </div>
      )}
    </div>
  );
};

export default InputArea;
