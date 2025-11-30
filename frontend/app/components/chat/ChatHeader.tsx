import React from "react";
import { useChatStore } from "../../store/useChatStore";
import { e2Npcs } from "../../data/missions/e2-industrial-agri";

interface ChatHeaderProps {
  personaId: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  personaId,
  showBackButton = false,
  onBack,
}) => {
  // 獲取角色資訊
  const getCurrentPersona = () => {
    const npc = e2Npcs.find((npc) => npc.id === personaId);
    if (npc) {
      return {
        name: npc.name,
        // e2Npcs 提供頂層的 avatar 與 role 欄位
        title: npc.role || "",
        avatar: npc.avatar || "",
        period: (npc as any).period || "歷史時期",
      };
    }

    // 預設角色資訊
    return {
      name: "歷史人物",
      title: "與您對話",
      avatar: "",
      period: "日治時期 (1905年)",
    };
  };

  const persona = getCurrentPersona();

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center space-x-3 shadow-sm">
      {/* 返回按鈕 */}
      {showBackButton && (
        <button
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label="返回"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* 角色頭像 */}
      <div className="relative">
        {persona.avatar ? (
          <img
            src={persona.avatar}
            alt={`${persona.name} 頭像`}
            className="w-10 h-10 rounded-full object-cover shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {persona.name.slice(0, 1)}
          </div>
        )}
        {/* 在線指示器 */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
      </div>

      {/* 角色資訊 */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {persona.name}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          日治初期
        </p>
      </div>

      {/* 操作按鈕 */}
      <div className="flex items-center space-x-2">
        {/* 更多選項按鈕 */}
        <button
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label="更多選項"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;