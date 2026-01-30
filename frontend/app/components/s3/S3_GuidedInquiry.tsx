import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
import MissionSuccessModal from '../ui/MissionSuccessModal';

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

export default function S3_GuidedInquiry() {
  const { t } = useTranslation();
  const { selectedNpcId, conversationsByPersona, actions } = useChatStore();
  const { currentMissionId, currentStageIndex, actions: missionActions } = useMissionStore();
  const { collectedClues, informationGaps, gapProgress, actions: notebookActions } = useNotebookStore();
  const mission = currentMissionId ? getMissionById(currentMissionId) : null;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializingBackground, setIsInitializingBackground] = useState(false);
  const [npcData, setNpcData] = useState<any>(null);
  const [showMissionSuccess, setShowMissionSuccess] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<PromptSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 當所有 gap 都達到 required 時顯示任務完成 modal（只要顯示一次）
  useEffect(() => {
    if (!gapProgress) return;
    const entries = Object.values(gapProgress);
    if (entries.length === 0) return;
    const allCompleted = entries.every(p => (p.current || 0) >= (p.required || 1));
    if (allCompleted) {
      // 小延遲讓使用者先看到最新畫面再跳出 modal
      const t = setTimeout(() => setShowMissionSuccess(true), 400);
      return () => clearTimeout(t);
    }
  }, [gapProgress]);

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
      name: t('s2.police_officer_name'),
      role: t('s2.police_officer_role'),
      avatar: '/assets/images/police.png',
      color: 'from-slate-700 to-slate-900'
    },
    'student': {
      id: 'student',
      name: t('s2.student_name'),
      role: t('s2.student_role'),
      avatar: '/assets/images/student.png',
      color: 'from-emerald-600 to-emerald-800'
    },
    'land_surveyor': {
      id: 'land_surveyor',
      name: t('s2.land_surveyor_name'),
      role: t('s2.land_surveyor_role'),
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

    // 🔄 切換 NPC 時清空舊的 suggestions
    setCurrentSuggestions([]);
    console.log(`🔄 Switched to NPC: ${selectedNpcId}, cleared suggestions`);

    // 若是透過 S5 的重新啟動導向（sessionStorage.initial-stage）進入，
    // 強制清除儲存記錄以避免舊訊息短暫閃現
    const initialStageFlag = sessionStorage.getItem('initial-stage');
    if (initialStageFlag) {
      console.log('[S3] Detected initial-stage flag, clearing stored conversation for', selectedNpcId);
      try {
        actions.updateConversation(selectedNpcId, [] as any);
      } catch (e) {
        console.warn('[S3] Failed to clear stored conversation', e);
      }
      sessionStorage.removeItem('initial-stage');
      setMessages([]);
      setIsInitializingBackground(true);
      initializeConversation(npc, mission);
      return;
    }

    // 從 store 讀取該 NPC 的對話記錄
    const existingConversation = conversationsByPersona?.[selectedNpcId];
    if (existingConversation && existingConversation.length > 0) {
      // 轉換 Message 類型：assistant -> npc, timestamp Date -> string,並載入該 NPC 的對話
      const convertedMessages = existingConversation.map(msg => ({
        ...msg,
        role: msg.role === 'assistant' ? 'npc' as const : msg.role as 'user' | 'npc' | 'system',
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString('zh-TW') : msg.timestamp
      }));
      setMessages(convertedMessages);
    } else {
      // 該 NPC 沒有對話記錄,清空並初始化
      setMessages([]);
      // 顯示 header badge 樣式的載入中狀態（不放入訊息流）
      setIsInitializingBackground(true);

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
      const initPrompt = t('s3.init_prompt', { npcName: npc.name, missionTitle: mission.title });
      console.log(`📝 [S3] Sending init prompt: "${initPrompt}"`);
      
      await streamChatViaBackend(initPrompt, {
        npcId: selectedNpcId,
        missionId: currentMissionId,
        handlers: {
          onSuggestions: (suggestions) => {
            // 🎯 初始化時也要更新 suggestions
            console.log(`✅ Updated suggestions (init) for ${selectedNpcId}:`, suggestions);
            setCurrentSuggestions(suggestions);
          },
          onComplete: (response) => {
            const newMessage: Message = {
              id: `msg_init_${Date.now()}`,
              role: 'npc',
              content: response,
              timestamp: new Date().toLocaleTimeString('zh-TW')
            };

            // 將 NPC 回覆加入訊息流
            const initialMessages = [newMessage];
            setMessages(initialMessages);
            
            // 🔑 關鍵：將初始對話也存入 store
            actions.updateConversation(selectedNpcId, initialMessages as any);

            // 關閉初始化 badge
            setIsInitializingBackground(false);
            setIsLoading(false);
          },
          onError: (error) => {
            console.error('Failed to initialize conversation:', error);
            const errorMsg: Message = {
              id: `msg_err_${Date.now()}`,
              role: 'system',
              content: t('s3.connection_error'),
              timestamp: new Date().toLocaleTimeString('zh-TW')
            };

            // 將錯誤訊息加入訊息流，並關閉初始化 badge
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

  // 自動滾動到最新訊息（確保在 DOM 更新後執行）
  useEffect(() => {
    // 使用 requestAnimationFrame 確保在下一次繪製時執行，避免因為狀態未完全更新導致捲動失敗
    const raf = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => cancelAnimationFrame(raf);
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

    // 更新本地訊息
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // 調用後端 API
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
            
            // 檢測並添加線索
            detectAndAddClues(response, npcData?.name || 'NPC', inputValue);
            
            // 🔑 關鍵：將完整對話記錄存入 store,按 NPC ID 分別保存
            actions.updateConversation(selectedNpcId, finalMessages as any);
            
            setIsLoading(false);
          },
          onError: (error) => {
            console.error('Chat error:', error);
            const errorMsg: Message = {
              id: `msg_err_${Date.now()}`,
              role: 'system',
              content: t('s3.response_error'),
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
          <p className="text-xl text-gray-600 mb-4">{t('s3.failed_load')}</p>
          <button
            onClick={() => {
              // 同步重置兩個 stores
              actions.goToStage("S0");
              missionActions.resetMission();
            }}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            {t('s3.back_to_missions')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-white to-primary-50 flex flex-col">
      <StageNavigation currentStage="S3" />
      {/* 頂部資訊欄 */}
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-md z-30 shadow-sm mt-4">
        <div className="container-max px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {npcData.avatar && (
              <img
                src={npcData.avatar}
                alt={npcData.name}
                className="w-12 h-12 rounded-full border-2 border-primary-400 shadow-md"
              />
            )}
            <div>
              <h2 className="font-bold text-lg text-dark-900">{npcData.name}</h2>
              <p className="text-sm text-dark-600">{npcData.role}</p>
              {isInitializingBackground && (
                <div className="inline-flex items-center gap-2 mt-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  <Loader className="animate-spin text-gray-600" size={14} />
                  <span>{t('s3.loading_background')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                actions.goToStage("S2");
                missionActions.goToStage("S2");
              }}
              className="px-5 py-2.5 text-sm font-semibold text-dark-700 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 shadow-sm hover:shadow"
            >
              {t('s3.change_target')}
            </button>
            {/* 開發用清除按鈕已移除；請使用命令列工具執行資料清除 */}
          </div>
        </div>
      </header>

      {/* 訊息列表：加入 min-h-0 使 flex 子元素可正確收縮並啟用內部滾動 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <span>{t('s3.thinking', { npcName: npcData.name })}</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 輸入區域 */}
      <div className="border-t border-gray-200 bg-white/90 backdrop-blur-md sticky bottom-0 z-30 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            {/* 智能追問引導 */}
            <PromptChips
              suggestions={currentSuggestions}
              onChipClick={handlePromptChipClick}
              disabled={isLoading}
            />
            
            <div className="flex gap-3">
              <div className="flex-1 flex gap-3">
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
                  placeholder={t('s3.input_placeholder')}
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
                  {t('s3.send')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 筆記本組件 */}
      {showMissionSuccess && (
        <MissionSuccessModal
          npcName={npcData?.name || 'NPC'}
          onClose={() => setShowMissionSuccess(false)}
          onContinue={() => {
            setShowMissionSuccess(false);
            // 同步導航到 S4
            actions.goToStage('S4');
            missionActions.goToStage('S4');
          }}
        />
      )}

      <Notebook />
    </div>
  );
}
