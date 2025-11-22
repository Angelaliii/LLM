import React from "react";
import { useChatStore } from "../../store/useChatStore";
import { e2Chunks } from "../../types/data/missions/e2-industrial-agri";

const MissionIntro: React.FC = () => {
  const { missionId, actions } = useChatStore();
  const chunk = e2Chunks.find((c) => c.missionId === missionId) || e2Chunks[0];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">任務開場故事</h2>
      <div className="text-sm text-gray-600 mb-4">{chunk.topic}</div>
      <div className="bg-white p-4 rounded shadow mb-4">
        <p className="text-gray-700">{chunk.text}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => actions.goToStage("S2")}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          開始調查（選擇對話角色）
        </button>
        <button
          onClick={() => actions.goToStage("S0")}
          className="px-3 py-2 bg-gray-200 rounded"
        >
          返回任務列表
        </button>
      </div>
    </div>
  );
};

export default MissionIntro;
