import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';
import { useMissionStore } from '../../store/useMissionStore';
import { useNotebookStore } from '../../store/useNotebookStore';
import { getMissionById } from '../../data/missions';
import { CheckCircle2, XCircle, HelpCircle, Database, ArrowRight, ArrowLeft } from 'lucide-react';
import DraggableClue from './subcomponents/DraggableClue';
import DropZone from './subcomponents/DropZone';
import './s4.css';
import StageNavigation from '../ui/StageNavigation';

// S4 任務配置
interface ArchiveField {
  id: string;
  label: string;
  correctText: string;
  correctClueId: string;
}

interface ClueCard {
  id: string;
  text: string;
  type: 'key' | 'info';
  source: string;
}

export default function S4_ArchiveRepair() {
  const { selectedNpcId, actions } = useChatStore();
  const { currentMissionId, actions: missionActions } = useMissionStore();
  const { informationGaps, collectedClues } = useNotebookStore();
  const mission = currentMissionId ? getMissionById(currentMissionId) : null;

  // 從筆記本獲取線索並轉換格式
  const clues: ClueCard[] = React.useMemo(() => {
    const notebookClues = Object.values(collectedClues);
    if (notebookClues.length === 0) {
      // 如果沒有收集到線索，提供預設線索
      return [
        { id: 'clue_A', text: '《治安警察法》', type: 'key', source: '林小清 (學生)' },
        { id: 'clue_B', text: '蔣渭水', type: 'key', source: '陳記者 (報導)' },
        { id: 'clue_C', text: '田健治郎', type: 'key', source: '總督府公告' },
        { id: 'clue_err1', text: '六三法', type: 'info', source: '歷史資料庫' },
        { id: 'clue_err2', text: '林獻堂', type: 'info', source: '議會請願書' },
      ];
    }
    
    return notebookClues.map(clue => ({
      id: clue.id,
      text: clue.text,
      type: clue.type === 'fact' ? 'key' as const : 'info' as const,
      source: clue.source
    }));
  }, [collectedClues]);

  // 根據收集到的線索動態生成字段配置
  const [fields, setFields] = useState<ArchiveField[]>(() => {
    const keyClues = Object.values(collectedClues).filter(clue => clue.type === 'fact');
    
    if (keyClues.length === 0) {
      // 預設配置
      return [
        {
          id: 'field_1',
          label: '法律名稱',
          correctText: '《治安警察法》',
          correctClueId: 'clue_A'
        },
        {
          id: 'field_2',
          label: '核心人物',
          correctText: '蔣渭水',
          correctClueId: 'clue_B'
        },
        {
          id: 'field_3',
          label: '當時總督',
          correctText: '田健治郎',
          correctClueId: 'clue_C'
        }
      ];
    }

    // 基於收集的線索生成字段
    return keyClues.slice(0, 3).map((clue, index) => ({
      id: `field_${index + 1}`,
      label: `資料${index + 1}`,
      correctText: clue.text,
      correctClueId: clue.id
    }));
  });

  // 初始化欄位狀態，根據實際的 fields 動態建立 key
  const makeInitialFieldStates = (flds: ArchiveField[]) => {
    return flds.reduce((acc, f) => {
      acc[f.id] = { status: 'empty' };
      return acc;
    }, {} as Record<string, { status: 'empty' | 'filled'; filledBy?: string }>);
  };

  const [fieldStates, setFieldStates] = useState<Record<string, { status: 'empty' | 'filled'; filledBy?: string }>>(() =>
    makeInitialFieldStates(fields)
  );

  // Safe accessor for field state to avoid reading undefined when `fields` updates
  const getFieldState = (id?: string) => {
    if (!id) return { status: 'empty' } as { status: 'empty' };
    return fieldStates[id] ?? { status: 'empty' } as { status: 'empty' | 'filled' };
  };

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const autoProgressedRef = useRef(false); // 使用 ref 避免 re-render 干擾

  // 計算進度（以 fields 為準，確保欄位數與狀態同步）
  const filledCount = fields.filter(f => fieldStates[f.id]?.status === 'filled').length;
  const totalCount = fields.length || 1;
  const progress = Math.round((filledCount / Math.max(totalCount, 1)) * 100);

  // 處理拖曳結束
  const handleDragEnd = (event: any, clue: ClueCard, fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    // 更靈活的驗證邏輯：匹配線索ID或內容
    const isCorrect = clue.id === field.correctClueId || 
                     clue.text.includes(field.correctText) ||
                     field.correctText.includes(clue.text);

    if (isCorrect) {
      setFieldStates(prev => ({
        ...prev,
        [fieldId]: { status: 'filled', filledBy: clue.id }
      }));
      setFeedback({ type: 'success', msg: '修復成功！資料吻合。' });
      
      // 如果這是筆記本線索，標記為已使用
      if (collectedClues[clue.id]) {
        console.log(`筆記本線索 ${clue.id} 已成功用於修復`);
      }
    } else {
      setFeedback({ type: 'error', msg: '錯誤：證據與缺漏處不符。請嘗試其他線索。' });
      triggerErrorEffect(fieldId);
    }

    setTimeout(() => setFeedback(null), 3000);
  };

  // 全域 drop 事件監聽（由 DropZone 發送），以處理 HTML5 dataTransfer 降落情況
  useEffect(() => {
    const onDropEvent = (e: Event) => {
      const ev = e as CustomEvent<{ fieldId: string; clueId: string }>;
      const { fieldId, clueId } = ev.detail || {};
      if (!fieldId || !clueId) return;

      const clue = clues.find(c => c.id === clueId);
      if (!clue) return;

      // 將 isDragging 狀態復原並處理結果
      setIsDragging(false);
      handleDragEnd(null, clue, fieldId);
    };

    window.addEventListener('s4-drop', onDropEvent as EventListener);
    return () => window.removeEventListener('s4-drop', onDropEvent as EventListener);
  }, [clues, fieldStates]);

  const triggerErrorEffect = (fieldId: string) => {
    const el = document.getElementById(`dropzone-${fieldId}`);
    if (el) {
      el.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(0)' }
        ],
        { duration: 300 }
      );
    }
  };

  const handleReset = () => {
    setFieldStates(makeInitialFieldStates(fields));
    setFeedback(null);
  };

  const handleComplete = () => {
    if (progress === 100) {
      // 只調用 missionActions，它會自動同步到 ChatStore
      console.info('[S4] handleComplete triggered - progress=100, goToStage S5');
      try {
        missionActions.goToStage("S5");
        console.info('[S4] ✅ called missionStore.actions.goToStage("S5")');
      } catch (e) {
        console.warn('[S4] ❌ missionStore.actions.goToStage failed', e);
      }
    }
  };

  // 當進度達成 100%，自動播放蓋章動畫並在短延遲後進入 S5
  useEffect(() => {
    console.info('[S4] useEffect triggered - progress:', progress, 'autoProgressedRef.current:', autoProgressedRef.current);
    
    if (progress === 100 && !autoProgressedRef.current) {
      console.info('[S4] ✅ Setting up auto-transition timer (800ms)');
      autoProgressedRef.current = true;
      
      // 等動畫顯示一段時間後自動跳轉（800ms 讓用戶看到完成動畫）
      const t = setTimeout(() => {
        // 進入 S5（測驗）- 只調用 missionActions，它會自動同步到 ChatStore
        console.info('[S4] ⏰ auto-transition timeout reached, goToStage S5');
        try {
          missionActions.goToStage("S5");
          console.info('[S4] ✅ called missionStore.actions.goToStage("S5")');
        } catch (e) {
          console.warn('[S4] ❌ missionStore.actions.goToStage failed', e);
        }
      }, 800);

      return () => {
        console.info('[S4] Clearing auto-transition timer');
        clearTimeout(t);
      };
    }
  }, [progress, actions, missionActions]);

  if (!mission) {
    console.warn('[S4] Mission not found. currentMissionId:', currentMissionId);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-primary-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">無法載入任務</p>
          <p className="text-sm text-gray-500 mb-6">
            {currentMissionId ? `無法找到任務: ${currentMissionId}` : '未選擇任何任務'}
          </p>
          <button
            onClick={() => {
              actions.goToStage("S0");
              missionActions.resetMission();
            }}
            className="btn-primary"
          >
            返回任務列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-amber-200 overflow-hidden relative flex flex-col">
      <StageNavigation currentStage="S4" />
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] opacity-30 pointer-events-none" />

      {/* 返回按鈕（左上角） */}
      <button
        onClick={() => actions.goBack()}
        className="fixed top-6 left-6 z-30 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-md transition-all text-stone-600 hover:text-stone-800 border border-stone-200"
        aria-label="返回上一頁"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium hidden sm:inline">返回</span>
      </button>

      {/* 頂部導航 */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-stone-200 flex items-center justify-between px-8 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center text-amber-50 shadow-lg">
            <Database size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-stone-800">ARCHIVE REPAIR</h1>
            <p className="text-[10px] text-stone-500 font-mono">S4 / DRAG EVIDENCE TO RESTORE</p>
          </div>
        </div>

        {/* 進度與狀態 */}
        <div className="flex items-center gap-6">
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm ${
                feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {feedback.msg}
            </motion.div>
          )}

          <div className="flex flex-col items-end">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Integrity</div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-700"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                />
              </div>
              <span className="text-sm font-bold font-mono text-stone-700">{progress}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主工作區 */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        {/* 左側：待修復檔案 */}
        <div className="lg:col-span-8 flex flex-col">
          <motion.div
            layout
            className="bg-white rounded-sm shadow-xl border border-stone-100 min-h-[600px] p-12 relative overflow-hidden"
          >
            {/* 紙張質感 */}
            <div className="absolute inset-0 bg-stone-50 opacity-50 mix-blend-multiply pointer-events-none" />

            {/* 檔案 Header */}
            <div className="border-b-2 border-stone-800 pb-4 mb-8 flex justify-between items-end relative z-10">
              <h2 className="text-3xl font-serif font-bold text-stone-900">日治初期：權利與土地報告</h2>
              <div className="text-xs font-mono text-stone-500">CONFIDENTIAL // REPAIR_MODE</div>
            </div>

            {/* 檔案內容 */}
            <div className="font-serif text-xl leading-[2.5] text-stone-700 relative z-10">
              <div>
                檔案編號：LAW-1905-SIXCODES
                <br />
                在日治初期，日本總督府透過
                <DropZone
                  fieldId={fields[0]?.id ?? 'field_1'}
                  status={getFieldState(fields[0]?.id).status}
                  config={fields[0]}
                  highlight={isDragging && getFieldState(fields[0]?.id).status === 'empty'}
                />
                等法律工具，對臺灣進行深入的制度改造。
                <br />
                <br />
                其中，
                <DropZone
                  fieldId={fields[1]?.id ?? 'field_2'}
                  status={getFieldState(fields[1]?.id).status}
                  config={fields[1]}
                  highlight={isDragging && getFieldState(fields[1]?.id).status === 'empty'}
                />
                成為推行土地調查與權力控制的關鍵群體，對當時臺灣社會的基層結構造成了深遠的影響。
              </div>
            </div>

            {/* 修復完成印章 */}
            <AnimatePresence>
              {progress === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 2, rotate: 20 }}
                  animate={{ opacity: 1, scale: 1, rotate: -12 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="absolute bottom-16 right-16 border-4 border-red-800/80 text-red-800 rounded-full w-40 h-40 flex items-center justify-center p-2 mix-blend-multiply opacity-80"
                >
                  <span className="text-xs font-serif font-bold text-center leading-none uppercase tracking-widest">
                    Restoration<br />
                    Complete<br />
                    ✓
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* 右側：證據卡片集合 */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg border border-stone-100 p-6 shadow-lg"
          >
            <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
              <HelpCircle size={20} className="text-amber-600" />
              筆記本：收集的線索
              <span className="ml-auto text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded">
                {Object.keys(collectedClues).length} 條線索
              </span>
            </h3>

            {Object.keys(collectedClues).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>尚未收集任何線索</p>
                <p className="text-sm mt-1">請先完成 S1-S3 階段收集線索</p>
              </div>
            )}

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {clues
                  .filter(clue => !Object.values(fieldStates).some(f => f.filledBy === clue.id))
                  .map((clue, index) => (
                    <DraggableClue
                      key={clue.id}
                      clue={clue}
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={(fieldId) => {
                        setIsDragging(false);
                        handleDragEnd(null, clue, fieldId);
                      }}
                      index={index}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* 操作按鈕 */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleReset}
              className="w-full px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg transition-colors"
            >
              重置
            </button>

            <motion.button
              onClick={handleComplete}
              disabled={progress < 100}
              whileHover={progress === 100 ? { scale: 1.05 } : {}}
              whileTap={progress === 100 ? { scale: 0.95 } : {}}
              className={`w-full px-4 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                progress === 100
                  ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>
                {progress === 100 ? '檔案修復完成 - 進入S5' : `進度 ${progress}%`}
              </span>
              {progress === 100 && <ArrowRight size={18} />}
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}
