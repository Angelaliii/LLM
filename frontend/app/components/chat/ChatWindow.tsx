import React, { useEffect, useRef } from "react";
import { useMultiChatStore } from "../../store/useMultiChatStore";
import InputArea from "./InputArea";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatHeader from "./ChatHeader";
import PersonaSwitcher from "./PersonaSwitcher";

import { e2Npcs } from "../../data/missions/e2-industrial-agri";

const ChatWindow: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 使用新的多角色 store：選取 actions 與需要的狀態屬性
  const {
    actions,
    isLoading,
    isStreaming,
    streamingContent,
    error,
    investigationComplete,
    currentPersonaId,
  } = useMultiChatStore((state) => ({
    actions: state.actions,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    streamingContent: state.streamingContent,
    error: state.error,
    investigationComplete: state.investigationComplete,
    currentPersonaId: state.currentPersonaId,
  }));

  // 將 currentPersonaId 映射為 selectedNpcId（舊變數名兼容）
  const selectedNpcId = currentPersonaId;

  // 透過 actions 取得當前角色的訊息陣列
  const messages = actions.getCurrentMessages();

  // 取得當前角色名稱
  const getCurrentPersonaName = () => {
    const npc = e2Npcs.find((npc) => npc.id === selectedNpcId);
    return npc?.name || "對話角色";
  };

  const personaName = getCurrentPersonaName();

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
    <div className="flex-1 min-h-0 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-6">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* 側欄 由上層負責，這裡可隱藏以方便兩欄 layout */}

          {/* 右側主區塊 */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-[calc(100vh-4rem)]">
            {/* LINE 風格聊天頭部 */}
            <ChatHeader personaId={selectedNpcId || "default-character"} />

            {/* 角色切換器 */}
            <PersonaSwitcher />

            {/* 任務狀態列 */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {investigationComplete ? "S4 - 準備整理故事" : "S3 - 與 NPC 對話"}
                </div>
                <button
                  onClick={() => {
                    actions.markInvestigationComplete();
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  aria-label="標記調查完成，進入整理階段"
                >
                  我覺得差不多了
                </button>
              </div>
            </div>

            {/* 消息列表（內容超出時在此處滾動） */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && !isStreaming && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏛️</div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    與日治時期人物對話
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    請從左側選擇 NPC 角色，輸入您的問題，探索日治時期台灣的歷史真相。
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} personaName={personaName} />
              ))}

              {/* 串流逐字預覽：在 isStreaming 時顯示臨時的 assistant 訊息 */}
              {isStreaming && (
                <MessageBubble
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: streamingContent,
                    timestamp: new Date(),
                  }}
                  isStreaming={true}
                  personaName={personaName}
                />
              )}

              {/* 仍保留 loading 指示（可視情況顯示） */}
              {isLoading && !isStreaming && <TypingIndicator personaName={personaName} />}

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

            {/* 將輸入區放入右側卡片底部，與卡片樣式一致 */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
              <InputArea personaName={personaName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
