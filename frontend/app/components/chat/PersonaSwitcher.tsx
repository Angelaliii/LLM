import React from "react";
import { useMultiChatStore } from "../../store/useMultiChatStore";
import { e2Npcs } from "../../data/missions/e2-industrial-agri";

const PersonaSwitcher: React.FC = () => {
  const { currentPersonaId, conversationsByPersona, actions } = useMultiChatStore();

  // 獲取可用的角色列表（兼容前端任務資料結構）
  const availablePersonas = (e2Npcs || []).map((npc) => ({
    id: npc.id,
    name: npc.name,
    // e2Npcs 使用頂層的 `avatar` 與 `role` 欄位；若沒有則使用預設
    avatar: npc.avatar || "",
    title: npc.role || "",
    period: (npc as any).period || "",
  }));

  // 計算每個角色的未讀消息數
  const getMessageCount = (personaId: string) => {
    return conversationsByPersona[personaId]?.length || 0;
  };

  const handlePersonaSwitch = (personaId: string) => {
    actions.switchToPersona(personaId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center space-x-2 overflow-x-auto">
        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap mr-2">
          對話角色：
        </span>
        
        {availablePersonas.map((persona) => {
          const isActive = persona.id === currentPersonaId;
          const messageCount = getMessageCount(persona.id);
          
          return (
            <button
              key={persona.id}
              onClick={() => handlePersonaSwitch(persona.id)}
              className={`
                relative flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200
                ${isActive 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              {/* 角色頭像 */}
              <div className="relative">
                {persona.avatar ? (
                  <img
                    src={persona.avatar}
                    alt={`${persona.name} 頭像`}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${isActive ? 'bg-white text-primary-500' : 'bg-primary-500 text-white'}
                  `}>
                    {persona.name.slice(0, 1)}
                  </div>
                )}
                
                {/* 在線指示器 */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
              </div>

              {/* 角色名稱 */}
              <span className="text-sm font-medium whitespace-nowrap">
                {persona.name}
              </span>

              {/* 消息計數 */}
              {messageCount > 0 && (
                <span className={`
                  min-w-[16px] h-4 px-1 text-xs rounded-full flex items-center justify-center
                  ${isActive 
                    ? 'bg-white text-primary-500' 
                    : 'bg-primary-500 text-white'
                  }
                `}>
                  {messageCount > 99 ? '99+' : messageCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PersonaSwitcher;