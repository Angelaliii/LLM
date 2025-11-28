import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  ChatMode,
  ChatSession,
  Language,
  Message,
  RigorLevel,
} from "../types/chat";
import { streamChatViaBackend } from "../services/llmClient";
import { findAnswerByQuestion } from "../data/predefinedQA";

interface MultiChatState {
  // 多角色對話記錄 - 每個角色都有獨立的消息列表
  conversationsByPersona: Record<string, Message[]>;
  currentPersonaId: string;
  
  // 當前任務和階段
  missionId: string | null;
  missionStage: "S0" | "S1" | "S2" | "S3" | "S4" | "S5";
  selectedNpcId?: string | null;
  
  // 串流狀態
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;

  // 對話配置
  mode: ChatMode;
  rigorLevel: RigorLevel;
  language: Language;
  
  // 調查完成旗標
  investigationComplete: boolean;

  // 操作方法
  actions: {
    // 多角色對話管理
    switchToPersona: (personaId: string) => void;
    getCurrentMessages: () => Message[];
    sendMessage: (content: string) => Promise<void>;
    
    // 配置變更
    setMode: (mode: ChatMode) => void;
    setRigorLevel: (level: RigorLevel) => void;
    setLanguage: (language: Language) => void;
    
    // 任務流程
    selectMission: (missionId: string) => Promise<void>;
    selectNpc: (npcId: string) => void;
    goToStage: (stage: "S0" | "S1" | "S2" | "S3" | "S4" | "S5") => void;
    markInvestigationComplete: () => void;
    
    // 串流處理
    startStreaming: () => void;
    updateStreamingContent: (content: string) => void;
    completeStreaming: (finalMessage: Message) => void;
    
    // 錯誤處理
    setError: (error: string | null) => void;
    retry: () => Promise<void>;
    
    // 清理
    clearCurrentConversation: () => void;
    clearAllConversations: () => void;
    reset: () => void;
  };
}

export const useMultiChatStore = create<MultiChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始狀態
        conversationsByPersona: {},
        currentPersonaId: "",
        missionId: null,
        missionStage: "S0",
        selectedNpcId: null,
        isLoading: false,
        isStreaming: false,
        streamingContent: "",
        error: null,
        mode: "teaching",
        rigorLevel: "balanced",
        language: "zh-TW",
        investigationComplete: false,

        actions: {
          // 切換到指定角色的對話
          switchToPersona: (personaId: string) => {
            set((state) => {
              // 如果該角色沒有對話記錄，創建空陣列
              if (!state.conversationsByPersona[personaId]) {
                state.conversationsByPersona[personaId] = [];
              }
              
              return {
                currentPersonaId: personaId,
                selectedNpcId: personaId,
                // 清除串流狀態
                isStreaming: false,
                streamingContent: "",
                error: null,
              };
            });
          },

          // 獲取當前角色的對話記錄
          getCurrentMessages: () => {
            const state = get();
            return state.conversationsByPersona[state.currentPersonaId] || [];
          },

          // 發送訊息
          sendMessage: async (content: string) => {
            const state = get();
            const { currentPersonaId, mode, rigorLevel, language } = state;
            
            // 檢查預定義回答
            const predefinedAnswer = findAnswerByQuestion(content);
            if (predefinedAnswer) {
              const userMessage: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content,
                timestamp: new Date(),
              };

              const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: predefinedAnswer,
                timestamp: new Date(),
              };

              set((state) => ({
                conversationsByPersona: {
                  ...state.conversationsByPersona,
                  [currentPersonaId]: [
                    ...(state.conversationsByPersona[currentPersonaId] || []),
                    userMessage,
                    assistantMessage,
                  ],
                },
              }));
              return;
            }

            // 添加用戶消息
            const userMessage: Message = {
              id: crypto.randomUUID(),
              role: "user",
              content,
              timestamp: new Date(),
            };

            set((state) => ({
              conversationsByPersona: {
                ...state.conversationsByPersona,
                [currentPersonaId]: [
                  ...(state.conversationsByPersona[currentPersonaId] || []),
                  userMessage,
                ],
              },
              isLoading: true,
              error: null,
            }));

            try {
              // 獲取當前對話歷史
              const currentMessages = state.conversationsByPersona[currentPersonaId] || [];
              
              // 呼叫後端 API
              await streamChatViaBackend({
                message: content,
                personaId: currentPersonaId,
                mode,
                rigorLevel,
                language,
                conversationHistory: currentMessages.map((msg) => ({
                  role: msg.role,
                  content: msg.content,
                })),
                onStart: () => {
                  get().actions.startStreaming();
                },
                onContent: (chunk: string) => {
                  get().actions.updateStreamingContent(chunk);
                },
                onComplete: (finalContent: string) => {
                  const finalMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: finalContent,
                    timestamp: new Date(),
                  };
                  get().actions.completeStreaming(finalMessage);
                },
                onError: (error: string) => {
                  get().actions.setError(error);
                },
              });
            } catch (error) {
              get().actions.setError(error instanceof Error ? error.message : "發生未知錯誤");
            } finally {
              set({ isLoading: false });
            }
          },

          // 配置變更
          setMode: (mode) => set({ mode }),
          setRigorLevel: (rigorLevel) => set({ rigorLevel }),
          setLanguage: (language) => set({ language }),

          // 任務流程
          selectMission: async (missionId: string) => {
            set({ missionId, missionStage: "S1" });
          },

          selectNpc: (npcId: string) => {
            get().actions.switchToPersona(npcId);
          },

          goToStage: (stage) => set({ missionStage: stage }),

          markInvestigationComplete: () => set({ investigationComplete: true }),

          // 串流處理
          startStreaming: () => set({ isStreaming: true, streamingContent: "" }),

          updateStreamingContent: (content: string) => set({ streamingContent: content }),

          completeStreaming: (finalMessage: Message) => {
            set((state) => ({
              conversationsByPersona: {
                ...state.conversationsByPersona,
                [state.currentPersonaId]: [
                  ...(state.conversationsByPersona[state.currentPersonaId] || []),
                  finalMessage,
                ],
              },
              isStreaming: false,
              streamingContent: "",
            }));
          },

          // 錯誤處理
          setError: (error: string | null) => set({ error, isLoading: false }),

          retry: async () => {
            const state = get();
            const messages = state.conversationsByPersona[state.currentPersonaId] || [];
            const lastUserMessage = messages.filter((m) => m.role === "user").pop();
            
            if (lastUserMessage) {
              // 移除上次失敗的回應（如果有的話）
              const filteredMessages = messages.filter(
                (m) => !(m.role === "assistant" && m.timestamp > lastUserMessage.timestamp)
              );
              
              set((state) => ({
                conversationsByPersona: {
                  ...state.conversationsByPersona,
                  [state.currentPersonaId]: filteredMessages,
                },
                error: null,
              }));

              // 重新發送最後一條用戶消息
              await get().actions.sendMessage(lastUserMessage.content);
            }
          },

          // 清理
          clearCurrentConversation: () => {
            set((state) => ({
              conversationsByPersona: {
                ...state.conversationsByPersona,
                [state.currentPersonaId]: [],
              },
              error: null,
              streamingContent: "",
              isStreaming: false,
            }));
          },

          clearAllConversations: () => {
            // 清除所有 game sessions
            const { clearAllGameSessions } = require("../services/llmClient");
            clearAllGameSessions();
            
            set({
              conversationsByPersona: {},
              error: null,
              streamingContent: "",
              isStreaming: false,
            });
          },

          reset: () => {
            // 清除所有 game sessions
            const { clearAllGameSessions } = require("../services/llmClient");
            clearAllGameSessions();
            
            set({
              conversationsByPersona: {},
              currentPersonaId: "",
              missionId: null,
              missionStage: "S0",
              selectedNpcId: null,
              isLoading: false,
              isStreaming: false,
              streamingContent: "",
              error: null,
              mode: "teaching",
              rigorLevel: "balanced",
              language: "zh-TW",
              investigationComplete: false,
            });
          },
        },
      }),
      {
        name: "multi-chat-store",
        partialize: (state) => ({
          conversationsByPersona: state.conversationsByPersona,
          currentPersonaId: state.currentPersonaId,
          missionId: state.missionId,
          missionStage: state.missionStage,
          mode: state.mode,
          rigorLevel: state.rigorLevel,
          language: state.language,
        }),
      }
    ),
    { name: "MultiChatStore" }
  )
);