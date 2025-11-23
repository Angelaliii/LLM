// 主系統應用入口 - S0-S5 使用者流程
import React, { useEffect } from "react";
import { useMissionStore } from "./store/useMissionStore";
import MissionList from "./components/MissionList";  // S0
import MissionIntro from "./components/MissionIntro"; // S1
import NPCSelector from "./components/NPCSelector";   // S2
import ChatRoom from "./components/ChatRoom";         // S3 (重命名為統一介面)
import SummaryView from "./components/SummaryView";   // S4
import QuizView from "./components/QuizView";         // S5

const AppMain: React.FC = () => {
  const { currentStage, currentMissionId, actions } = useMissionStore();

  useEffect(() => {
    // 初始化時確保在正確的階段
    if (!currentMissionId && currentStage !== "S0") {
      actions.resetMission();
    }
  }, [currentMissionId, currentStage, actions]);

  // 根據當前階段渲染對應介面
  const renderCurrentStage = () => {
    switch (currentStage) {
      case "S0":
        return <MissionList />;
      case "S1": 
        return <MissionIntro />;
      case "S2":
        return <NPCSelector />;
      case "S3":
        return <ChatRoom />;
      case "S4":
        return <SummaryView />;
      case "S5":
        return <QuizView />;
      default:
        return <MissionList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航/麵包屑 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container-max py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-dark-900">歷史對話系統</h1>
            {currentMissionId && (
              <div className="text-sm text-gray-500">
                任務：{currentMissionId} | 階段：{currentStage}
              </div>
            )}
          </div>
          
          {/* 階段指示器 */}
          <div className="flex items-center space-x-2">
            {["S0", "S1", "S2", "S3", "S4", "S5"].map((stage, index) => (
              <div
                key={stage}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  stage === currentStage
                    ? "bg-primary-500 text-white"
                    : index < ["S0", "S1", "S2", "S3", "S4", "S5"].indexOf(currentStage)
                    ? "bg-green-500 text-white" 
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          
          {/* 重置按鈕 */}
          {currentStage !== "S0" && (
            <button
              onClick={() => actions.resetMission()}
              className="btn-secondary px-4 py-2 text-sm"
            >
              重新開始
            </button>
          )}
        </div>
      </nav>

      {/* 主要內容區域 */}
      <main className="flex-1">
        {renderCurrentStage()}
      </main>
    </div>
  );
};

export default AppMain;