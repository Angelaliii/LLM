import React, { useEffect, useRef, useState } from "react";
import { useMultiChatStore } from "../../store/useMultiChatStore";
import { useMissionStore } from "../../store/useMissionStore";
import InputArea from "./InputArea";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatHeader from "./ChatHeader";
import PersonaSwitcher from "./PersonaSwitcher";
import StoryInfoCard from "./StoryInfoCard";
import CompactStageSidebar from "./CompactStageSidebar";
import StageCompletionModal from "./StageCompletionModal";
import KeyPointAchievedModal from "./KeyPointAchievedModal";

import { e2Npcs } from "../../data/missions/e2-industrial-agri";

const ChatWindow: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showStoryCard, setShowStoryCard] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showKeyPointModal, setShowKeyPointModal] = useState(false);
  const [achievedKeyPoint, setAchievedKeyPoint] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [nextSuggestion, setNextSuggestion] = useState("");
  const [achievedKeyPointIds, setAchievedKeyPointIds] = useState<string[]>([]);
  
  // 獲取 mission store 用於返回
  const missionActions = useMissionStore(state => state.actions);
  
  // 關卡資料（使用 state 讓它可以動態更新）
  const [stages, setStages] = useState([
    { id: 1, title: "法律與權力", description: "了解《法律第六十三號》(六三法)如何賦予總督專制權力", completed: false },
    { id: 2, title: "警察政治", description: "探討殖民警察如何控制台灣社會", completed: false },
    { id: 3, title: "保甲制度", description: "認識保甲制度的運作與影響", completed: false },
    { id: 4, title: "土地調查", description: "理解土地調查如何改變台灣土地制度", completed: false },
    { id: 5, title: "專賣制度", description: "探索專賣制度對台灣經濟的影響", completed: false },
  ]);
  
  const currentStage = 2; // 這裡可以從 store 或 props 獲取
  
  // 本關重點（第2關：警察政治）- 用於判斷完成
  const keyPoints = [
    { 
      id: "kp1", 
      title: "警察的角色", 
      description: "了解殖民警察在台灣社會中扮演的多重角色",
      achieved: false // 這裡應該根據對話內容動態判斷
    },
    { 
      id: "kp2", 
      title: "保甲制度", 
      description: "認識保甲制度如何輔助警察控制",
      achieved: true // 範例：已達成
    },
    { 
      id: "kp3", 
      title: "連坐處罰", 
      description: "理解連坐制度對民眾的影響",
      achieved: true // 範例：已達成
    },
  ];
  
  // 檢查是否達成所有重點（至少2個）
  const achievedCount = keyPoints.filter(kp => kp.achieved).length;
  const isStageCompleted = achievedCount >= 2;
  
  // 當達成條件時顯示完成彈窗（僅示範，實際需要更精確的觸發時機）
  useEffect(() => {
    if (isStageCompleted) {
      // 可以在這裡添加延遲或特定觸發條件
      // setTimeout(() => setShowCompletionModal(true), 1000);
    }
  }, [isStageCompleted]);
  
  // 使用新的多角色 store：選取 actions 與需要的狀態屬性
  const {
    actions,
    isLoading,
    isStreaming,
    streamingContent,
    error,
    investigationComplete,
    currentPersonaId,
  } = useMultiChatStore((state) => ({
    actions: state.actions,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    streamingContent: state.streamingContent,
    error: state.error,
    investigationComplete: state.investigationComplete,
    currentPersonaId: state.currentPersonaId,
  }));

  // 將 currentPersonaId 映射為 selectedNpcId（舊變數名兼容）
  const selectedNpcId = currentPersonaId;

  // 透過 actions 取得當前角色的訊息陣列
  const messages = actions.getCurrentMessages();

  // 取得當前角色名稱
  const getCurrentPersonaName = () => {
    const npc = e2Npcs.find((npc) => npc.id === selectedNpcId);
    return npc?.name || "對話角色";
  };

  const personaName = getCurrentPersonaName();

  // 自動滾動到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleRetry = () => {
    actions.retry();
  };
  
  // 隨機選擇一個未完成的任務
  const getRandomUncompletedStage = () => {
    const uncompletedStages = stages.filter(stage => !stage.completed);
    if (uncompletedStages.length === 0) return "所有任務已完成";
    const randomIndex = Math.floor(Math.random() * uncompletedStages.length);
    return uncompletedStages[randomIndex].title;
  };
  
  // 處理關鍵點達成（需要從 API 回應中調用）
  const handleKeyPointAchieved = (keyPoint: { id: string; title: string; description: string }) => {
    // 避免重複顯示同一個關鍵點
    if (achievedKeyPointIds.includes(keyPoint.id)) {
      return;
    }
    
    setAchievedKeyPoint(keyPoint);
    setNextSuggestion(getRandomUncompletedStage());
    setShowKeyPointModal(true);
    setAchievedKeyPointIds(prev => [...prev, keyPoint.id]);
    
    // 更新對應的 stage 為已完成
    setStages(prevStages => {
      return prevStages.map(stage => {
        // 根據關鍵點標題匹配對應的 stage
        if (stage.title.includes(keyPoint.title.substring(0, 2)) || 
            keyPoint.title.includes(stage.title.substring(0, 2))) {
          return { ...stage, completed: true };
        }
        return stage;
      });
    });
  };
  
  // 暴露 handleKeyPointAchieved 給外部調用（通過 useMultiChatStore）
  useEffect(() => {
    // 將處理函數附加到 window 對象，以便 llmClient 可以調用
    (window as any).handleKeyPointAchieved = handleKeyPointAchieved;
    
    return () => {
      delete (window as any).handleKeyPointAchieved;
    };
  }, [achievedKeyPointIds, stages]);
  
  // 處理返回選擇劇本
  const handleBackToMissions = () => {
    // 不清除對話記錄，只是返回 S0 頁面
    // 對話記錄和後端 session 都會保留
    missionActions.goToStage('S0');
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* 劇情資訊卡片（彈出式） */}
      <StoryInfoCard visible={showStoryCard} onClose={() => setShowStoryCard(false)} />
      
      {/* 單個關鍵點達成提示 */}
      <KeyPointAchievedModal
        visible={showKeyPointModal}
        keyPointTitle={achievedKeyPoint?.title || ""}
        keyPointDescription={achievedKeyPoint?.description || ""}
        nextSuggestion={nextSuggestion}
        onContinue={() => {
          setShowKeyPointModal(false);
          setAchievedKeyPoint(null);
        }}
      />
      
      {/* 關卡完成通知 */}
      <StageCompletionModal
        visible={showCompletionModal}
        stageName="第2關：警察政治"
        achievedPoints={keyPoints.filter(kp => kp.achieved).map(kp => kp.title)}
        onContinue={() => {
          setShowCompletionModal(false);
          // TODO: 前往下一關的邏輯
          console.log("前往第3關");
        }}
        onReview={() => {
          setShowCompletionModal(false);
          // 關閉彈窗，讓用戶繼續查看對話
        }}
      />

      {/* 左側：精簡的關卡進度欄 */}
      <CompactStageSidebar currentStage={currentStage} stages={stages} />

      {/* 中間：主要對話區 */}
      <div className="flex-1 flex flex-col">
        {/* 返回按鈕 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <button
            onClick={handleBackToMissions}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>返回選擇劇本</span>
          </button>
        </div>
        
        {/* 對話卡片 */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 m-4 rounded-lg shadow-lg overflow-hidden">
          {/* 頭部 */}
          <div className="relative">
            <ChatHeader personaId={selectedNpcId || "default-character"} />
            
                {/* 劇情資訊按鈕 */}
                <button
                  onClick={() => setShowStoryCard(true)}
                  className="absolute top-3 right-3 p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  title="查看劇情背景"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                {/* 測試關鍵點按鈕（開發用，可以移除） */}
                <button
                  onClick={() => {
                    const testKeyPoints = [
                      { id: 'kp1', title: '警察的角色', description: '了解殖民警察在台灣社會中扮演的多重角色' },
                      { id: 'kp2', title: '保甲制度', description: '認識保甲制度如何輔助警察控制' },
                      { id: 'kp3', title: '連坐處罰', description: '理解連坐制度對民眾的影響' },
                    ];
                    const randomKp = testKeyPoints[Math.floor(Math.random() * testKeyPoints.length)];
                    handleKeyPointAchieved(randomKp);
                  }}
                  className="absolute top-3 right-14 p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                  title="測試關鍵點達成"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              </div>          {/* 角色切換器 */}
          <PersonaSwitcher />

          {/* 消息列表（內容超出時在此處滾動） */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && !isStreaming && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏛️</div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    與日治時期人物對話
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    請從左側選擇 NPC 角色，輸入您的問題，探索日治時期台灣的歷史真相。
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} personaName={personaName} />
              ))}

              {/* 串流逐字預覽：在 isStreaming 時顯示臨時的 assistant 訊息 */}
              {isStreaming && (
                <MessageBubble
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: streamingContent,
                    timestamp: new Date(),
                  }}
                  isStreaming={true}
                  personaName={personaName}
                />
              )}

              {/* 仍保留 loading 指示（可視情況顯示） */}
              {isLoading && !isStreaming && <TypingIndicator personaName={personaName} />}

              {/* 錯誤顯示 */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-red-800 dark:text-red-200 font-medium">
                        發生錯誤
                      </h4>
                      <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                        {error}
                      </p>
                    </div>
                    <button
                      onClick={handleRetry}
                      className="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors text-sm"
                    >
                      重試
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

          {/* 輸入區 */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
            <InputArea 
              personaName={personaName} 
              currentStage={currentStage}
              totalStages={stages.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
