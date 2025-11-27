import React from "react";

interface TypingIndicatorProps {
  personaName?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ personaName = "對話角色" }) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[70%]">

        {/* 打字指示器 */}
        <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              正在思考
            </span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
