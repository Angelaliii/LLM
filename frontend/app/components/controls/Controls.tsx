import React from "react";
import { useChatStore } from "../../store/useChatStore";
import type { ChatMode, RigorLevel } from "../../types/chat";

const Controls: React.FC = () => {
  const { mode, rigorLevel, actions } = useChatStore();

  const modeOptions: { value: ChatMode; label: string; description: string }[] =
    [
      {
        value: "teaching",
        label: "教學模式",
        description: "詳細解釋，適合深度學習",
      },
      {
        value: "quick",
        label: "快問快答",
        description: "簡潔回答，快速獲得要點",
      },
      {
        value: "socratic",
        label: "蘇格拉底模式",
        description: "問答引導，啟發思考",
      },
    ];

  const rigorOptions: {
    value: RigorLevel;
    label: string;
    description: string;
  }[] = [
    {
      value: "strict",
      label: "嚴謹",
      description: "僅基於確切史料，學術嚴謹",
    },
    {
      value: "balanced",
      label: "平衡",
      description: "史實與教學需求並重",
    },
    {
      value: "casual",
      label: "輕鬆",
      description: "親和友善，易於理解",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="space-y-4">
        {/* 對話模式選擇 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            對話模式
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {modeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => actions.setMode(option.value)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  mode === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 嚴謹度選擇 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            史實嚴謹度
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {rigorOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => actions.setRigorLevel(option.value)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  rigorLevel === option.value
                    ? "border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={actions.clearMessages}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            清除對話
          </button>

          <button
            onClick={actions.startNewSession}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
          >
            新對話
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
