import React from "react";
import ChatWindow from "./chat/ChatWindow";
import NPCSelector from "./NPCSelector";
import { useChatStore } from "../store/useChatStore";

const ChatRoom: React.FC = () => {
  const { actions, missionId } = useChatStore();

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-start gap-6">
          {/* 左側：角色側欄 */}
          <NPCSelector compact />

          {/* 右側：LINE-like 對話區 */}
          <div className="flex-1 flex flex-col bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-4rem)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold">{missionId ? "任務對話" : "對話"}</h2>
                <div className="text-sm text-gray-500">可從左側選擇想詢問的角色</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => actions.goToStage("S2")} className="px-3 py-1 bg-gray-200 rounded" aria-label="切換角色">切換角色</button>
                <button onClick={() => (actions as any).markInvestigationComplete()} className="px-3 py-1 bg-green-600 text-white rounded" aria-label="標記調查完成">我覺得差不多了</button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <ChatWindow hideSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
