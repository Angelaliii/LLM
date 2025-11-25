import React, { useEffect, useCallback, useRef } from "react";
import { useMissionStore } from "../store/useMissionStore";
import { e2Chunks } from "../data/missions/e2-industrial-agri";
import LoadingPage from "./ui/LoadingPage";

// Minimum loading time in milliseconds to prevent flickering
const MIN_LOADING_TIME = 1500;

const MissionIntro: React.FC = () => {
  const { currentMissionId, missionIntro, guidingQuestions, isGenerating, generationError, actions } = useMissionStore();
  const chunk = e2Chunks.find((c) => c.missionId === currentMissionId) || e2Chunks[0];
  const loadingStartTime = useRef<number | null>(null);

  const generateMissionIntro = useCallback(async () => {
    if (!currentMissionId) return;
    
    // Record start time for minimum loading duration
    loadingStartTime.current = Date.now();
    
    try {
      // Simulate API call / use static data
      // In real implementation, this would be an async API call
      const content = chunk.text;
      const questions = ['你覺得誰最清楚真相？', '想先問誰問題？'];
      
      // Calculate remaining time to meet minimum loading requirement
      const elapsed = Date.now() - loadingStartTime.current;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);
      
      // Wait for minimum loading time to complete
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      actions.setMissionIntro(content, questions);
    } catch (error) {
      // Handle errors gracefully
      const errorMessage = error instanceof Error ? error.message : "載入失敗，請稍後再試";
      actions.setGenerationError(errorMessage);
    }
  }, [currentMissionId, chunk.text, actions]);

  useEffect(() => {
    // S1: Generate mission intro when entering this stage
    if (currentMissionId && !missionIntro && isGenerating) {
      console.log('Starting mission intro generation...');
      generateMissionIntro();
    }
  }, [currentMissionId, missionIntro, isGenerating, generateMissionIntro]);

  // Handle retry action
  const handleRetry = useCallback(() => {
    actions.setGenerating(true);
    generateMissionIntro();
  }, [actions, generateMissionIntro]);

  // Handle go back action
  const handleGoBack = useCallback(() => {
    actions.resetMission();
  }, [actions]);

  if (!currentMissionId) {
    return <div className="p-6">請先選擇任務</div>;
  }

  // Show loading page while generating or if there's an error
  if (isGenerating || generationError) {
    return (
      <LoadingPage
        error={generationError}
        onRetry={handleRetry}
        onGoBack={handleGoBack}
      />
    );
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
