import React, { useEffect } from "react";
import { useMissionStore } from "../store/useMissionStore";
import { e2Chunks } from "../data/missions/e2-industrial-agri";
import { callOllamaChat } from "../services/ollama";

const MissionIntro: React.FC = () => {
  const { currentMissionId, missionIntro, guidingQuestions, actions } = useMissionStore();
  const chunk = e2Chunks.find((c) => c.missionId === currentMissionId) || e2Chunks[0];

  useEffect(() => {
    // S1: 生成任務開場故事
    if (currentMissionId && !missionIntro) {
      generateMissionIntro();
    }
  }, [currentMissionId, missionIntro]);

  const generateMissionIntro = async () => {
    try {
      const systemPrompt = `你是一位歷史老師，請為任務 ${currentMissionId} 產生一段 150-200 字的任務開場故事，並在最後列出 1 到 2 個引導式問題。`;
      
      const data = await callOllamaChat({
        systemPrompt,
        messages: [{ role: "user", content: `請為任務「${chunk.topic}」產生開場故事。` }]
      });
      
      const content = data.message?.content || chunk.text;
      const questions = ['你覺得誰最清楚真相？', '想先問誰問題？'];
      
      actions.setMissionIntro(content, questions);
    } catch (error) {
      console.error('Failed to generate mission intro:', error);
      // 使用預設內容
      actions.setMissionIntro(chunk.text, ['你覺得誰最清楚真相？', '想先問誰問題？']);
    }
  };

  if (!currentMissionId) {
    return <div className="p-6">請先選擇任務</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="container-max">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-heading-2 text-dark-900 mb-4">
              {chunk.topic}
            </h1>
            <div className="text-lg text-primary-600 mb-2">
              歷史任務介紹
            </div>
          </div>

          <div className="card bg-white mb-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {missionIntro || '正在生成任務介紹...'}
              </p>
            </div>
          </div>

          {guidingQuestions.length > 0 && (
            <div className="card bg-primary-50 border border-primary-200 mb-8">
              <h3 className="text-lg font-semibold text-primary-800 mb-4">
                引導問題
              </h3>
              <ul className="space-y-2">
                {guidingQuestions.map((question, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-primary-700">{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => actions.goToStage("S2")}
              className="btn-primary flex items-center gap-2 group"
              disabled={!missionIntro}
            >
              <span>開始調查</span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>

            <button
              onClick={() => actions.goToStage("S0")}
              className="px-3 py-2 bg-gray-200 rounded ml-4"
            >
              返回任務列表
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionIntro;
