import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { findAnswerByQuestion } from "../data/predefinedQA";
import { streamChatViaBackend } from "../services/llmClient";
import { e2Chunks } from "../data/missions/e2-industrial-agri";
import type {
  ChatMode,
  ChatSession,
  Language,
  Message,
  RigorLevel,
} from "../types/chat";

interface ChatState {
  // 當前對話狀態
  currentSession: ChatSession | null;
  
  // 多角色對話記錄 - 每個角色都有獨立的消息列表
  conversationsByPersona: Record<string, Message[]>;
  currentPersonaId: string;
  
  // 當前對話消息列表
  messages: Message[];
  
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;

  // 對話配置
  personaId: string;
  // 各 persona 的在線狀態
  personaStatus: Record<string, "online" | "offline">;
  mode: ChatMode;
  rigorLevel: RigorLevel;
  language: Language;

  // 歷史會話
  sessions: ChatSession[];

  // 調查完成旗標（由前端 UI 控制，用於觸發摘要/測驗步驟）
  investigationComplete: boolean;

  // 任務流程狀態（S0..S5）
  missionId: string | null;
  missionStage: "S0" | "S1" | "S2" | "S3" | "S4" | "S5";
  selectedNpcId?: string | null;
  hiddenSummary?: string | null;


  // 操作方法
  actions: {
    // 多角色對話管理
    switchToPersona: (personaId: string) => void;
    getCurrentMessages: () => Message[];
    
    // 發送訊息
    sendMessage: (content: string) => Promise<void>;

    // 配置變更
    setPersona: (personaId: string) => void;
    setPersonaStatus: (personaId: string, status: "online" | "offline") => void;
    setMode: (mode: ChatMode) => void;
    setRigorLevel: (level: RigorLevel) => void;
    setLanguage: (language: Language) => void;

    // 會話管理
    startNewSession: () => void;
    loadSession: (sessionId: string) => void;
    deleteSession: (sessionId: string) => void;

    // 串流處理
    startStreaming: () => void;
    updateStreamingContent: (content: string) => void;
    completeStreaming: (finalMessage: Message) => void;

    // 錯誤處理
    setError: (error: string | null) => void;
    // 使用者標示調查完成（由 UI 呼叫）
    markInvestigationComplete: () => void;
    retry: () => Promise<void>;

    // 清理
    clearMessages: () => void;
    reset: () => void;
    // 任務流程相關 actions
    selectMission: (missionId: string) => Promise<void>;
    goToStage: (stage: "S0" | "S1" | "S2" | "S3" | "S4" | "S5") => void;
    selectNpc: (npcId: string) => void;
    updateConversation: (npcId: string, messages: Message[]) => void;
    setHiddenSummary: (summary: string) => void;
    // Quiz actions
    startQuiz: () => void;
    answerQuiz: (questionId: string, answerKey: string) => void;
    finishQuiz: () => void;
  };
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始狀態
        currentSession: null,
        conversationsByPersona: {},
        currentPersonaId: "default-emperor",
        messages: [],
        isLoading: false,
        isStreaming: false,
        streamingContent: "",
        error: null,

        personaId: "default-emperor",
        mode: "teaching",
        rigorLevel: "balanced",
        language: "zh-TW",
        // 預設人物在線狀態
        personaStatus: {
          "qin-shi-huang": "online",
          socrates: "offline",
          "su-shi": "offline",
        },

        sessions: [],
        investigationComplete: false,
        missionId: null,
        missionStage: "S0",
        selectedNpcId: null,
        hiddenSummary: null,

        actions: {
          sendMessage: async (content: string) => {
            const { personaId, mode, rigorLevel, language, messages } = get();

            try {
              set({ isLoading: true, error: null });

              // 創建使用者訊息
              const userMessage: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content,
                timestamp: new Date(),
              };

              // 更新訊息列表
              const newMessages = [...messages, userMessage];
              set({ messages: newMessages });

              // 開始串流
              get().actions.startStreaming();

              // 使用模擬串流回應（實際情況可替換為真實 LLM 呼叫）
              // 如果問題與預定義問答匹配，優先使用預設答案（保持打字串流效果）
              const predefined = findAnswerByQuestion(content);

              if (predefined) {
                // 使用模擬串流效果顯示預設回覆
                await simulateStreamingResponse(content, {
                  personaId,
                  mode,
                  rigorLevel,
                  language,
                  forcedResponse: predefined,
                  onChunk: (chunk) => {
                    get().actions.updateStreamingContent(chunk);
                  },
                  onComplete: (response) => {
                    const assistantMessage: Message = {
                      id: crypto.randomUUID(),
                      role: "assistant",
                      content: response,
                      timestamp: new Date(),
                      metadata: {
                        mode,
                        readabilityScore: 75,
                      },
                    };
                    get().actions.completeStreaming(assistantMessage);
                  },
                  onError: (error) => {
                    set({
                      error: error.message,
                      isLoading: false,
                      isStreaming: false,
                    });
                  },
                });
              } else {
                // 使用後端 API 呼叫 Ollama（非預設答案）
                try {
                  // 呼叫前端 wrapper，wrapper 會 POST 到 /api/ollama/chat
                  await streamChatViaBackend(content, {
                    missionId: get().missionId ?? undefined,
                    npcId: get().selectedNpcId ?? undefined,
                    handlers: {
                      onChunk: (chunk) => {
                        get().actions.updateStreamingContent(chunk);
                      },
                      onComplete: (assistantText) => {
                        const assistantMessage: Message = {
                          id: crypto.randomUUID(),
                          role: "assistant",
                          content: assistantText,
                          timestamp: new Date(),
                          metadata: { mode, readabilityScore: 75 },
                        };
                        get().actions.completeStreaming(assistantMessage);
                      },
                      onError: (err) => {
                        set({
                          error: err.message,
                          isLoading: false,
                          isStreaming: false,
                        });
                      },
                    },
                  });
                } catch (error) {
                  set({
                    error: error instanceof Error ? error.message : String(error),
                    isLoading: false,
                    isStreaming: false,
                  });
                }
              }
            } catch (error) {
              set({
                error: error instanceof Error ? error.message : "發生未知錯誤",
                isLoading: false,
                isStreaming: false,
              });
            }
          },

          setPersona: (personaId: string) => {
            set({ personaId });
            get().actions.startNewSession();
          },

          selectMission: async (missionId: string) => {
            // set mission only, let useMissionStore handle stage transitions
            set({ missionId, selectedNpcId: null });

            // initialize a fresh session
            get().actions.startNewSession();

            // Request backend to generate a mission intro (S1 behaviour per spec)
            try {
              const userPrompt = `請為任務 ${missionId} 產生一段 150-200 字的任務開場故事，並在最後列出 1 到 2 個引導式問題（每個問題一句話）。`;

              await new Promise<void>((resolve, reject) => {
                streamChatViaBackend(userPrompt, {
                  missionId,
                  handlers: {
                    onChunk: () => {},
                    onComplete: (assistantText) => {
                      const introMessage: Message = {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: assistantText,
                        timestamp: new Date(),
                        metadata: { mode: "teaching" },
                      };

                      set((state) => ({
                        messages: [introMessage],
                        currentSession: state.currentSession
                          ? { ...state.currentSession, messages: [introMessage], updatedAt: new Date() }
                          : state.currentSession,
                      }));

                      resolve();
                    },
                    onError: (err) => reject(err),
                  },
                });
              });
            } catch (err) {
              // fallback to local chunk if backend fails
              const chunk = e2Chunks.find((c) => c.missionId === missionId && c.type === "core_fact") || e2Chunks[0];
              const introText = chunk?.text || "歡迎進入任務。";
              const introMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: introText,
                timestamp: new Date(),
                metadata: { mode: "teaching" },
              };

              set({ messages: [introMessage] });
            }
          },

          goToStage: (missionStage: "S0" | "S1" | "S2" | "S3" | "S4" | "S5") => {
            // Only update chatStore internal stage, let useMissionStore handle main stage
            set({ missionStage });
          },

          selectNpc: (npcId: string) => {
            // select the NPC identity for conversation context
            set({ selectedNpcId: npcId, personaId: npcId });
          },

          updateConversation: (npcId: string, messages: Message[]) => {
            set((state) => ({
              conversationsByPersona: {
                ...state.conversationsByPersona,
                [npcId]: messages,
              },
            }));
          },

          setHiddenSummary: (summary: string) => {
            set({ hiddenSummary: summary });
          },

          startQuiz: () => {
            set({ missionStage: "S5" });
          },

          answerQuiz: (_questionId: string, _answerKey: string) => {
            // placeholder: quiz scoring handled in finishQuiz for now
          },

          finishQuiz: () => {
            // After finishing quiz, reset to S0 or keep at S5; here we'll go back to S0
            set({ missionStage: "S0", missionId: null, selectedNpcId: null });
          },

          setPersonaStatus: (
            personaId: string,
            status: "online" | "offline"
          ) => {
            set((state) => ({
              personaStatus: { ...state.personaStatus, [personaId]: status },
            }));
          },

          setMode: (mode: ChatMode) => {
            set({ mode });
          },

          setRigorLevel: (rigorLevel: RigorLevel) => {
            set({ rigorLevel });
          },

          setLanguage: (language: Language) => {
            set({ language });
          },

          startNewSession: () => {
            const { personaId, mode, rigorLevel, language } = get();
            const newSession: ChatSession = {
              id: crypto.randomUUID(),
              personaId,
              messages: [],
              mode,
              rigorLevel,
              language,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            set({
              currentSession: newSession,
              messages: [],
              error: null,
              isStreaming: false,
              streamingContent: "",
              investigationComplete: false,
            });
          },

          loadSession: (sessionId: string) => {
            const { sessions } = get();
            const session = sessions.find((s) => s.id === sessionId);
            if (session) {
              set({
                currentSession: session,
                messages: session.messages,
                personaId: session.personaId,
                mode: session.mode,
                rigorLevel: session.rigorLevel,
                language: session.language,
              });
            }
          },

          deleteSession: (sessionId: string) => {
            const { sessions, currentSession } = get();
            const newSessions = sessions.filter((s) => s.id !== sessionId);
            set({ sessions: newSessions });

            if (currentSession?.id === sessionId) {
              get().actions.startNewSession();
            }
          },

          startStreaming: () => {
            set({ isStreaming: true, streamingContent: "", isLoading: true });
          },

          updateStreamingContent: (content: string) => {
            set((state) => ({
              streamingContent: state.streamingContent + content,
            }));
          },

          completeStreaming: (finalMessage: Message) => {
            set((state) => ({
              messages: [...state.messages, finalMessage],
              isStreaming: false,
              streamingContent: "",
              isLoading: false,
              currentSession: state.currentSession
                ? {
                    ...state.currentSession,
                    messages: [...state.messages, finalMessage],
                    updatedAt: new Date(),
                  }
                : null,
            }));

            // 非同步觸發進度評估（S3-EVAL），每 2-3 輪或達到條件時呼叫後端 /api/eval
            (async () => {
              try {
                const state = get();
                const msgs = state.messages;

                const userCount = msgs.filter((m) => m.role === 'user').length;
                const conversationTurns = userCount; // 以使用者送出次數作為 turn 計數

                // 只有在有 missionId 時才做 S3-EVAL
                if (!state.missionId) return;

                // 每 3 個使用者回合評估一次，或當使用者回合 >= 6 時強制評估
                if ((conversationTurns >= 3 && conversationTurns % 3 === 0) || conversationTurns >= 6) {
                  const conversationSummary = msgs.slice(-12).map((m) => `${m.role}: ${m.content}`).join('\n');

                  const res = await fetch('/api/eval', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ missionId: state.missionId, conversationSummary }),
                  });

                  if (!res.ok) return;
                  const data = await res.json();
                  const evalResult = data?.eval;

                  const masteredCount = evalResult?.overall?.masteredCount ?? 0;
                  const confidence = evalResult?.overall?.confidence ?? 0;

                  const readyToSummarize = conversationTurns >= 6 && masteredCount >= 3 && confidence >= 0.7;

                  if (readyToSummarize) {
                    // 產生任務完整整理（S4）並切換階段
                    try {
                      const summaryPrompt = `請根據任務 ${state.missionId} 的核心知識、學習目標，以及以下對話摘要，產出一篇 300 至 500 字、適合國中生閱讀的任務總結，並提供要點列點：\n\n對話摘要：\n${conversationSummary}`;

                      await new Promise<void>((resolve, reject) => {
                        streamChatViaBackend(summaryPrompt, {
                          missionId: state.missionId ?? undefined,
                          handlers: {
                            onComplete: (summaryText) => {
                              set({ hiddenSummary: summaryText, missionStage: 'S4' });
                              resolve();
                            },
                            onError: (err) => reject(err),
                          },
                        });
                      });
                    } catch (e) {
                      // 失敗則仍切換階段，但不一定有 summary
                      set({ missionStage: 'S4' });
                    }
                  }
                }
              } catch (e) {
                // 忽略評估錯誤，不中斷聊天
                console.error('S3-EVAL error', e);
              }
            })();
          },

          setError: (error: string | null) => {
            set({ error, isLoading: false, isStreaming: false });
          },

          // 標示使用者認為調查已經差不多了，前端可在此做後續流程切換
          markInvestigationComplete: () => {
            set({ investigationComplete: true, missionStage: "S4" });
          },

          retry: async () => {
            const { messages } = get();
            const lastUserMessage = [...messages]
              .reverse()
              .find((m) => m.role === "user");
            if (lastUserMessage) {
              // 移除最後的助手回應（如果有的話）
              const filteredMessages = messages.filter(
                (m) => m.timestamp <= lastUserMessage.timestamp
              );
              set({ messages: filteredMessages });

              // 重新發送
              await get().actions.sendMessage(lastUserMessage.content);
            }
          },

          clearMessages: () => {
            set({ messages: [], error: null, streamingContent: "" });
          },

          reset: () => {
            set({
              currentSession: null,
              messages: [],
              isLoading: false,
              isStreaming: false,
              streamingContent: "",
              error: null,
              sessions: [],
            });
          },
        },
      }),
      {
        name: "chat-store",
        partialize: (state) => ({
          sessions: state.sessions,
          personaId: state.personaId,
          personaStatus: state.personaStatus,
          mode: state.mode,
          rigorLevel: state.rigorLevel,
          language: state.language,
        }),
      }
    ),
    { name: "ChatStore" }
  )
);

// 模擬串流回應的函數
async function simulateStreamingResponse(
  _input: string, // 使用者原始輸入
  options: {
    personaId: string;
    mode: ChatMode;
    rigorLevel: RigorLevel;
    language: Language;
    onChunk: (chunk: string) => void;
    onComplete: (response: string) => void;
    onError: (error: Error) => void;
    // 若提供，強制使用此回覆文字並串流其內容（用於預置問答）
    forcedResponse?: string;
  }
) {
  try {
    // 根據使用者輸入選擇更貼切的回應首段，避免每次都出現固定模板開頭
    const generateResponseForInput = (input: string, mode: ChatMode) => {
      const q = (input || "").toLowerCase();

      const quick =
        "朕推行郡縣制是為了加強中央集權，避免分封制造成的諸侯割據。郡守縣令由朝廷任免，直接對中央負責，這樣可以有效控制全國。此制度影響深遠，成為後世中央集權的基礎。";

      const socratic =
        "你提到郡縣制，那麼請思考：如果繼續沿用分封制，會對新統一的帝國帶來什麼風險？再者，郡縣制中官員由中央任免，這與分封制中的世襲制有何根本差異？最後，你認為這種制度變革對於普通百姓的生活會產生什麼影響？";

      const teachingFull =
        "郡縣制是朕為了加強中央集權而推行的重要制度，目的是減少地方割據與世襲勢力的影響，並由朝廷直接任命地方官員以穩定統治。郡守與縣令由中央任免，配合嚴密的監察體制，確保地方官員效忠朝廷。此制度為後世中央集權的基礎，但也有人指出過度集權可能抑制地方活力。";

      // 先依模式決定基本風格
      if (mode === "quick") return quick;
      if (mode === "socratic") return socratic;

      // 教學模式：嘗試根據關鍵字返回更直接的回覆
      if (
        q.includes("統一") ||
        q.includes("何時") ||
        q.includes("何時統一") ||
        q.includes("六國")
      ) {
        return quick;
      }

      if (q.includes("焚書") || q.includes("坑儒") || q.includes("焚書坑儒")) {
        return "焚書坑儒是朕為了鞏固統一與思想一致性所採取的極端政策，重點在於消除分裂勢力與統一史官與典籍的標準。但此舉對學術與思想自由造成嚴重傷害，後世學者多有批評。";
      }

      if (q.includes("長城") || q.includes("長城是") || q.includes("修長城")) {
        return "長城的現代形象是多個時期防禦工程的總稱，雖然朕下令修繕和連接各地防線，但現有的長城多由後代擴建。朕的工程以鞏固邊防與監控交通為主。";
      }

      // 預設回覆（較精簡的教學版本）
      return teachingFull;
    };

    // 若有強制回覆，直接使用（保留逐字串流特效）
    const response =
      options.forcedResponse || generateResponseForInput(_input, options.mode);
    const chunks = response.split("");

    // 模擬打字效果
    for (const ch of chunks) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      options.onChunk(ch);
    }

    options.onComplete(response);
  } catch (error) {
    options.onError(error instanceof Error ? error : new Error("未知錯誤"));
  }
}
