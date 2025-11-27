import React, { useState } from "react";
import ChatWindow from "./chat/ChatWindow";
import { useMissionStore } from "../store/useMissionStore";
import { useChatStore } from "../store/useChatStore";
import { getMissionById } from "../data/missions";

const ChatRoom: React.FC = () => {
  const { currentMissionId, currentStageIndex, actions: missionActions } = useMissionStore();
  const { actions: chatActions } = useChatStore();
  const [selectedNpcId, setSelectedNpcId] = useState<string>("student"); // 預設選擇第一個角色

  const mission = currentMissionId ? getMissionById(currentMissionId) : null;
  const currentStage = mission?.stages[currentStageIndex];

  if (!mission || !currentStage) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">找不到任務資訊</p>
          <button
            onClick={() => missionActions.goToStage("S0")}
            className="btn-primary"
          >
            返回任務列表
          </button>
        </div>
      </div>
    );
  }

  // NPC 資料
  const npcs = [
    { id: "student", name: "小清", role: "學生", icon: "👧", color: "blue" },
    { id: "police_officer", name: "佐藤 敬一", role: "警察", icon: "👮", color: "red" },
    { id: "land_surveyor", name: "山本 勘助", role: "土地測量員", icon: "📐", color: "green" }
  ];

  const handleNpcSelect = (npcId: string) => {
    setSelectedNpcId(npcId);
    // TODO: 通知 ChatWindow 切換 NPC
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 角色選擇器 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">選擇對話角色:</h3>
            <div className="flex gap-2">
              {npcs.map(npc => (
                <button
                  key={npc.id}
                  onClick={() => handleNpcSelect(npc.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    selectedNpcId === npc.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className="text-xl">{npc.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{npc.name}</div>
                    <div className="text-xs text-gray-500">{npc.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 對話區 */}
      <div className="flex-1 flex flex-col bg-white">
        {/* 對話視窗 */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow hideSidebar npcId={selectedNpcId} />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
