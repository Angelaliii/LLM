import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 線索類型定義
export interface Clue {
  id: string;
  text: string;
  type: 'fact' | 'conflict' | 'empathy' | 'background';
  source: string; // NPC名字或來源
  relatedGapId?: string; // 對應的資訊缺口ID
  unlocked: boolean;
  timestamp: Date;
}

// 資訊缺口定義
export interface InformationGap {
  id: string;
  label: string;
  description: string;
  status: 'locked' | 'unlocked' | 'filled';
  correctAnswer?: string;
  unlockedClues: string[]; // 已解鎖的線索ID
}

// 筆記本狀態
interface NotebookState {
  // 當前任務的資訊缺口
  informationGaps: Record<string, InformationGap>;
  
  // 收集到的線索
  collectedClues: Record<string, Clue>;
  
  // 筆記本是否打開
  isOpen: boolean;
  
  // 當前選中的線索（用於拖拉）
  selectedClueId: string | null;
  
  // 操作方法
  actions: {
    // 初始化任務的資訊缺口
    initializeGaps: (missionId: string) => void;
    
    // 新增線索
    addClue: (clue: Omit<Clue, 'id' | 'timestamp' | 'unlocked'>) => void;
    
    // 解鎖資訊缺口
    unlockGap: (gapId: string, clueId: string) => void;
    
    // 填充資訊缺口
    fillGap: (gapId: string, answer: string) => void;
    
    // 驗證答案
    validateAnswer: (gapId: string, answer: string) => boolean;
    
    // 筆記本控制
    toggleNotebook: () => void;
    setNotebookOpen: (open: boolean) => void;
    
    // 線索拖拉
    selectClue: (clueId: string) => void;
    clearSelection: () => void;
    
    // 重置筆記本（新任務時使用）
    resetNotebook: () => void;
  };
}

// 任務資訊缺口配置
const MISSION_GAPS: Record<string, InformationGap[]> = {
  'E2': [
    {
      id: 'gap_1',
      label: '抗爭核心訴求',
      description: '運動的主要目標和訴求內容',
      status: 'locked',
      correctAnswer: '設立臺灣議會',
      unlockedClues: []
    },
    {
      id: 'gap_2',
      label: '官方取締理由',
      description: '當局認定違法的具體法條和理由',
      status: 'locked',
      correctAnswer: '違反治安警察法',
      unlockedClues: []
    },
    {
      id: 'gap_3',
      label: '非武裝手段',
      description: '採用的合法抗爭方式和策略',
      status: 'locked',
      correctAnswer: '請願書遞交',
      unlockedClues: []
    }
  ],
  'default': [
    {
      id: 'gap_1',
      label: '事件背景',
      description: '歷史事件的背景脈絡',
      status: 'locked',
      unlockedClues: []
    },
    {
      id: 'gap_2',
      label: '關鍵人物',
      description: '重要的歷史人物',
      status: 'locked',
      unlockedClues: []
    },
    {
      id: 'gap_3',
      label: '影響結果',
      description: '事件的歷史意義',
      status: 'locked',
      unlockedClues: []
    }
  ]
};

export const useNotebookStore = create<NotebookState>()(
  devtools(
    persist(
      (set, get) => ({
        informationGaps: {},
        collectedClues: {},
        isOpen: false,
        selectedClueId: null,

        actions: {
          initializeGaps: (missionId: string) => {
            const gaps = MISSION_GAPS[missionId] || MISSION_GAPS['default'];
            const gapsRecord: Record<string, InformationGap> = {};
            
            gaps.forEach(gap => {
              gapsRecord[gap.id] = { ...gap };
            });

            set({ 
              informationGaps: gapsRecord,
              collectedClues: {},
              selectedClueId: null
            });
            
            console.log(`📚 [Notebook] Initialized ${gaps.length} information gaps for mission: ${missionId}`);
          },

          addClue: (clueData) => {
            const clue: Clue = {
              ...clueData,
              id: `clue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              timestamp: new Date(),
              unlocked: true
            };

            set((state) => ({
              collectedClues: {
                ...state.collectedClues,
                [clue.id]: clue
              }
            }));

            // 自動檢查是否解鎖相關資訊缺口
            if (clue.relatedGapId) {
              get().actions.unlockGap(clue.relatedGapId, clue.id);
            }

            console.log(`✨ [Notebook] Added new clue: ${clue.text} (source: ${clue.source})`);
            return clue.id;
          },

          unlockGap: (gapId: string, clueId: string) => {
            const { informationGaps } = get();
            const gap = informationGaps[gapId];
            
            if (!gap) {
              console.warn(`[Notebook] Gap not found: ${gapId}`);
              return;
            }

            if (gap.status === 'locked') {
              set((state) => ({
                informationGaps: {
                  ...state.informationGaps,
                  [gapId]: {
                    ...gap,
                    status: 'unlocked',
                    unlockedClues: [...gap.unlockedClues, clueId]
                  }
                }
              }));
              
              console.log(`🔓 [Notebook] Unlocked information gap: ${gap.label}`);
            } else {
              // 已解鎖，只添加線索
              set((state) => ({
                informationGaps: {
                  ...state.informationGaps,
                  [gapId]: {
                    ...gap,
                    unlockedClues: [...new Set([...gap.unlockedClues, clueId])]
                  }
                }
              }));
            }
          },

          fillGap: (gapId: string, answer: string) => {
            const { informationGaps } = get();
            const gap = informationGaps[gapId];
            
            if (!gap || gap.status === 'locked') {
              console.warn(`[Notebook] Cannot fill gap: ${gapId} (not unlocked)`);
              return;
            }

            set((state) => ({
              informationGaps: {
                ...state.informationGaps,
                [gapId]: {
                  ...gap,
                  status: 'filled',
                  correctAnswer: answer
                }
              }
            }));

            console.log(`✅ [Notebook] Filled gap: ${gap.label} with: ${answer}`);
          },

          validateAnswer: (gapId: string, answer: string) => {
            const { informationGaps } = get();
            const gap = informationGaps[gapId];
            
            if (!gap || !gap.correctAnswer) return false;
            
            // 簡單的文字匹配，可以擴展為更複雜的匹配邏輯
            const normalizedAnswer = answer.trim().toLowerCase();
            const normalizedCorrect = gap.correctAnswer.toLowerCase();
            
            return normalizedAnswer === normalizedCorrect || 
                   normalizedCorrect.includes(normalizedAnswer) ||
                   normalizedAnswer.includes(normalizedCorrect);
          },

          toggleNotebook: () => {
            set((state) => ({ isOpen: !state.isOpen }));
          },

          setNotebookOpen: (open: boolean) => {
            set({ isOpen: open });
          },

          selectClue: (clueId: string) => {
            set({ selectedClueId: clueId });
          },

          clearSelection: () => {
            set({ selectedClueId: null });
          },

          resetNotebook: () => {
            set({
              informationGaps: {},
              collectedClues: {},
              isOpen: false,
              selectedClueId: null
            });
          }
        }
      }),
      {
        name: "notebook-store",
        partialize: (state) => ({
          informationGaps: state.informationGaps,
          collectedClues: state.collectedClues,
        }),
      }
    ),
    { name: "NotebookStore" }
  )
);