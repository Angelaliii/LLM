// 主系統應用入口 - S0-S5 使用者流程
import React, { useEffect } from "react";
import { useMissionStore } from "./store/useMissionStore";
import LanguageGate from "./components/language/LanguageGate";  // 語言選擇
import { useLanguageSelector } from "./components/language/useLanguageSelector";
import MissionList from "./components/MissionList";  // S0 任務列表
import S1_FileDecryption from "./components/s1/S1_FileDecryption"; // S1  
import S2_NpcSelection from "./components/s2/S2_NpcSelection"; // S2
import S3Component from "./components/s3/S3_LineStyleChat"; // S3 (LINE-style chat)
import S4_ArchiveRepair from "./components/s4/S4_ArchiveRepair"; // S4
import S5_ViewpointVerification from "./components/s5/S5_ViewpointVerification";   // S5 (替換舊版)

const AppMain: React.FC = () => {
  const { currentStage, currentMissionId, actions } = useMissionStore();
  const { isLanguageGateShown, isLoading: isLanguageLoading } = useLanguageSelector();
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    // Check for a short-lived startup instruction (set by S5 reset flow)
    try {
      const startupStage = sessionStorage.getItem('initial-stage');
      const startupMission = sessionStorage.getItem('initial-mission');
      if (startupStage && ['S0','S1','S2','S3','S4','S5'].includes(startupStage)) {
        // apply startup stage and mission before UI renders to avoid flashing old state
        useMissionStore.setState({ currentStage: startupStage as any, currentMissionId: startupMission || null });
        // cleanup the temp keys
        sessionStorage.removeItem('initial-stage');
        sessionStorage.removeItem('initial-mission');
      }
    } catch (e) {
      // ignore
    }
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

  // 若語言未初始化或需要顯示語言 Gate，先顯示語言選擇
  if (isLanguageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (isLanguageGateShown) {
    return <LanguageGate />;
  }

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
          return <S5_ViewpointVerification />;
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