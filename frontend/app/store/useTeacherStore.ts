import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { PersonaConfig } from "../types/persona";

interface TeacherState {
  // 教師面板狀態
  isTeacherMode: boolean;
  selectedStudentSession: string | null;

  // 分析數據
  sessionAnalytics: {
    totalSessions: number;
    averageSessionLength: number;
    mostAskedTopics: string[];
    readabilityTrends: number[];
    safetyIncidents: number;
  };

  // 人物配置管理
  personas: PersonaConfig[];
  activePersonaId: string;

  // 課堂控制
  classroomSettings: {
    allowStudentPersonaSwitch: boolean;
    moderationLevel: "low" | "medium" | "high";
    maxResponseLength: number;
    enableSourceCitations: boolean;
    recordSessions: boolean;
  };

  // 安全與監控
  flaggedContent: Array<{
    id: string;
    sessionId: string;
    content: string;
    flagReason: string;
    timestamp: Date;
    resolved: boolean;
  }>;

  actions: {
    // 模式切換
    toggleTeacherMode: () => void;
    setSelectedStudentSession: (sessionId: string | null) => void;

    // 人物管理
    addPersona: (persona: PersonaConfig) => void;
    updatePersona: (id: string, updates: Partial<PersonaConfig>) => void;
    removePersona: (id: string) => void;
    setActivePersona: (id: string) => void;

    // 課堂控制
    updateClassroomSettings: (
      settings: Partial<TeacherState["classroomSettings"]>
    ) => void;

    // 監控與分析
    addFlaggedContent: (
      content: Omit<TeacherState["flaggedContent"][0], "id" | "timestamp">
    ) => void;
    resolveFlaggedContent: (id: string) => void;
    updateAnalytics: (
      analytics: Partial<TeacherState["sessionAnalytics"]>
    ) => void;

    // 數據匯出
    exportSessionData: (sessionIds: string[]) => Promise<Blob>;
    exportAnalyticsReport: () => Promise<Blob>;
  };
}

export const useTeacherStore = create<TeacherState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始狀態
        isTeacherMode: false,
        selectedStudentSession: null,

        sessionAnalytics: {
          totalSessions: 0,
          averageSessionLength: 0,
          mostAskedTopics: [],
          readabilityTrends: [],
          safetyIncidents: 0,
        },

        personas: [
          // 預設秦始皇配置會在 persona.qinShihuang.ts 中定義
        ],
        activePersonaId: "qin-shi-huang",

        classroomSettings: {
          allowStudentPersonaSwitch: true,
          moderationLevel: "medium",
          maxResponseLength: 600,
          enableSourceCitations: true,
          recordSessions: true,
        },

        flaggedContent: [],

        actions: {
          toggleTeacherMode: () => {
            set((state) => ({ isTeacherMode: !state.isTeacherMode }));
          },

          setSelectedStudentSession: (sessionId) => {
            set({ selectedStudentSession: sessionId });
          },

          addPersona: (persona) => {
            set((state) => ({
              personas: [...state.personas, persona],
            }));
          },

          updatePersona: (id, updates) => {
            set((state) => ({
              personas: state.personas.map((p) =>
                p.id === id ? { ...p, ...updates } : p
              ),
            }));
          },

          removePersona: (id) => {
            set((state) => ({
              personas: state.personas.filter((p) => p.id !== id),
              activePersonaId:
                state.activePersonaId === id
                  ? state.personas[0]?.id || "qin-shi-huang"
                  : state.activePersonaId,
            }));
          },

          setActivePersona: (id) => {
            set({ activePersonaId: id });
          },

          updateClassroomSettings: (settings) => {
            set((state) => ({
              classroomSettings: { ...state.classroomSettings, ...settings },
            }));
          },

          addFlaggedContent: (content) => {
            const flaggedItem = {
              ...content,
              id: crypto.randomUUID(),
              timestamp: new Date(),
            };

            set((state) => ({
              flaggedContent: [...state.flaggedContent, flaggedItem],
            }));
          },

          resolveFlaggedContent: (id) => {
            set((state) => ({
              flaggedContent: state.flaggedContent.map((item) =>
                item.id === id ? { ...item, resolved: true } : item
              ),
            }));
          },

          updateAnalytics: (analytics) => {
            set((state) => ({
              sessionAnalytics: { ...state.sessionAnalytics, ...analytics },
            }));
          },

          exportSessionData: async (sessionIds) => {
            // TODO: 實際的數據匯出邏輯
            const data = JSON.stringify({ sessionIds, exportedAt: new Date() });
            return new Blob([data], { type: "application/json" });
          },

          exportAnalyticsReport: async () => {
            const { sessionAnalytics, flaggedContent } = get();
            const report = {
              analytics: sessionAnalytics,
              flaggedContent: flaggedContent.filter((item) => !item.resolved),
              generatedAt: new Date(),
            };

            return new Blob([JSON.stringify(report, null, 2)], {
              type: "application/json",
            });
          },
        },
      }),
      {
        name: "teacher-store",
        partialize: (state) => ({
          personas: state.personas,
          activePersonaId: state.activePersonaId,
          classroomSettings: state.classroomSettings,
        }),
      }
    ),
    { name: "TeacherStore" }
  )
);
