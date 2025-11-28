import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface NPC {
  id: string;
  name: string;
  role: string;
  icon: string;
}

const BACKEND_URL = "http://localhost:4000";

const npcs: NPC[] = [
  { id: "student", name: "小清", role: "學生", icon: "👧" },
  { id: "police_officer", name: "佐藤 敬一", role: "警察", icon: "👮" },
  { id: "land_surveyor", name: "山本 勘助", role: "土地測量員", icon: "📐" },
];

const SimpleChatRoom: React.FC = () => {
  const [selectedNpc, setSelectedNpc] = useState<NPC>(npcs[0]); // 預設選擇第一個角色
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化遊戲會話
  useEffect(() => {
    if (selectedNpc && !sessionId) {
      startGameSession(selectedNpc.id);
    }
  }, []);

  // 自動滾動到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 開始遊戲會話
  const startGameSession = async (npcId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/game/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: "e2-industrial-agri",
          npcId: npcId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.data.sessionId);
        console.log("✅ Game session started:", data.data.sessionId);
      }
    } catch (error) {
      console.error("❌ Failed to start session:", error);
    }
  };

  // 選擇 NPC
  const handleSelectNpc = (npc: NPC) => {
    if (npc.id === selectedNpc.id) return; // 如果選擇相同角色,不做任何事
    setSelectedNpc(npc);
    setMessages([]);
    setSessionId(null);
    startGameSession(npc.id);
  };

  // 發送消息
  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/game/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: userMessage.content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 使用第一個回答 (temperature 0.7)
        const aiMessage: Message = {
          role: "assistant",
          content: data.data.responses[0].content,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error: any) {
      console.error("❌ Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: `抱歉,發生錯誤: ${error.message}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 處理 Enter 鍵發送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* 左側角色選擇欄 */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">選擇對話角色</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {npcs.map((npc) => (
            <button
              key={npc.id}
              onClick={() => handleSelectNpc(npc)}
              className={`w-full px-3 py-3 rounded-lg border-2 transition-all text-left ${
                selectedNpc.id === npc.id
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{npc.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{npc.name}</div>
                  <div className="text-xs text-gray-500">{npc.role}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 右側對話區 */}
      <div className="flex-1 flex flex-col">
        {/* 消息區 */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <p className="text-lg">👈 請先選擇對話角色</p>
                    <p className="text-sm mt-2">然後開始你的歷史探索之旅</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* NPC 頭像 (左側) */}
                      {msg.role === "assistant" && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                          {selectedNpc?.icon}
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            msg.role === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString("zh-TW", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      
                      {/* 使用者頭像 (右側) */}
                      {msg.role === "user" && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                          {selectedNpc?.icon}
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                        {selectedNpc?.icon}
                      </div>
                      <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
        </div>

        {/* 輸入區 */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="輸入你的問題..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
                >
              {isLoading ? "..." : "發送"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleChatRoom;
