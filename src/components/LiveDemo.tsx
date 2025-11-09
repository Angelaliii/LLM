import React, { useEffect, useState } from "react";
import { useAnalytics } from "../services/analytics";
import { ChatMessage, DemoStreamService } from "../services/demoStream";
import CTAButton from "./CTAButton";
import Icon from "./Icon";

const LiveDemo: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const { trackDemoInteraction } = useAnalytics();

  useEffect(() => {
    // 初始化歡迎訊息
    const welcomeMessage = DemoStreamService.getWelcomeMessage();
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: DemoStreamService.generateMessageId(),
      role: "user",
      content: userInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsTyping(true);

    // 追蹤互動
    trackDemoInteraction("message_sent", { userInput: userInput.slice(0, 50) });

    try {
      // 模擬串流回應
      const assistantMessage: ChatMessage = {
        id: DemoStreamService.generateMessageId(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // 開始串流
      for await (const chunk of DemoStreamService.streamResponse(userInput)) {
        setCurrentMessage(chunk.content);

        if (chunk.isComplete) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: chunk.content }
                : msg
            )
          );
          setCurrentMessage("");
          setIsTyping(false);
        }
      }
    } catch (error) {
      console.error("Demo error:", error);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section id="demo" className="section-padding bg-gray-50">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-heading-2 text-dark-900 mb-4">
            立即體驗歷史對話
          </h2>
          <p className="text-xl text-dark-700 max-w-3xl mx-auto">
            與秦始皇直接對話，感受革命性的歷史學習體驗。輸入您的問題，立即獲得第一人稱回應。
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* 聊天頭部 */}
            <div className="bg-primary-500 text-white p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon name="user" size="md" className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">秦始皇嬴政</h3>
                  <p className="text-primary-100">始皇帝 • 統一六國 • 在線中</p>
                </div>
                <div className="ml-auto">
                  <div className="flex items-center space-x-2 text-primary-100">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">即時回應</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 聊天內容 */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-dark-900"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString("zh-TW", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* 正在輸入指示器 */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-dark-900 px-4 py-3 rounded-lg max-w-xs lg:max-w-md">
                    <div className="typing-cursor">
                      {currentMessage || "正在思考中..."}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 輸入區域 */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="問問秦始皇關於統一天下、修築長城，或任何歷史問題..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isTyping}
                  className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  <Icon name="arrow" size="sm" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-4 text-sm text-dark-700">
                <div className="flex items-center space-x-4">
                  <span>💡 試試問：「您為什麼要統一文字？」</span>
                </div>
                <div className="text-xs text-gray-500">
                  按 Enter 發送 • 本為展示用模擬對話
                </div>
              </div>
            </div>
          </div>

          {/* CTA 區域 */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-dark-900 mb-4">
                想要完整體驗？立即開始免費試用
              </h3>
              <p className="text-dark-700 mb-6">
                上方僅為簡化展示，完整版本包含更豐富的歷史人物、深度對話與教學管理功能
              </p>
              <CTAButton
                size="lg"
                href="#contact"
                trackingLabel="開始完整體驗"
                trackingLocation="demo-cta"
              >
                <Icon name="play" size="sm" className="mr-2" />
                開始完整體驗
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;
