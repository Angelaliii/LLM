// S0 - 任務選單：從任務列表中選擇要挑戰的任務
import React from "react";
import { useMissionStore } from "../store/useMissionStore";
import { useMultiChatStore } from "../store/useMultiChatStore";
import { allMissions } from "../data/missions";

interface MissionDisplay {
  id: string;
  name: string;
  era: string;
  difficulty: "初級" | "中級" | "高級";
  status: "未開始" | "進行中" | "已完成";
  bestScore?: number;
  description: string;
  estimatedTime: string;
  stageCount: number;
  learningGoals: string[];
}

// 將任務資料轉換為顯示格式
const getMissionStatus = (missionId: string, currentMissionId: string | null, selectedNpcId: string | null, chatStore: any): "未開始" | "進行中" | "已完成" => {
  if (currentMissionId === missionId && selectedNpcId && chatStore.conversationsByPersona[selectedNpcId]?.length > 0) {
    return "進行中";
  }
  return "未開始";
};

const MissionList: React.FC = () => {
  const { actions, currentMissionId, selectedNpcId } = useMissionStore();
  const chatStore = useMultiChatStore();

  // 將任務資料轉換為顯示格式（動態狀態）
  const missions: MissionDisplay[] = allMissions.map((mission) => ({
    id: mission.id,
    name: mission.title,
    era: mission.period,
    difficulty: mission.difficulty,
    status: getMissionStatus(mission.id, currentMissionId, selectedNpcId, chatStore),
    description: mission.description,
    estimatedTime: mission.estimatedTime,
    stageCount: mission.stages.length,
    learningGoals: mission.learningGoals,
  }));

  // 檢查是否有進行中的對話
  const hasOngoingConversation = (missionId: string) => {
    // 檢查該任務是否有對話記錄
    return currentMissionId === missionId && selectedNpcId && 
           chatStore.conversationsByPersona[selectedNpcId]?.length > 0;
  };

  const handleMissionSelect = (missionId: string) => {
    // 如果有進行中的對話，直接跳到 S3（對話頁面）
    if (hasOngoingConversation(missionId)) {
      actions.goToStage('S3');
    } else {
      // 否則正常進入任務流程（S1）
      actions.selectMission(missionId);
    }
  };

  const getDifficultyColor = (difficulty: MissionDisplay["difficulty"]) => {
    switch (difficulty) {
      case "初級":
        return "bg-green-100 text-green-800";
      case "中級":
        return "bg-yellow-100 text-yellow-800";
      case "高級":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: MissionDisplay["status"]) => {
    switch (status) {
      case "已完成":
        return "✅";
      case "進行中":
        return "🔄";
      default:
        return "🚀";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50 py-12">
      <div className="container-max">
        <div className="text-center mb-12">
          <h1 className="text-heading-1 text-dark-900 mb-4">
            選擇您的歷史任務
          </h1>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className="card bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* 頂部圖片區 */}
              <div className="relative h-48 mb-4 -mx-6 -mt-6">
                <img 
                  src="/assets/images/background.png" 
                  alt={mission.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                      mission.difficulty
                    )} backdrop-blur-sm bg-opacity-90`}
                  >
                    {mission.difficulty}
                  </span>
                </div>
              </div>

              <h3 className="text-heading-3 text-dark-900 mb-2">
                {mission.name}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-primary-600 font-medium">
                  {mission.era}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">
                  {mission.estimatedTime}
                </span>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">
                {mission.description}
              </p>

              {mission.bestScore && (
                <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-700">最高分數</span>
                    <span className="text-lg font-bold text-primary-600">
                      {mission.bestScore}分
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleMissionSelect(mission.id)}
                className="w-full btn-primary flex items-center justify-center gap-2 group"
              >
                <span>
                  {hasOngoingConversation(mission.id) ? '繼續對話' : '開始任務'}
                </span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
              
              {hasOngoingConversation(mission.id) && (
                <div className="mt-2 text-xs text-center text-green-600 dark:text-green-400">
                  💬 有進行中的對話
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MissionList;