// 主系統應用入口 - S0-S5 使用者流程
import React, { useEffect } from "react";
import { useMissionStore } from "./store/useMissionStore";
import MissionList from "./components/MissionList";  // S0
import S1_FileDecryption from "./components/s1/S1_FileDecryption"; // S1  
import S2_NpcSelection from "./components/s2/S2_NpcSelection"; // S2
import S3Component from "./components/new_S3"; // S3 (LINE-style chat)
import S4_ArchiveRepair from "./components/s4/S4_ArchiveRepair"; // S4
import S5_Reflection from "./components/s5/S5_Reflection";   // S5

const AppMain: React.FC = () => {
  const { currentStage, currentMissionId, actions } = useMissionStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    // 初始化時確保在正確的階段
    if (!isInitialized) {
      // 強化狀態驗證：檢查 S3 狀態的完整性
      if (currentStage === "S3" && (!currentMissionId)) {
        console.warn('[AppMain] S3 stage but missing missionId, resetting to S0');
        actions.resetMission();
      } else if (!currentMissionId && currentStage !== "S0") {
        // 如果沒有選擇任務但不在 S0，重置到 S0（任務列表）
        console.warn('[AppMain] No mission selected, resetting to S0');
        actions.resetMission();
      }
      setIsInitialized(true);
    }
  }, [isInitialized, currentMissionId, currentStage, actions]);

  // Debug: log stage & mission changes to console to help trace why S1 isn't shown
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info('[AppMain] currentStage:', currentStage, 'currentMissionId:', currentMissionId);
  }, [currentStage, currentMissionId]);

  // 根據當前階段渲染對應介面
  const renderCurrentStage = () => {
    try {
      // 防禦性檢查：如果 currentStage 不是有效值，回到 S0
      const validStages = ["S0", "S1", "S2", "S3", "S4", "S5"];
      if (!validStages.includes(currentStage)) {
        console.warn('[AppMain] Invalid currentStage:', currentStage, 'resetting to S0');
        actions.resetMission();
        return <MissionList />;
      }

      switch (currentStage) {
        case "S0":
          return <MissionList />;
        case "S1": 
          return <S1_FileDecryption />;
        case "S2":
          return <S2_NpcSelection />;
        case "S3":
          return <S3Component />;
        case "S4":
          return <S4_ArchiveRepair />;
        case "S5":
          return <S5_Reflection />;
        default:
          return <MissionList />;
      }
    } catch (error) {
      console.error('[AppMain] Error rendering stage:', error);
      // 發生錯誤時重置到安全狀態
      actions.resetMission();
      return <MissionList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主要內容區域 */}
      <main className="flex-1">
        <React.Suspense fallback={<div className="p-8 text-center">載入中...</div>}>
          {renderCurrentStage()}
        </React.Suspense>
      </main>
    </div>
  );
};

export default AppMain;