import React, { useEffect } from "react";
import { useMissionStore } from "../store/useMissionStore";
import { e2Chunks } from "../data/missions/e2-industrial-agri";
import { callOllamaChat } from "../services/ollama";

const SummaryView: React.FC = () => {
  const { currentMissionId, missionSummary, conversationSummary, actions } = useMissionStore();

  useEffect(() => {
    // S4: 生成任務總結
    if (currentMissionId && !missionSummary) {
      generateMissionSummary();
    }
  }, [currentMissionId, missionSummary]);

  const generateMissionSummary = async () => {
    try {
      const systemPrompt = `你是一位國中歷史老師，請根據任務核心知識與對話摘要，產出一篇 300 至 500 字、適合國中生閱讀的任務總結。`;
      
      const coreChunks = e2Chunks.filter((c) => c.type === "core_fact");
      const context = coreChunks.map(c => c.text).join('\n\n');
      
      const data = await callOllamaChat({
        systemPrompt,
        messages: [{ 
          role: "user", 
          content: `任務核心知識：\n${context}\n\n對話摘要：\n${conversationSummary}\n\n請產生一篇結構清晰的總結。` 
        }]
      });
      
      const summary = data.message?.content || context;
      actions.generateSummary(summary);
    } catch (error) {
      console.error('Failed to generate mission summary:', error);
      // 使用預設總結
      const coreChunks = e2Chunks.filter((c) => c.type === "core_fact");
      const autoSummary = coreChunks.map((c) => c.text).join("\n\n");
      actions.generateSummary(autoSummary);
    }
  };

  if (!currentMissionId) {
    return <div className="p-6">請先選擇任務</div>;
  }

  const coreChunks = e2Chunks.filter((c) => c.type === "core_fact");
  const autoSummary = coreChunks.map((c) => c.text).join("\n\n");
  const summaryToShow = missionSummary || autoSummary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <div className="container-max">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-heading-1 text-dark-900 mb-4">
              任務總結
            </h1>
            <p className="text-xl text-dark-700">
              經過一連串的調查，讓我們來看看完整的故事
            </p>
          </div>

          <div className="card bg-white mb-8">
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {missionSummary ? summaryToShow : '正在生成任務總結...'}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl p-8 text-center text-white mb-8">
            <h2 className="text-2xl font-bold mb-4">恭喜您完成調查！</h2>
            <p className="text-lg opacity-90 mb-4">
              現在準備好接受最後的挑戰了嗎？
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => actions.startQuiz()}
              className="btn-primary flex items-center gap-2 group"
            >
              <span>開始測驗</span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
            
            <button
              onClick={() => actions.resetMission()}
              className="btn-secondary"
            >
              重新選擇任務
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
