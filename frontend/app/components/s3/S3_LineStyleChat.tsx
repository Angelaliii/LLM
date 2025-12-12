import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';
import { useMissionStore } from '../../store/useMissionStore';
import { getMissionById } from '../../data/missions';
import { matchKeywords } from '../../config/keywords';
import { streamChatViaBackend } from '../../services/llmClient';
import { Send, Loader, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import MessageBubble from './subcomponents/MessageBubble';
import Notebook from '../Notebook';
import PromptChips from '../PromptChips';
import { useNotebookStore } from '../../store/useNotebookStore';
import './s3.css';
import StageNavigation from '../ui/StageNavigation';

interface Message {
  id: string;
  role: 'user' | 'npc' | 'system';
  content: string;
  timestamp: string;
}

interface PromptSuggestion {
  text: string;
  type: 'fact' | 'conflict' | 'empathy';
}

interface NpcData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  description?: string;
}

export default function S3_LineStyleChat() {
  const { selectedNpcId, conversationsByPersona, actions } = useChatStore();
  const { currentMissionId, currentStageIndex, actions: missionActions } = useMissionStore();
  const { collectedClues, informationGaps, actions: notebookActions } = useNotebookStore();
  const mission = currentMissionId ? getMissionById(currentMissionId) : null;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializingBackground, setIsInitializingBackground] = useState(false);
  const [npcData, setNpcData] = useState<NpcData | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [pendingShowCompletionOnNpcFinish, setPendingShowCompletionOnNpcFinish] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<PromptSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // NPC 資料對應表
  const npcMap: Record<string, NpcData> = {
    'police_officer': {
      id: 'police_officer',
      name: '佐藤敬一',
      role: '日本基層警察',
      avatar: '/assets/images/police.png',
      color: 'from-slate-700 to-slate-900',
      description: '負責執行總督府命令的日本警察，權力極大，令人敬畏。'
    },
    'student': {
      id: 'student',
      name: '小清',
      role: '公學校學生',
      avatar: '/assets/images/student.png',
      color: 'from-emerald-600 to-emerald-800',
      description: '台南市區的公學校學生，能提供基層台籍民眾的生活視角。'
    },
    'land_surveyor': {
      id: 'land_surveyor',
      name: '山本勘助',
      role: '土地測量員',
      avatar: '/assets/images/Cadastral_surveyor.png',
      color: 'from-amber-700 to-amber-900',
      description: '負責土地調查和林野清查的測量員，掌握財政與土地相關資訊。'
    }
  };

  const availableNpcs = Object.values(npcMap);

  // 防禦性檢查
  useEffect(() => {
    if (!currentMissionId || !mission) {
      console.warn('[S3] Missing mission, redirecting to S0');
      actions.goToStage("S0");
      missionActions.resetMission();
      return;
    }
  }, [currentMissionId, mission, actions, missionActions]);

  // 初始化 NPC 對話 - 切換 NPC 時保存當前對話並載入新對話
  useEffect(() => {
    if (!selectedNpcId || !mission) return;

    if (currentMissionId && Object.keys(informationGaps).length === 0) {
      notebookActions.initializeGaps(currentMissionId);
    }

    const npc = npcMap[selectedNpcId];
    setNpcData(npc);

    // 🔄 切換 NPC 時清空舊的 suggestions
    setCurrentSuggestions([]);
    console.log(`🔄 Switched to NPC: ${selectedNpcId}, cleared suggestions`);

    // 從 store 讀取該 NPC 的對話記錄
    const existingConversation = conversationsByPersona?.[selectedNpcId];
    if (existingConversation && existingConversation.length > 0) {
      // 轉換格式並載入該 NPC 的對話
      const convertedMessages = existingConversation.map(msg => ({
        ...msg,
        role: msg.role === 'assistant' ? 'npc' as const : msg.role as 'user' | 'npc' | 'system',
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString('zh-TW') : msg.timestamp
      }));
      setMessages(convertedMessages);
    } else {
      // 該 NPC 沒有對話記錄,清空並初始化
      setMessages([]);
      setIsInitializingBackground(true);
      initializeConversation(npc, mission);
    }
  }, [selectedNpcId, mission]);

  const initializeConversation = async (npc: NpcData, mission: any) => {
    setIsLoading(true);
    
    if (!selectedNpcId || !currentMissionId) {
      setIsLoading(false);
      return;
    }
    
    try {
      const initPrompt = `請開始與 ${npc.name} 的對話，為任務「${mission.title}」提供背景介紹。`;
      
      await streamChatViaBackend(initPrompt, {
        npcId: selectedNpcId,
        missionId: currentMissionId,
        handlers: {
          onComplete: (response) => {
            const newMessage: Message = {
              id: `msg_init_${Date.now()}`,
              role: 'npc',
              content: response,
              timestamp: new Date().toLocaleTimeString('zh-TW')
            };
            
            const initialMessages = [newMessage];
            setMessages(initialMessages);
            
            // 🔑 關鍵：將初始對話也存入 store
            actions.updateConversation(selectedNpcId, initialMessages as any);
            
            setIsInitializingBackground(false);
            setIsLoading(false);
            // 如果之前已達成所有 gap，則在 NPC 回覆完成後立刻顯示 banner
            if (pendingShowCompletionOnNpcFinish) {
              setShowCompletionDialog(true);
              setPendingShowCompletionOnNpcFinish(false);
            }
          },
          onError: (error) => {
            console.error('Failed to initialize conversation:', error);
            const errorMsg: Message = {
              id: `msg_err_${Date.now()}`,
              role: 'system',
              content: '無法連接 NPC 知識庫。請檢查後端服務。',
              timestamp: new Date().toLocaleTimeString('zh-TW')
            };
            
            const errorMessages = [errorMsg];
            setMessages(errorMessages);
            
            // 錯誤訊息也要保存
            actions.updateConversation(selectedNpcId, errorMessages as any);
            
            setIsInitializingBackground(false);
            setIsLoading(false);
          }
        }
      });
    } catch (error) {
      console.error('Error initializing conversation:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => cancelAnimationFrame(raf);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedNpcId) return;

    const userMessage: Message = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('zh-TW')
    };

    // 更新本地訊息
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      await streamChatViaBackend(inputValue, {
        npcId: selectedNpcId,
        missionId: currentMissionId,
        handlers: {
          onSuggestions: (suggestions) => {
            // 🎯 每次回應都更新 suggestions，不同 NPC 不會共用
            console.log(`✅ Updated suggestions for ${selectedNpcId}:`, suggestions);
            setCurrentSuggestions(suggestions);
          },
          onComplete: (response) => {
            const npcMessage: Message = {
              id: `msg_npc_${Date.now()}`,
              role: 'npc',
              content: response,
              timestamp: new Date().toLocaleTimeString('zh-TW')
            };
            
            // 更新本地訊息
            const finalMessages = [...newMessages, npcMessage];
            setMessages(finalMessages);
            
            detectAndAddClues(response, npcData?.name || 'NPC', inputValue);
            
            // 🔑 關鍵：將完整對話記錄存入 store,按 NPC ID 分別保存
            actions.updateConversation(selectedNpcId, finalMessages as any);
            
            setIsLoading(false);
            // 如果之前已達成所有 gap，則在 NPC 回覆完成後立刻顯示 banner
            if (pendingShowCompletionOnNpcFinish) {
              setShowCompletionDialog(true);
              setPendingShowCompletionOnNpcFinish(false);
            }
          },
          onError: (error) => {
            console.error('Chat error:', error);
            const errorMsg: Message = {
              id: `msg_err_${Date.now()}`,
              role: 'system',
              content: '無法取得回覆。請重試。',
              timestamp: new Date().toLocaleTimeString('zh-TW')
            };
            const errorMessages = [...newMessages, errorMsg];
            setMessages(errorMessages);
            
            // 也要保存錯誤訊息到 store
            actions.updateConversation(selectedNpcId, errorMessages as any);
            
            setIsLoading(false);
          }
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  // 監控調查進度,當所有缺口都解鎖時顯示完成對話框
  useEffect(() => {
    // `InformationGap` uses a `status` field ('locked' | 'unlocked' | 'filled').
    // Treat both 'unlocked' and 'filled' as unlocked for completion checks.
    const allGapsUnlocked = Object.values(informationGaps).every(gap => gap.status === 'unlocked' || gap.status === 'filled');
    const hasGaps = Object.keys(informationGaps).length > 0;

    if (allGapsUnlocked && hasGaps && !showCompletionDialog) {
      console.log('[S3] All investigation gaps unlocked, will show banner after next NPC reply');
      // Don't show immediately — wait until NPC finishes speaking, then show
      setPendingShowCompletionOnNpcFinish(true);
    }
  }, [informationGaps, showCompletionDialog]);

  const detectAndAddClues = (npcMessage: string, npcName: string, userQuestion: string) => {
    const { categories, matches } = matchKeywords(npcMessage || '');
    const clues: Array<any> = [];

    if (categories.includes('law')) {
      clues.push({ text: '六三法', type: 'fact' as const, source: npcName, relatedGapId: 'gap_1' });
    }

    if (categories.includes('government')) {
      clues.push({ text: '警察制度', type: 'fact' as const, source: npcName, relatedGapId: 'gap_2' });
    }

    const existingClueTexts = new Set(
      Object.values(collectedClues).map(clue => clue.text)
    );

    const newClues = clues.filter(clue => !existingClueTexts.has(clue.text));

    if (newClues.length > 0) {
      newClues.forEach(clueData => notebookActions.addClue(clueData));
    }

    if (matches.length > 0 && mission && typeof currentStageIndex === 'number') {
      const stageId = mission.stages?.[currentStageIndex]?.id || mission.stages?.[0]?.id || 'stage_1_intro';
      try {
        missionActions.updateStageProgress(stageId, matches);
      } catch (e) {
        console.warn('[S3] Failed to update stage progress', e);
      }
    }
  };

  const handlePromptChipClick = (prompt: string, level: string) => {
    setInputValue(prompt);
  };

  const handleSelectNpc = (npcId: string) => {
    actions.selectNpc(npcId);
    missionActions.selectNpc(npcId);
  };

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-primary-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">無法載入任務</p>
          <button
            onClick={() => {
              actions.goToStage("S0");
              missionActions.resetMission();
            }}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            返回任務列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-white to-primary-50 flex flex-col">
      <StageNavigation currentStage="S3" />
      {showCompletionDialog && <div className="h-20" />}
      
      {/* 返回按鈕（左上角） */}
      <button
        onClick={() => actions.goBack()}
        className="fixed top-6 left-6 z-30 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-md transition-all text-stone-600 hover:text-stone-800 border border-stone-200"
        aria-label="返回上一頁"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium hidden sm:inline">返回</span>
      </button>
      
      {/* LINE 風格雙欄佈局 */}
      <div className="flex-1 flex overflow-hidden mt-4">
        {/* 左側：角色選擇欄 */}
        <div className="w-72 lg:w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-base lg:text-lg text-dark-900">調查對象</h2>
            <p className="text-xs lg:text-sm text-dark-600 mt-1">選擇要訪談的角色</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {availableNpcs.map((npc) => (
              <button
                key={npc.id}
                onClick={() => handleSelectNpc(npc.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-all ${
                  selectedNpcId === npc.id
                    ? 'bg-primary-50 border-2 border-primary-400 shadow-sm'
                    : 'bg-white hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                }`}
              >
                <img
                  src={npc.avatar}
                  alt={npc.name}
                  className="w-11 h-11 lg:w-12 lg:h-12 rounded-full border-2 border-gray-200 flex-shrink-0"
                />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-dark-900">{npc.name}</div>
                  <div className="text-xs text-dark-600">{npc.role}</div>
                </div>
                {selectedNpcId === npc.id && (
                  <ChevronRight size={20} className="text-primary-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 右側：對話視窗 */}
        <div className="flex-1 flex flex-col bg-white">
          {npcData ? (
            <>
              {/* 對話頭部 */}
              <div className="border-b border-gray-200 bg-white shadow-sm p-4 lg:p-5">
                <div className="flex items-center gap-3">
                  <img
                    src={npcData.avatar}
                    alt={npcData.name}
                    className="w-11 h-11 lg:w-12 lg:h-12 rounded-full border-2 border-primary-400 shadow-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-base lg:text-lg text-dark-900 truncate">{npcData.name}</h2>
                    <p className="text-xs lg:text-sm text-dark-600 truncate">{npcData.role}</p>
                    {isInitializingBackground && (
                      <div className="inline-flex items-center gap-2 mt-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        <Loader className="animate-spin text-gray-600" size={12} />
                        <span>載入背景資料…</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 訊息區域：加入 min-h-0 使 flex 子元素可正確收縮並成為內部可捲動區 */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 bg-gray-50">
                <div className="max-w-4xl mx-auto space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} npcName={npcData.name} />
                    ))}
                  </AnimatePresence>

                  {isInitializingBackground && messages.length === 0 && (
                    <div className="py-6 space-y-4">
                      <div className="skeleton-bubble w-3/4 h-16 rounded-xl" />
                      <div className="skeleton-bubble w-1/2 h-16 rounded-xl ml-auto" />
                      <div className="skeleton-bubble w-2/3 h-16 rounded-xl" />
                    </div>
                  )}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 text-gray-600"
                    >
                      <Loader className="animate-spin" size={20} />
                      <span>{npcData.name} 正在思考...</span>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* 輸入區域 */}
              <div className="border-t border-gray-200 bg-white shadow-lg p-4">
                <div className="max-w-4xl mx-auto">
                  <PromptChips
                    suggestions={currentSuggestions}
                    onChipClick={handlePromptChipClick}
                    disabled={isLoading}
                  />
                  
                  <div className="flex gap-3 mt-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isLoading}
                      placeholder="輸入你的問題..."
                      className="flex-1 px-5 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:bg-gray-100 shadow-sm transition-all"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className={`px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm ${
                        inputValue.trim() && !isLoading
                          ? 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-md cursor-pointer active:scale-95'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Send size={18} />
                      發送
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">請從左側選擇一位調查對象</p>
                <p className="text-sm">開始你的歷史探索之旅</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 永久可見的完成橫幅（Banner） */}
      {showCompletionDialog && (
        <div className="fixed top-0 left-1/2 z-50 transform -translate-x-1/2 w-full max-w-4xl mx-auto px-4">
          <div className="bg-primary-50 border border-primary-200 rounded-xl shadow-lg p-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-start justify-center w-12 h-12 bg-primary-100 rounded-full pt-1">
                <CheckCircle2 className="text-primary-600" size={24} />
              </div>
              <div>
                <div className="font-semibold text-dark-900">調查階段完成!</div>
                <div className="text-sm text-dark-600">你已收集到所有重要線索。現在可以前往下一階段整理，或繼續調查。</div>
              </div>
            </div>

              <div className="flex items-start gap-3">
              <button
                onClick={() => {
                  console.log('[S3] User chose to proceed to S4');
                  actions.goToStage("S4");
                  missionActions.goToStage("S4");
                  setShowCompletionDialog(false);
                }}
                className="px-5 py-2.5 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all"
              >
                <ChevronRight size={16} />
                前往整理資料
              </button>

              <button
                onClick={() => {
                  console.log('[S3] User chose to continue investigating (stay in S3)');
                  // 明確回到 S3 並關閉橫幅，避免意外跳轉
                  actions.goToStage("S3");
                  missionActions.goToStage("S3");
                  setShowCompletionDialog(false);
                }}
                className="px-4 py-2 bg-white text-dark-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-all"
              >
                繼續調查
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 筆記本組件 */}
      <Notebook />
    </div>
  );
}
