// Main system application entry - S0-S5 user flow
import React, { useEffect } from "react";
import { useMissionStore } from "./store/useMissionStore";
import MissionList from "./components/MissionList";  // S0
import S1_FileDecryption from "./components/s1/S1_FileDecryption"; // S1  
import S2_NpcSelection from "./components/s2/S2_NpcSelection"; // S2
import S3Component from "./components/new_S3"; // S3 (LINE-style chat)
import S4_ArchiveRepair from "./components/s4/S4_ArchiveRepair"; // S4
import S5_ViewpointVerification from "./components/s5/S5_ViewpointVerification";   // S5 (Replace old version)

const AppMain: React.FC = () => {
  const { currentStage, currentMissionId, actions } = useMissionStore();
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
      // Strengthen state validation: check completeness of S3 state
      if (currentStage === "S3" && (!currentMissionId)) {
        console.warn('[AppMain] S3 stage but missing missionId, resetting to S0');
        actions.resetMission();
      } else if (!currentMissionId && currentStage !== "S0") {
        // If no mission selected but not in S0, reset to S0 (mission list)
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

  // Render the current stage UI
  const renderCurrentStage = () => {
    try {
      // Defensive check: if currentStage is not valid, return to S0
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
      // Reset to safe state when error occurs
      actions.resetMission();
      return <MissionList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area */}
      <main className="flex-1">
        <React.Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          {renderCurrentStage()}
        </React.Suspense>
      </main>
    </div>
  );
};

export default AppMain;