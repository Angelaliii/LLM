import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { findAnswerByQuestion } from "../data/predefinedQA";
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

  // 操作方法
  actions: {
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
    retry: () => Promise<void>;

    // 清理
    clearMessages: () => void;
    reset: () => void;
  };
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始狀態
        currentSession: null,
        messages: [],
        isLoading: false,
        isStreaming: false,
        streamingContent: "",
        error: null,

        personaId: "qin-shi-huang",
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

              // 模擬串流回應
              await simulateStreamingResponse(content, {
                personaId,
                mode,
                rigorLevel,
                language,
                forcedResponse: predefined || undefined,
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
                      readabilityScore: 75, // placeholder readability score
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
          },

          setError: (error: string | null) => {
            set({ error, isLoading: false, isStreaming: false });
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
