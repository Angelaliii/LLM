// S0 - 任務選單：從任務列表中選擇要挑戰的任務
import React from "react";
import { useMissionStore } from "../store/useMissionStore";
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
const missions: MissionDisplay[] = allMissions.map((mission) => ({
  id: mission.id,
  name: mission.title,
  era: mission.period,
  difficulty: mission.difficulty,
  status: "未開始",
  description: mission.description,
  estimatedTime: mission.estimatedTime,
  stageCount: mission.stages.length,
  learningGoals: mission.learningGoals,
}));

const MissionList: React.FC = () => {
  const { actions } = useMissionStore();

  const handleMissionSelect = (missionId: string) => {
    actions.selectMission(missionId);
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
          <p className="text-xl text-dark-700 max-w-2xl mx-auto">
            每個任務都是一段精彩的歷史旅程，與古代人物對話，探索歷史真相
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className="card bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    mission.difficulty
                  )}`}
                >
                  {mission.difficulty}
                </span>
                <span className="text-2xl">{getStatusIcon(mission.status)}</span>
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

              <p className="text-gray-700 mb-4 leading-relaxed">
                {mission.description}
              </p>

              {/* 任務資訊 */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📚</span>
                  <span>{mission.stageCount} 個關卡</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🎯</span>
                  <span>{mission.learningGoals.length} 個學習目標</span>
                </div>
              </div>

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
                <span>開始任務</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* 任務統計 */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-heading-3 text-center mb-8">學習進度統計</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-2">1</div>
              <div className="text-sm text-gray-600">可用任務</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500 mb-2">0</div>
              <div className="text-sm text-gray-600">已完成</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-500 mb-2">0</div>
              <div className="text-sm text-gray-600">進行中</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-2">0</div>
              <div className="text-sm text-gray-600">總積分</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionList;