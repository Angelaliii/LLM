import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  ChatMode,
  ChatSession,
  Language,
  Message,
  RigorLevel,
  ConversationMemory,
  ConversationSummary,
  KeyPoint,
} from "../types/chat";
import { streamChatViaBackend } from "../services/llmClient";
import { findAnswerByQuestion } from "../data/predefinedQA";

interface MultiChatState {
  // 多角色對話記錄 - 改用完整的記憶結構
  conversationsByPersona: Record<string, ConversationMemory>;
  currentPersonaId: string;
  
  // 當前任務和階段
  missionId: string | null;
  missionStage: "S0" | "S1" | "S3" | "S4" | "S5";
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
    getCurrentMemory: () => ConversationMemory;
    sendMessage: (content: string) => Promise<void>;
    summarizeConversation: () => Promise<void>;
    
    // 配置變更
    setMode: (mode: ChatMode) => void;
    setRigorLevel: (level: RigorLevel) => void;
    setLanguage: (language: Language) => void;
    
    // 任務流程
    selectMission: (missionId: string) => Promise<void>;
    selectNpc: (npcId: string) => void;
    goToStage: (stage: "S0" | "S1" | "S3" | "S4" | "S5") => void;
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
              // 如果該角色沒有對話記錄，創建空記憶結構
              if (!state.conversationsByPersona[personaId]) {
                state.conversationsByPersona[personaId] = {
                  messages: [],
                  summaries: [],
                  keyPoints: [],
                  relationshipMemo: "",
                  totalMessageCount: 0,
                };
              } else {
                // 驗證現有記憶結構的完整性
                const memory = state.conversationsByPersona[personaId];
                if (!Array.isArray(memory.messages)) {
                  console.warn('⚠️ 偵測到損壞的記憶結構，正在重置...');
                  state.conversationsByPersona[personaId] = {
                    messages: [],
                    summaries: Array.isArray(memory.summaries) ? memory.summaries : [],
                    keyPoints: Array.isArray(memory.keyPoints) ? memory.keyPoints : [],
                    relationshipMemo: memory.relationshipMemo || "",
                    totalMessageCount: 0,
                  };
                }
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
            const memory = state.conversationsByPersona[state.currentPersonaId];
            return memory?.messages || [];
          },

          // 獲取當前角色的完整記憶
          getCurrentMemory: () => {
            const state = get();
            return state.conversationsByPersona[state.currentPersonaId] || {
              messages: [],
              summaries: [],
              keyPoints: [],
              relationshipMemo: "",
              totalMessageCount: 0,
            };
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

              set((state) => {
                const memory = state.conversationsByPersona[currentPersonaId] || {
                  messages: [],
                  summaries: [],
                  keyPoints: [],
                  relationshipMemo: "",
                  totalMessageCount: 0,
                };

                // 確保 messages 是陣列
                const existingMessages = Array.isArray(memory.messages) ? memory.messages : [];

                return {
                  conversationsByPersona: {
                    ...state.conversationsByPersona,
                    [currentPersonaId]: {
                      ...memory,
                      messages: [...existingMessages, userMessage, assistantMessage],
                      totalMessageCount: (memory.totalMessageCount || 0) + 2,
                    },
                  },
                };
              });
              return;
            }

            // 添加用戶消息
            const userMessage: Message = {
              id: crypto.randomUUID(),
              role: "user",
              content,
              timestamp: new Date(),
            };

            set((state) => {
              const memory = state.conversationsByPersona[currentPersonaId] || {
                messages: [],
                summaries: [],
                keyPoints: [],
                relationshipMemo: "",
                totalMessageCount: 0,
              };

              // 確保 messages 是陣列
              const existingMessages = Array.isArray(memory.messages) ? memory.messages : [];

              return {
                conversationsByPersona: {
                  ...state.conversationsByPersona,
                  [currentPersonaId]: {
                    ...memory,
                    messages: [...existingMessages, userMessage],
                    totalMessageCount: (memory.totalMessageCount || 0) + 1,
                  },
                },
                isLoading: true,
                error: null,
              };
            });

            try {
              // 獲取當前記憶
              const currentMemory = get().actions.getCurrentMemory();
              
              // 📌 只傳最近 5 則訊息給 LLM (避免重複內容)
              // 前端保留完整記錄，但後端只需要最近的上下文
              const recentMessages = currentMemory.messages.slice(-5);
              
              // 呼叫後端 API
              await streamChatViaBackend({
                message: content,
                personaId: currentPersonaId,
                mode,
                rigorLevel,
                language,
                conversationHistory: recentMessages.map((msg) => ({
                  role: msg.role,
                  content: msg.content,
                })),
                summaries: currentMemory.summaries,
                keyPoints: currentMemory.keyPoints,
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
                  
                  // 檢查是否需要濃縮（每5條對話）
                  const updatedMemory = get().actions.getCurrentMemory();
                  if (updatedMemory.messages.length >= 5 && updatedMemory.messages.length % 5 === 0) {
                    console.log('📝 觸發對話濃縮...');
                    get().actions.summarizeConversation();
                  }
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

          // 濃縮對話（每5條觸發）
          summarizeConversation: async () => {
            const state = get();
            const { currentPersonaId } = state;
            const memory = state.conversationsByPersona[currentPersonaId];
            
            if (!memory || memory.messages.length < 5) {
              return;
            }

            try {
              console.log(`🔄 開始濃縮對話... (共 ${memory.messages.length} 條)`);
              
              // 取得最近5條對話
              const recentMessages = memory.messages.slice(-5);
              
              // 呼叫後端API進行濃縮
              const response = await fetch('/api/game/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  messages: recentMessages,
                  personaId: currentPersonaId,
                  existingSummaries: memory.summaries,
                  existingKeyPoints: memory.keyPoints,
                }),
              });

              if (!response.ok) {
                throw new Error('濃縮失敗');
              }

              const data = await response.json();
              const summary: ConversationSummary = data.summary;
              const newKeyPoints: KeyPoint[] = data.newKeyPoints || [];

              console.log('✅ 濃縮完成:', summary);
              console.log('🔑 新發現線索:', newKeyPoints.map(kp => kp.title).join(', '));

              // 更新記憶：保留最近3條完整對話 + 新摘要
              set((state) => {
                const memory = state.conversationsByPersona[currentPersonaId] || {
                  messages: [],
                  summaries: [],
                  keyPoints: [],
                  relationshipMemo: "",
                  totalMessageCount: 0,
                };
                const allKeyPoints = Array.isArray(memory.keyPoints) ? [...memory.keyPoints] : [];
                
                // 去重新增關鍵線索
                newKeyPoints.forEach(newKp => {
                  if (!allKeyPoints.some(kp => kp.title === newKp.title)) {
                    allKeyPoints.push(newKp);
                  }
                });

                const newMemory = {
                  ...memory,
                  messages: Array.isArray(memory.messages) ? memory.messages.slice(-3) : [], // 只保留最近3條
                  summaries: [...(memory.summaries || []), summary],
                  keyPoints: allKeyPoints,
                };

                // 日誌（在更新內部輸出最新計數）
                console.log(`📦 記憶已更新：保留 3 條對話 + ${(newMemory.summaries.length || 0)} 個摘要 + ${allKeyPoints.length} 個關鍵線索`);

                return {
                  conversationsByPersona: {
                    ...state.conversationsByPersona,
                    [currentPersonaId]: newMemory,
                  },
                };
              });
            } catch (error) {
              console.error('❌ 濃縮對話失敗:', error);
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
            set((state) => {
              const memory = state.conversationsByPersona[state.currentPersonaId] || {
                messages: [],
                summaries: [],
                keyPoints: [],
                relationshipMemo: "",
                totalMessageCount: 0,
              };

              // 確保 messages 是陣列
              const existingMessages = Array.isArray(memory.messages) ? memory.messages : [];

              return {
                conversationsByPersona: {
                  ...state.conversationsByPersona,
                  [state.currentPersonaId]: {
                    ...memory,
                    messages: [...existingMessages, finalMessage],
                    totalMessageCount: (memory.totalMessageCount || 0) + 1,
                  },
                },
                isStreaming: false,
                streamingContent: "",
              };
            });
          },

          // 錯誤處理
          setError: (error: string | null) => set({ error, isLoading: false }),

          retry: async () => {
            const state = get();
            const memory = state.conversationsByPersona[state.currentPersonaId];
            if (!memory) return;
            
            const messages = memory.messages;
            const lastUserMessage = messages.filter((m) => m.role === "user").pop();
            
            if (lastUserMessage) {
              // 移除上次失敗的回應（如果有的話）
              const filteredMessages = messages.filter(
                (m) => !(m.role === "assistant" && m.timestamp > lastUserMessage.timestamp)
              );
              
              set((state) => ({
                conversationsByPersona: {
                  ...state.conversationsByPersona,
                  [state.currentPersonaId]: {
                    ...memory,
                    messages: filteredMessages,
                  },
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
                [state.currentPersonaId]: {
                  messages: [],
                  summaries: [],
                  keyPoints: [],
                  relationshipMemo: "",
                  totalMessageCount: 0,
                },
              },
              error: null,
              streamingContent: "",
              isStreaming: false,
            }));
          },

          clearAllConversations: () => {
            // 清除所有 game sessions
            import("../services/llmClient").then((mod) => {
              if (mod && typeof mod.clearAllGameSessions === "function") {
                try { mod.clearAllGameSessions(); } catch (e) { console.warn('clearAllGameSessions failed', e); }
              }
            }).catch(() => {});

            set({
              conversationsByPersona: {},
              error: null,
              streamingContent: "",
              isStreaming: false,
            });
          },

          reset: () => {
            // 清除所有 game sessions（非同步載入 mod）
            import("../services/llmClient").then((mod) => {
              if (mod && typeof mod.clearAllGameSessions === "function") {
                try { mod.clearAllGameSessions(); } catch (e) { console.warn('clearAllGameSessions failed', e); }
              }
            }).catch(() => {});

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