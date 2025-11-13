import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
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

              // TODO: 實際呼叫 LLM API
              // 模擬串流回應
              await simulateStreamingResponse(content, {
                personaId,
                mode,
                rigorLevel,
                language,
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
                      readabilityScore: 75, // TODO: 實際計算
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
  _input: string, // 暫時未使用，預留給未來的內容分析
  options: {
    personaId: string;
    mode: ChatMode;
    rigorLevel: RigorLevel;
    language: Language;
    onChunk: (chunk: string) => void;
    onComplete: (response: string) => void;
    onError: (error: Error) => void;
  }
) {
  try {
    // 模擬回應內容
    const responses = {
      teaching: `朕統一六國後，深知分封制之弊端。戰國時期，諸侯割據，各自為政，導致戰亂不斷。朕推行郡縣制，乃是以中央直接派遣官員治理各地，而非依賴世襲貴族。此制度確保了中央政府的有效控制，避免了地方勢力的再次崛起。

郡縣制的核心在於「郡守」與「縣令」皆由朝廷任免，而非世襲。這樣的安排使得地方官員必須對中央負責，而非對當地豪族效忠。此外，朕還建立了嚴密的監察體系，確保各級官員忠於職守。

史學界對此制度評價頗高，認為它為後世中國的中央集權制奠定了基礎。然而，也有學者指出，過度的中央集權可能導致地方活力的喪失。你認為這種制度對於維護國家統一有何重要意義？`,

      quick: `朕推行郡縣制是為了加強中央集權，避免分封制造成的諸侯割據。郡守縣令由朝廷任免，直接對中央負責，這樣可以有效控制全國。此制度影響深遠，成為後世中央集權的基礎。`,

      socratic: `你提到郡縣制，那麼請思考：如果繼續沿用分封制，會對新統一的帝國帶來什麼風險？再者，郡縣制中官員由中央任免，這與分封制中的世襲制有何根本差異？最後，你認為這種制度變革對於普通百姓的生活會產生什麼影響？`,
    };

    const response = responses[options.mode] || responses.teaching;
    const chunks = response.split("");

    // 模擬打字效果
    for (let i = 0; i < chunks.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      options.onChunk(chunks[i]);
    }

    options.onComplete(response);
  } catch (error) {
    options.onError(error instanceof Error ? error : new Error("未知錯誤"));
  }
}
