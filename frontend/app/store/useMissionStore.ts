// 任務狀態管理 - 對應使用者流程 S0-S5 (S2已整合至S3)
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// 任務階段定義 
export type MissionStage = "S0" | "S1" | "S2" | "S3" | "S4" | "S5";

// 任務狀態接口
interface MissionState {
  // 當前狀態
  currentStage: MissionStage;
  currentMissionId: string | null;
  selectedNpcId: string | null;
  
  // 新增：當前關卡追蹤
  currentStageIndex: number;
  completedStages: string[]; // 已完成的關卡 ID
  stageProgress: Record<string, {
    started: boolean;
    completed: boolean;
    collectedKeywords: string[];
  }>;
  
  // S1 任務開場故事
  missionIntro: string | null;
  guidingQuestions: string[];
  
  // S3 對話狀態
  conversationTurns: number;
  conversationSummary: string;
  
  // S3-EVAL 評估結果
  lastEvalResult: any | null;
  masteredGoalsCount: number;
  
  // S4 故事總結
  missionSummary: string | null;
  
  // S5 測驗結果
  quizScore: number | null;
  quizCompleted: boolean;
  
  // 操作方法
  actions: {
    // 初始化任務
    initializeMission: (missionId: string) => void;
    
    // S0 → S1: 選擇任務
    selectMission: (missionId: string) => void;
    
    // S1 → S2: 設置任務介紹
    setMissionIntro: (intro: string, questions: string[]) => void;
    
    // S2 → S3: 選擇 NPC
    selectNpc: (npcId: string) => void;
    
    // 新增：關卡進度管理
    startStage: (stageId: string) => void;
    completeStage: (stageId: string, keywords: string[]) => void;
    nextStage: () => void;
    updateStageProgress: (stageId: string, keywords: string[]) => void;
    
    // S3: 更新對話狀態
    updateConversation: (summary: string, turns: number) => void;
    updateEvaluation: (result: any, masteredCount: number) => void;
    
    // S3 → S4: 條件達成，生成故事總結
    generateSummary: (summary: string) => void;
    
    // S4 → S5: 開始測驗
    startQuiz: () => void;
    
    // S5: 完成測驗
    completeQuiz: (score: number) => void;
    
    // 重置任務
    resetMission: () => void;
    
    // 導航控制
    goToStage: (stage: MissionStage) => void;
  };
}

export const useMissionStore = create<MissionState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始狀態
        currentStage: "S0",
        currentMissionId: null,
        selectedNpcId: null,
        
        currentStageIndex: 0,
        completedStages: [],
        stageProgress: {},
        
        missionIntro: null,
        guidingQuestions: [],
        
        conversationTurns: 0,
        conversationSummary: "",
        
        lastEvalResult: null,
        masteredGoalsCount: 0,
        
        missionSummary: null,
        
        quizScore: null,
        quizCompleted: false,

        actions: {
          initializeMission: (missionId: string) => {
            set({
              currentMissionId: missionId,
              currentStageIndex: 0,
              completedStages: [],
              stageProgress: {},
            });
          },

          // S0 → S1: 選擇任務（正式實作）
          selectMission: (missionId: string) => {
            // 設定當前任務並進入 S1
            set({
              currentMissionId: missionId,
              currentStage: "S1",
              currentStageIndex: 0,
            });
          },

          startStage: (stageId: string) => {
            const state = get();
            set({
              stageProgress: {
                ...state.stageProgress,
                [stageId]: {
                  started: true,
                  completed: false,
                  collectedKeywords: state.stageProgress[stageId]?.collectedKeywords || [],
                },
              },
            });
          },

          completeStage: (stageId: string, keywords: string[]) => {
            const state = get();
            const isAlreadyCompleted = state.completedStages.includes(stageId);
            
            set({
              stageProgress: {
                ...state.stageProgress,
                [stageId]: {
                  started: true,
                  completed: true,
                  collectedKeywords: keywords,
                },
              },
              completedStages: isAlreadyCompleted 
                ? state.completedStages 
                : [...state.completedStages, stageId],
            });
          },

          nextStage: () => {
            const state = get();
            set({
              currentStageIndex: state.currentStageIndex + 1,
            });
          },

          updateStageProgress: (stageId: string, keywords: string[]) => {
            const state = get();
            const existing = state.stageProgress[stageId] || { started: true, completed: false, collectedKeywords: [] };
            const updatedKeywords = [...new Set([...existing.collectedKeywords, ...keywords])];
            
            set({
              stageProgress: {
                ...state.stageProgress,
                [stageId]: {
                  ...existing,
                  collectedKeywords: updatedKeywords,
                },
              },
            });
          },

          setMissionIntro: (intro: string, questions: string[]) => {
            set({
              missionIntro: intro,
              guidingQuestions: questions,
              // 不要自動跳轉，讓用戶有時間閱讀
            });
          },

          selectNpc: (npcId: string) => {
            set({
              selectedNpcId: npcId,
              currentStage: "S3",
            });
          },

          updateConversation: (summary: string, turns: number) => {
            set({
              conversationSummary: summary,
              conversationTurns: turns,
            });
          },

          updateEvaluation: (result: any, masteredCount: number) => {
            const state = get();
            set({
              lastEvalResult: result,
              masteredGoalsCount: masteredCount,
            });

            // 檢查是否達成條件進入 S4
            if (
              state.conversationTurns >= 6 &&
              masteredCount >= 3 &&
              result?.overall?.confidence >= 0.7
            ) {
              set({ currentStage: "S4" });
            }
          },

          generateSummary: (summary: string) => {
            set({
              missionSummary: summary,
              currentStage: "S4",
            });
          },

          startQuiz: () => {
            set({ currentStage: "S5" });
          },

          completeQuiz: (score: number) => {
            set({
              quizScore: score,
              quizCompleted: true,
              // 可選：回到 S0 或保持在 S5
            });
          },

          resetMission: () => {
            set({
              currentStage: "S0",
              currentMissionId: null,
              selectedNpcId: null,
              currentStageIndex: 0,
              completedStages: [],
              stageProgress: {},
              missionIntro: null,
              guidingQuestions: [],
              conversationTurns: 0,
              conversationSummary: "",
              lastEvalResult: null,
              masteredGoalsCount: 0,
              missionSummary: null,
              quizScore: null,
              quizCompleted: false,
            });
          },

          goToStage: (stage: MissionStage) => {
            set({ currentStage: stage });
          },
        },
      }),
      {
        name: "mission-store",
        partialize: (state) => ({
          // 只持久化必要的狀態
          currentMissionId: state.currentMissionId,
          currentStage: state.currentStage,  // 也保存當前階段
          selectedNpcId: state.selectedNpcId,  // 保存選中的 NPC
          quizScore: state.quizScore,
          quizCompleted: state.quizCompleted,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error('[mission-store] Rehydration failed:', error);
            return;
          }
          if (state) {
            console.info('[mission-store] Rehydrated state:', state);
            // 驗證重新載入的狀態是否合理
            if (state.currentStage === 'S3' && (!state.currentMissionId || !state.selectedNpcId)) {
              console.warn('[mission-store] Invalid S3 state detected during rehydration, resetting to S0');
              // 這裡不能直接調用 actions，需要在組件層面處理
            }
          }
        },
      }
    ),
    { name: "MissionStore" }
  )
);

export default useMissionStore;