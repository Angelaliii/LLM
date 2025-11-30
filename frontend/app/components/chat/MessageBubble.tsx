import React from "react";
import type { Message } from "../../types/chat";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  personaName?: string;
  avatarUrl?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isStreaming = false,
  personaName = "對話角色",
  avatarUrl,
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
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 items-end gap-2`}>
      {/* NPC 頭像 (左側) */}
      {!isUser && avatarUrl && (
        <img
          src={avatarUrl}
          alt={personaName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}
      
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
              ? "bg-primary-500 text-white"
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
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
