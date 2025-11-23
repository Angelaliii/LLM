// 任務狀態管理 - 對應使用者流程 S0-S5
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
    // S0 → S1: 選擇任務
    selectMission: (missionId: string) => void;
    
    // S1 → S2: 設置任務介紹
    setMissionIntro: (intro: string, questions: string[]) => void;
    
    // S2 → S3: 選擇 NPC
    selectNpc: (npcId: string) => void;
    
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
          selectMission: (missionId: string) => {
            set({
              currentMissionId: missionId,
              currentStage: "S1",
              // 重置其他狀態
              selectedNpcId: null,
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
          quizScore: state.quizScore,
          quizCompleted: state.quizCompleted,
        }),
      }
    ),
    { name: "MissionStore" }
  )
);

export default useMissionStore;