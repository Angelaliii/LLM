import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';
import { useMissionStore } from '../../store/useMissionStore';
import { getMissionById } from '../../data/missions';
import { matchKeywords } from '../../config/keywords';
import { streamChatViaBackend } from '../../services/llmClient';
import { Send, BookOpen, AlertCircle, Loader } from 'lucide-react';
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

export default function S3_GuidedInquiry() {
  const { selectedNpcId, conversationsByPersona, actions } = useChatStore();
  const { currentMissionId, currentStageIndex, actions: missionActions } = useMissionStore();
  const { collectedClues, informationGaps, actions: notebookActions } = useNotebookStore();
  const mission = currentMissionId ? getMissionById(currentMissionId) : null;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [npcData, setNpcData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 防禦性檢查：如果缺少必要狀態，立即重定向到 S0
  useEffect(() => {
    if (!currentMissionId) {
      console.warn('[S3] Missing missionId, redirecting to S0');
      actions.goToStage("S0");
      missionActions.resetMission();
      return;
    }
    if (!mission) {
      console.warn('[S3] Mission not found for ID:', currentMissionId);
      actions.goToStage("S0");
      missionActions.resetMission();
      return;
    }
  }, [currentMissionId, mission, actions, missionActions]);

  // NPC 資料對應表
  const npcMap: Record<string, any> = {
    'police_officer': {
      id: 'police_officer',
      name: '佐藤敬一',
      role: '日本基層警察',
      avatar: '/assets/images/police.png',
      color: 'from-slate-700 to-slate-900'
    },
    'student': {
      id: 'student',
      name: '小清',
      role: '公學校學生',
      avatar: '/assets/images/student.png',
      color: 'from-emerald-600 to-emerald-800'
    },
    'land_surveyor': {
      id: 'land_surveyor',
      name: '山本勘助',
      role: '土地測量員',
      avatar: '/assets/images/Cadastral_surveyor.png',
      color: 'from-amber-700 to-amber-900'
    }
  };

  // 初始化：載入對話歷史或創建新的
  useEffect(() => {
    if (!selectedNpcId || !mission) return;

    // 初始化筆記本（僅在未初始化時執行）
    if (currentMissionId && Object.keys(informationGaps).length === 0) {
      notebookActions.initializeGaps(currentMissionId);
      console.log('📚 [S3] Initializing notebook for first time');
    }

    const npc = npcMap[selectedNpcId];
    setNpcData(npc);

    // 檢查是否已有現存對話
    const existingConversation = conversationsByPersona?.[selectedNpcId];
    if (existingConversation && existingConversation.length > 0) {
      // 轉換 Message 類型：assistant -> npc, timestamp Date -> string
      const convertedMessages = existingConversation.map(msg => ({
        ...msg,
        role: msg.role === 'assistant' ? 'npc' as const : msg.role as 'user' | 'npc' | 'system',
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString('zh-TW') : msg.timestamp
      }));
      setMessages(convertedMessages);
    } else {
      // 建立初始訊息
      const initMessages: Message[] = [
        {
          id: `msg_0`,
          role: 'system',
          content: `已連接至 ${npc?.name} 的知識庫。正在載入背景資料...`,
          timestamp: new Date().toLocaleTimeString('zh-TW')
        }
      ];
      setMessages(initMessages);

      // 非同步調用後端 API 獲取初始訊息
      initializeConversation(npc, mission);
    }
  }, [selectedNpcId, mission]);

  // 初始化對話：向後端請求第一條 NPC 訊息
  const initializeConversation = async (npc: any, mission: any) => {
    setIsLoading(true);
    
    console.log(`🔄 [S3] Initializing conversation:`, {
      npc: npc?.id,
      npcName: npc?.name,
      mission: mission?.id,
      missionTitle: mission?.title,
      selectedNpcId,
      currentMissionId
    });
    
    // 驗證必要參數
    if (!selectedNpcId) {
      console.error('❌ [S3] selectedNpcId is missing');
      setIsLoading(false);
      return;
    }
    if (!currentMissionId) {
      console.error('❌ [S3] currentMissionId is missing');
      setIsLoading(false);
      return;
    }
    
    try {
      // 使用有效的初始化訊息而不是空字符串
      const initPrompt = `請開始與 ${npc.name} 的對話，為任務「${mission.title}」提供背景介紹。`;
      console.log(`📝 [S3] Sending init prompt: "${initPrompt}"`);
      
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
            setMessages(prev => [...prev, newMessage]);
            setIsLoading(false);
          },
          onError: (error) => {
            console.error('Failed to initialize conversation:', error);
            const errorMsg: Message = {
              id: `msg_err_${Date.now()}`,
              role: 'system',
              content: '無法連接 NPC 知識庫。請檢查後端服務。',
              timestamp: new Date().toLocaleTimeString('zh-TW')
            };
            setMessages(prev => [...prev, errorMsg]);
            setIsLoading(false);
          }
        }
      });
    } catch (error) {
      console.error('Error initializing conversation:', error);
      setIsLoading(false);
    }
  };

  // 自動滾動到最新訊息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 發送訊息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedNpcId) return;

    // 添加使用者訊息
    const userMessage: Message = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('zh-TW')
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 調用後端 API
      await streamChatViaBackend(inputValue, {
        npcId: selectedNpcId,
        missionId: currentMissionId,
        handlers: {
          onComplete: (response) => {
            const npcMessage: Message = {
              id: `msg_npc_${Date.now()}`,
              role: 'npc',
              content: response,
              timestamp: new Date().toLocaleTimeString('zh-TW')
            };
            setMessages(prev => [...prev, npcMessage]);
            
            // 檢測並添加線索
            detectAndAddClues(response, npcData?.name || 'NPC', inputValue);
            
            // 更新 store 中的對話歷史
            const updatedConversation = [...messages, userMessage, npcMessage];
            actions.updateConversation(selectedNpcId, updatedConversation as any);
            
            setIsLoading(false);
          },
          onError: (error) => {
            console.error('Chat error:', error);
            const errorMsg: Message = {
              id: `msg_err_${Date.now()}`,
              role: 'system',
              content: '無法取得回覆。請重試。',
              timestamp: new Date().toLocaleTimeString('zh-TW')
            };
            setMessages(prev => [...prev, errorMsg]);
            setIsLoading(false);
          }
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  // 檢測對話中的線索並自動添加到筆記本
  const detectAndAddClues = (npcMessage: string, npcName: string, userQuestion: string) => {
    const { categories, matches } = matchKeywords(npcMessage || '');
    const clues: Array<any> = [];

    // 根據匹配到的類別生成線索
    if (categories.includes('law')) {
      clues.push({ text: '六三法', type: 'fact' as const, source: npcName, relatedGapId: 'gap_1' });
    }

    if (categories.includes('government')) {
      clues.push({ text: '警察制度', type: 'fact' as const, source: npcName, relatedGapId: 'gap_2' });
    }

    // 檢查已收集的線索，避免重複添加
    const existingClueTexts = new Set(
      Object.values(collectedClues).map(clue => clue.text)
    );

    // 過濾掉已存在的線索
    const newClues = clues.filter(clue => !existingClueTexts.has(clue.text));

    if (newClues.length > 0) {
      newClues.forEach(clueData => notebookActions.addClue(clueData));
      console.log(`✨ [S3] Added ${newClues.length} new clues from ${npcName}`);
    } else {
      console.log(`ℹ️ [S3] No new clues to add (duplicates filtered)`);
    }

    // 同步寫入 mission store 的 stageProgress（如果有匹配到關鍵字）
    if (matches.length > 0 && mission && typeof currentStageIndex === 'number') {
      const stageId = mission.stages?.[currentStageIndex]?.id || mission.stages?.[0]?.id || 'stage_1_intro';
      try {
        missionActions.updateStageProgress(stageId, matches);
        console.log(`📈 [S3] Updated mission stage progress for ${stageId}:`, matches);
      } catch (e) {
        console.warn('[S3] Failed to update stage progress', e);
      }
    }
  };

  // 處理智能追問選擇
  const handlePromptChipClick = (prompt: string, level: string) => {
    setInputValue(prompt);
    // 可以選擇自動發送或讓用戶確認
    // handleSendMessage();
  };

  if (!mission || !selectedNpcId || !npcData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-primary-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">無法載入對話</p>
          <button
            onClick={() => {
              // 同步重置兩個 stores
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-primary-50 flex flex-col">
      <StageNavigation currentStage="S3" />
      {/* 頂部資訊欄 */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container-max px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {npcData.avatar && (
              <img
                src={npcData.avatar}
                alt={npcData.name}
                className="w-10 h-10 rounded-full border-2 border-primary-400"
              />
            )}
            <div>
              <h2 className="font-bold text-dark-900">{npcData.name}</h2>
              <p className="text-xs text-dark-600">{npcData.role}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                actions.goToStage("S2");
                missionActions.goToStage("S2");
              }}
              className="px-4 py-2 text-sm font-semibold text-dark-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              更換調查對象
            </button>
            <button
              onClick={() => {
                actions.goToStage("S4");
                missionActions.goToStage("S4");
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              完成調查
            </button>
          </div>
        </div>
      </header>

      {/* 訊息列表 */}
      <div className="flex-1 overflow-y-auto container-max px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} npcName={npcData.name} />
            ))}
          </AnimatePresence>

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
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm sticky bottom-0 z-30">
        <div className="container-max px-6 py-6">
          <div className="max-w-3xl mx-auto">
            {/* 智能追問引導 */}
            <PromptChips
              lastNpcMessage={messages[messages.length - 1]?.role === 'npc' ? messages[messages.length - 1]?.content : ''}
              lastUserMessage={messages[messages.length - 2]?.role === 'user' ? messages[messages.length - 2]?.content : ''}
              conversationHistory={messages.map(m => ({ role: m.role, content: m.content }))}
              npcName={npcData.name}
              missionId={currentMissionId || 'E2'}
              onChipClick={handlePromptChipClick}
              disabled={isLoading}
            />
            
            <div className="flex gap-4">
              <div className="flex-1 flex gap-2">
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
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                    inputValue.trim() && !isLoading
                      ? 'bg-primary-500 text-white hover:bg-primary-600 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                  發送
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 筆記本組件 */}
      <Notebook />
    </div>
  );
}
