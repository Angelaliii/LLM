// 主系統應用入口 - S0-S5 使用者流程
import React, { useEffect } from "react";
import { useMissionStore } from "./store/useMissionStore";
import MissionList from "./components/MissionList";  // S0
import MissionIntro from "./components/MissionIntro"; // S1
import NPCSelector from "./components/NPCSelector";   // S2
import SimpleChatRoom from "./components/SimpleChatRoom"; // S3 (使用新的 SimpleChatRoom)
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
        return <SimpleChatRoom />;
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
      {/* 主要內容區域 */}
      <main className="flex-1">
        {renderCurrentStage()}
      </main>
    </div>
  );
};

export default AppMain;