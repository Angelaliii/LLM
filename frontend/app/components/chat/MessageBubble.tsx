import React from "react";
import type { Message } from "../../types/chat";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  personaName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isStreaming = false,
  personaName = "對話角色",
}) => {
  const isUser = message.role === "user";

  // 格式化時間戳，容錯處理不同型別或無效時間
  const formatTime = (timestamp?: string | number | Date) => {
    if (!timestamp) return "";
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp as any);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // 計算可讀性顯示
  const getReadabilityColor = (score?: number) => {
    if (!score) return "gray";
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    return "red";
  };

  const getReadabilityText = (score?: number) => {
    if (!score) return "未評估";
    if (score >= 80) return "易讀";
    if (score >= 60) return "適中";
    return "困難";
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[70%] ${isUser ? "order-2" : "order-1"}`}>
        {/* 用戶名稱 */}
        <div
          className={`flex items-center mb-2 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isUser ? "您" : personaName}
          </span>
        </div>

        {/* 消息內容 */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
          }`}
        >
          {/* 消息文本 */}
          <div className="prose prose-sm max-w-none">
            {message.content.split("\n").map((paragraph, idx) => (
              <p
                key={idx}
                className={`mb-2 last:mb-0 ${isUser ? "text-white" : ""}`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* 串流指示器 */}
          {isStreaming && (
            <div className="inline-flex items-center ml-1">
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
          )}

          {/* 消息元數據 */}
          <div
            className={`flex items-center justify-between mt-2 pt-2 border-t ${
              isUser
                ? "border-blue-400"
                : "border-gray-200 dark:border-gray-600"
            }`}
          >
            <div className="flex items-center space-x-2 text-xs">
              <span
                className={
                  isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                }
              >
                {formatTime(message.timestamp)}
              </span>

              {/* 模式標識 */}
              {message.metadata?.mode && !isUser && (
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    message.metadata.mode === "teaching"
                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      : message.metadata.mode === "quick"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                  }`}
                >
                  {message.metadata.mode === "teaching"
                    ? "教學"
                    : message.metadata.mode === "quick"
                    ? "快答"
                    : "蘇式"}
                </span>
              )}
            </div>

            {/* 可讀性指標 */}
            {message.metadata?.readabilityScore && !isUser && (
              <div className="flex items-center space-x-1">
                <div
                  className={`w-2 h-2 rounded-full bg-${getReadabilityColor(
                    message.metadata.readabilityScore
                  )}-500`}
                  title={`可讀性：${getReadabilityText(
                    message.metadata.readabilityScore
                  )} (${message.metadata.readabilityScore}分)`}
                ></div>
                <span className="text-xs text-gray-400">
                  {getReadabilityText(message.metadata.readabilityScore)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 史實檢查結果 */}
        {message.metadata?.factChecks &&
          message.metadata.factChecks.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.metadata.factChecks.map((fact, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      史實核查
                    </span>
                    <span
                      className={`font-medium ${
                        fact.confidence >= 0.8
                          ? "text-green-600 dark:text-green-400"
                          : fact.confidence >= 0.5
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {fact.confidence >= 0.8
                        ? "可信"
                        : fact.confidence >= 0.5
                        ? "存疑"
                        : "低信度"}
                    </span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 mt-1">
                    {fact.claim}
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* 來源引用 */}
        {message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <span>📚</span>
              <span>參考來源：{message.metadata.sources.join(", ")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
