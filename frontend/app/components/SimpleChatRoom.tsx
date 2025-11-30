import React, { useState, useRef, useEffect } from "react";
import { tainanColonialRuleMission } from "../data/missions/tainan-colonial-rule";
import { useMultiChatStore } from "../store/useMultiChatStore";
import { useMissionStore } from "../store/useMissionStore";
import MessageBubble from "./chat/MessageBubble";
import TypingIndicator from "./chat/TypingIndicator";
import StageCompletionCard from "./StageCompletionCard";
import type { Message } from "../types/chat";

interface NPC {
  id: string;
  name: string;
  role: string;
  icon: string;
  avatar?: string;
}

interface KeyPoint {
  id: string;
  title: string;
  description: string;
}

const npcs: NPC[] = [
  { 
    id: "student", 
    name: "小清", 
    role: "學生", 
    icon: "S", 
    avatar: "/assets/images/student.png" 
  },
  { 
    id: "police_officer", 
    name: "佐藤 敬一", 
    role: "警察", 
    icon: "P", 
    avatar: "/assets/images/police.png" 
  },
  { 
    id: "land_surveyor", 
    name: "山本 勘助", 
    role: "土地測量員", 
    icon: "M", 
    avatar: "/assets/images/Cadastral_surveyor.png" 
  },
];

const mission = tainanColonialRuleMission;

const SimpleChatRoom: React.FC = () => {
  const [selectedNpc, setSelectedNpc] = useState<NPC>(npcs[0]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 使用 useMultiChatStore 管理對話
  const {
    actions,
    isLoading,
    isStreaming,
    streamingContent,
    error,
    currentPersonaId,
  } = useMultiChatStore((state) => ({
    actions: state.actions,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    streamingContent: state.streamingContent,
    error: state.error,
    currentPersonaId: state.currentPersonaId,
  }));
  
  // 獲取當前角色的訊息
  const messages = actions.getCurrentMessages();
  
  // 調試輸出
  useEffect(() => {
    console.log('📨 當前訊息數量:', messages.length);
    console.log('🎭 當前角色ID:', currentPersonaId);
  }, [messages, currentPersonaId]);
  
  // 使用 useMissionStore
  const missionActions = useMissionStore(state => state.actions);
  
  // 新增狀態：關卡進度和關鍵線索
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [achievedKeyPoints, setAchievedKeyPoints] = useState<KeyPoint[]>([]);
  const [flashingKeyPoint, setFlashingKeyPoint] = useState<string | null>(null);
  const [showCompletionCard, setShowCompletionCard] = useState(false);
  const [collectedKeywordsInStage, setCollectedKeywordsInStage] = useState<string[]>([]);

  // 檢測關鍵字
  const checkKeywordsInMessage = (message: string, keywords: string[]): string[] => {
    const found = keywords.filter(kw => message.includes(kw));
    return found;
  };

  // 檢查關卡是否完成
  const checkStageCompletion = (newMessage: string) => {
    const currentStage = mission.stages[currentStageIndex];
    if (!currentStage || completedStages.includes(currentStage.id)) {
      return;
    }

    // 檢測新消息中的關鍵字
    const foundKeywords = checkKeywordsInMessage(newMessage, currentStage.keywords);
    
    if (foundKeywords.length > 0) {
      // 更新已收集的關鍵字
      const updatedKeywords = [...new Set([...collectedKeywordsInStage, ...foundKeywords])];
      setCollectedKeywordsInStage(updatedKeywords);

      // 創建關鍵點成就（用於閃爍動畫）
      foundKeywords.forEach(keyword => {
        const newKeyPoint: KeyPoint = {
          id: `kp_${Date.now()}_${keyword}`,
          title: keyword,
          description: `發現關鍵線索：${keyword}`
        };
        setAchievedKeyPoints(prev => [...prev, newKeyPoint]);
        
        // 觸發閃爍動畫
        setFlashingKeyPoint(newKeyPoint.id);
        setTimeout(() => setFlashingKeyPoint(null), 2000);
      });

      // 檢查是否收集到所有關鍵字
      if (updatedKeywords.length >= currentStage.keywords.length) {
        // 延遲顯示恭喜卡片，讓用戶看到最後的回應
        setTimeout(() => {
          setShowCompletionCard(true);
        }, 1500);
      }
    }
  };

  // 初始化：選擇第一個 NPC
  useEffect(() => {
    if (!currentPersonaId) {
      actions.switchToPersona(npcs[0].id);
    }
  }, [currentPersonaId, actions]);

  // 自動滾動到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // 監聽消息更新,檢測 NPC 回覆中的關鍵字
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        checkStageCompletion(lastMessage.content);
      }
    }
  }, [messages]);

  // 選擇 NPC
  const handleSelectNpc = (npc: NPC) => {
    if (npc.id === selectedNpc.id) return;
    setSelectedNpc(npc);
    actions.switchToPersona(npc.id);
  };

  // 發送消息
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    setInput("");

    try {
      await actions.sendMessage(userInput);
      
      // 檢測用戶輸入中的關鍵字
      checkStageCompletion(userInput);
    } catch (error: any) {
      console.error("❌ Chat error:", error);
    }
  };

  // 處理 Enter 鍵發送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // 處理返回任務列表
  const handleBackToMissions = () => {
    missionActions.goToStage('S0');
  };

  // 處理關卡完成後繼續
  const handleStageComplete = () => {
    const currentStage = mission.stages[currentStageIndex];
    
    // 標記當前關卡為已完成
    setCompletedStages(prev => [...prev, currentStage.id]);
    missionActions.completeStage(currentStage.id, collectedKeywordsInStage);
    
    // 進入下一關
    if (currentStageIndex < mission.stages.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
      missionActions.nextStage();
      setCollectedKeywordsInStage([]);
      setShowCompletionCard(false);
    } else {
      // 所有關卡完成，跳轉到總結
      setShowCompletionCard(false);
      missionActions.goToStage('S4');
    }
  };

  // 關閉卡片但留在本關
  const handleCloseCard = () => {
    setShowCompletionCard(false);
  };

  const currentStage = mission.stages[currentStageIndex];
  const totalKeywords = currentStage?.keywords.length || 0;
  const achievedKeywordsInStage = achievedKeyPoints.filter(kp => 
    currentStage?.keywords.some(keyword => 
      kp.title.includes(keyword) || keyword.includes(kp.title)
    )
  ).length;

  return (
    <div className="h-screen flex bg-gray-50">
      {/* 左側面板 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
        {/* 標題 */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-amber-50">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold tracking-wider text-amber-800" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.1em' }}>
              TIMETALK
            </h1>
          </div>
        </div>

        {/* NPC 選擇區 */}
        <div className="border-b border-gray-200">
          <div className="p-4 bg-gray-50">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">對話角色</h4>
          </div>
          <div className="px-4 pt-4 pb-6 space-y-3">
            {npcs.map((npc) => (
              <button
                key={npc.id}
                onClick={() => handleSelectNpc(npc)}
                className={`w-full px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                  selectedNpc.id === npc.id
                    ? "border-primary-500 bg-primary-50 text-primary-700 shadow-md"
                    : "border-gray-200 hover:border-primary-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* NPC 照片 */}
                  <div className="flex-shrink-0">
                    <img
                      src={npc.avatar}
                      alt={npc.name}
                      className={`w-12 h-12 rounded-full object-cover border-2 ${
                        selectedNpc.id === npc.id
                          ? "border-primary-500"
                          : "border-amber-700"
                      }`}
                      onError={(e) => {
                        // 如果圖片載入失敗，顯示文字圖標
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    {/* 備用文字圖標 */}
                    <div 
                      style={{ display: 'none' }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        selectedNpc.id === npc.id
                          ? "bg-primary-600 text-white border-2 border-primary-500"
                          : "bg-amber-700 text-amber-50 border-2 border-amber-700"
                      }`}
                    >
                      {npc.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{npc.name}</div>
                    <div className="text-xs text-gray-500">{npc.role}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 關卡進度區 */}
        <div className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50">
          <div className="p-4 bg-primary-50 border-b border-primary-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-primary-900 uppercase tracking-wider">
                已破譯謎團
              </h4>
              <span className="text-sm font-bold text-primary-700">
                {completedStages.length} / {mission.stages.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
            {mission.stages.map((stage, index) => {
              const isCompleted = completedStages.includes(stage.id);
              const isCurrent = index === currentStageIndex;
              const isLocked = index > currentStageIndex;
              
              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                    isCurrent
                      ? "bg-primary-100 border-2 border-primary-400"
                      : isCompleted
                      ? "bg-green-50 border border-green-300"
                      : isLocked
                      ? "bg-gray-100 opacity-50"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                    {isCompleted ? (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                      </svg>
                    ) : isLocked ? (
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-medium truncate ${
                      isLocked ? "text-gray-400" : "text-gray-800"
                    }`}>
                      {stage.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 關鍵線索區 */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-amber-50 to-white">
          <div className="p-3 bg-amber-100 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-800" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                捕獲線索
              </h4>
              <span className="text-sm font-bold text-amber-700">
                {achievedKeywordsInStage} / {totalKeywords}
              </span>
            </div>
          </div>
          <div className="p-3">
            {/* 當前關卡信息 */}
            <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-700 mb-1">當前關卡</div>
              <div className="text-sm font-bold text-primary-700 mb-2">{currentStage?.title}</div>
              <div className="text-xs text-gray-600">{currentStage?.description}</div>
            </div>
            
            {/* 關鍵字列表 */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-gray-600 mb-2">需要發現的線索：</div>
              {currentStage?.keywords.map((keyword, idx) => {
                const isAchieved = achievedKeyPoints.some(kp => 
                  kp.title.includes(keyword) || keyword.includes(kp.title)
                );
                const isFlashing = achievedKeyPoints.find(kp => 
                  (kp.title.includes(keyword) || keyword.includes(kp.title)) && 
                  kp.id === flashingKeyPoint
                );
                
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                      isFlashing
                        ? "bg-yellow-200 animate-pulse shadow-lg"
                        : isAchieved
                        ? "bg-green-100 border border-green-300"
                        : "bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isAchieved ? (
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      isAchieved ? "text-green-800" : "text-gray-600"
                    }`}>
                      {keyword}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* 提示信息 */}
            {currentStage?.hint && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2 text-xs text-blue-800">
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  <div>
                    <span className="font-semibold">提示：</span>
                    {currentStage.hint}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右側對話區 */}
      <div className="flex-1 flex flex-col">
        {/* 當前對話角色信息卡 */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-4">
              {/* NPC 頭像 */}
              <div className="flex-shrink-0 relative">
                <img
                  src={selectedNpc.avatar}
                  alt={selectedNpc.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary-500 shadow-md"
                  onError={(e) => {
                    // 圖片載入失敗時的備用方案
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* 備用文字圖標 */}
                <div 
                  style={{ display: 'none' }}
                  className="w-16 h-16 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-2xl border-2 border-primary-500 shadow-md"
                >
                  {selectedNpc.icon}
                </div>
                {/* 綠色在線狀態點 */}
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              
              {/* NPC 信息 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-800">{selectedNpc.name}</h2>
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                    {selectedNpc.role}
                  </span>
                </div>
              </div>
              
              {/* 劇本與返回按鈕 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => missionActions.goToStage('S1')}
                  className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 bg-white hover:bg-primary-50 border border-primary-300 rounded-lg transition-colors"
                >
                  劇本
                </button>
                <button
                  onClick={handleBackToMissions}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  重新選擇關卡
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 消息區 */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {messages.length === 0 && !isStreaming ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <div className="mb-4">
                      <svg className="w-16 h-16 mx-auto text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-2">與 {selectedNpc.name} 對話</p>
                    <p className="text-sm">開始你的歷史探索之旅</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      personaName={selectedNpc.name}
                      avatarUrl={selectedNpc.avatar}
                    />
                  ))}
                  
                  {/* 串流顯示 */}
                  {isStreaming && (
                    <MessageBubble
                      message={{
                        id: "streaming",
                        role: "assistant",
                        content: streamingContent,
                        timestamp: new Date(),
                      }}
                      isStreaming={true}
                      personaName={selectedNpc.name}
                      avatarUrl={selectedNpc.avatar}
                    />
                  )}
                  
                  {/* 加載指示器 */}
                  {isLoading && !isStreaming && (
                    <TypingIndicator personaName={selectedNpc.name} />
                  )}
                  
                  {/* 錯誤顯示 */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-red-800 font-medium">發生錯誤</h4>
                          <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                        <button
                          onClick={() => actions.retry()}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                        >
                          重試
                        </button>
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
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
                >
              {isLoading ? "..." : "發送"}
            </button>
          </div>
        </div>
      </div>

      {/* 關卡完成恭喜卡片 */}
      {showCompletionCard && (
        <StageCompletionCard
          completedStageTitle={mission.stages[currentStageIndex]?.title || ""}
          completionNote={mission.stages[currentStageIndex]?.completionNote || ""}
          nextStageTitle={mission.stages[currentStageIndex + 1]?.title}
          nextStageDescription={mission.stages[currentStageIndex + 1]?.description}
          isLastStage={currentStageIndex === mission.stages.length - 1}
          onContinue={handleStageComplete}
          onClose={handleCloseCard}
        />
      )}
    </div>
  );
};

export default SimpleChatRoom;
