import React, { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import PersonaBadge from "../ui/PersonaBadge";
import InputArea from "./InputArea";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const ChatWindow: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    error,
    personaId,
    mode,
    rigorLevel,
    actions,
  } = useChatStore();

  // 自動滾動到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleRetry = () => {
    actions.retry();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* 人物標識與模式顯示 */}
      <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between">
          <PersonaBadge personaId={personaId} />
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
              {mode === "teaching"
                ? "教學模式"
                : mode === "quick"
                ? "快問快答"
                : "蘇格拉底模式"}
            </span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
              {rigorLevel === "strict"
                ? "嚴謹"
                : rigorLevel === "balanced"
                ? "平衡"
                : "輕鬆"}
            </span>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !isStreaming && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👑</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              與秦始皇對話
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              請在下方選擇您想詢問的問題，朕將以史實為基礎，為您提供詳細的解答。
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* 串流訊息顯示 */}
        {isStreaming && (
          <MessageBubble
            message={{
              id: "streaming",
              role: "assistant",
              content: streamingContent,
              timestamp: new Date(),
            }}
            isStreaming={true}
          />
        )}

        {/* 輸入指示器 */}
        {isLoading && !isStreaming && <TypingIndicator />}

        {/* 錯誤顯示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-red-800 dark:text-red-200 font-medium">
                  發生錯誤
                </h4>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                  {error}
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors text-sm"
              >
                重試
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區域 */}
      <InputArea />
    </div>
  );
};

export default ChatWindow;
